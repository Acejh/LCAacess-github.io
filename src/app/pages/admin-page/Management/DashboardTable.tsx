import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import numeral from 'numeral';
import axios from "axios";

type ItemLcaSummary = {
  no: number;
  midItemName: string;
  emissionWithoutBenefit: number;
  emissionWithBenefit: number;
  refEmissionScenario: number;
  reductionEffect: number;
};

type CompanyLcaSummary = {
  no: number;
  companyName: string;
  emissionWithoutBenefit: number;
  emissionWithBenefit: number;
  reductionEffect: number;
};

export const DashboardTable = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<string>(`${currentYear - 1}`);
  const [loading, setLoading] = useState(false);
  const [itemData, setItemData] = useState<ItemLcaSummary[]>([]);
  const [companyData, setCompanyData] = useState<CompanyLcaSummary[]>([]);
  const [activeTable, setActiveTable] = useState<"item" | "company">("item");

  // API 호출 함수
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://lcaapi.acess.co.kr/LcaResults/summary?year=${year}`
      );
      setItemData(response.data.itemLcaSummaries || []);
      setCompanyData(response.data.companyLcaSummaries || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 테이블 데이터 렌더링
  const renderTable = () => {
    if (loading) {
      return (
        <TableBody>
          <TableRow>
            <TableCell colSpan={5} style={{ textAlign: "center" }}>
              <CircularProgress />
            </TableCell>
          </TableRow>
        </TableBody>
      );
    }
  
    // 데이터 타입에 따라 분기 처리
    if (activeTable === "item" && itemData.length > 0) {
      return (
        <TableBody>
          {itemData.map((row) => (
            <TableRow key={row.no}>
              <TableCell>{row.midItemName}</TableCell>
              <TableCell align="right">
                {numeral(row.emissionWithoutBenefit).format("0.0000000000")}
              </TableCell>
              <TableCell align="right">
                {numeral(row.emissionWithBenefit).format("0.0000000000")}
              </TableCell>
              <TableCell align="right">
                {numeral(row.refEmissionScenario).format("0.0000000000")}
              </TableCell>
              <TableCell align="right">
                {numeral(row.reductionEffect).format("0.0000000000")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      );
    }
  
    if (activeTable === "company" && companyData.length > 0) {
      return (
        <TableBody>
          {companyData.map((row) => (
            <TableRow key={row.no}>
              <TableCell>{row.companyName}</TableCell>
              <TableCell align="right">
                {numeral(row.emissionWithoutBenefit).format("0.0000000000")}
              </TableCell>
              <TableCell align="right">
                {numeral(row.emissionWithBenefit).format("0.0000000000")}
              </TableCell>
              <TableCell align="right">
                {numeral(row.reductionEffect).format("0.0000000000")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      );
    }
  
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={5} style={{ textAlign: "center", color: "red" }}>
            데이터가 없습니다.
          </TableCell>
        </TableRow>
      </TableBody>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* 드롭다운과 버튼 */}
      <div style={{ display: "flex", marginBottom: "20px", alignItems: "center" }}>
        <FormControl style={{ marginRight: "10px" }}>
          <InputLabel>연도</InputLabel>
          <Select
            value={year}
            label= "연도"
            onChange={(e) => setYear(e.target.value)}
            style={{ width: "100px" }}
          >
            {Array.from({ length: 5 }, (_, index) => currentYear - index).map((y) => (
              <MenuItem key={y} value={y.toString()}>
                {y}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={() => setActiveTable("item")}
          style={{ marginRight: "10px" }}
        >
          제품별 LCA 결과값
        </Button>
        <Button variant="contained" onClick={() => setActiveTable("company")}>
          사업회원별 LCA 결과값
        </Button>
      </div>
      {/* 테이블 */}
      <TableContainer 
        component={Paper}
        style={{ maxHeight: 600, overflowY: 'auto'}}
        className="custom-scrollbar custom-table"
      >
        <Table>
        <TableHead>
          <TableRow>
            {activeTable === "item" ? (
              <>
                <TableCell
                  style={{
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: "center",
                    backgroundColor: "#cfcfcf",
                    position: "sticky",
                    top: -2,
                    zIndex: 1,
                  }}
                >
                  분석 대상
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: "center",
                    backgroundColor: "#cfcfcf",
                    position: "sticky",
                    top: -2,
                    zIndex: 1,
                  }}
                >
                  without benefit<br />(kg CO₂-Eq) (B)
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: "center",
                    backgroundColor: "#cfcfcf",
                    position: "sticky",
                    top: -2,
                    zIndex: 1,
                  }}
                >
                  with benefit<br />(kg CO₂-Eq) (A)
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: "center",
                    backgroundColor: "#cfcfcf",
                    position: "sticky",
                    top: -2,
                    zIndex: 1,
                  }}
                >
                  냉매 배출 시나리오<br />(kg CO₂-Eq) (C)
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: "center",
                    backgroundColor: "#cfcfcf",
                    position: "sticky",
                    top: -2,
                    zIndex: 1,
                  }}
                >
                  탄소배출 저감효과<br />(A-B-C)
                </TableCell>
              </>
            ) : (
              <>
                <TableCell
                  style={{
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: "center",
                    backgroundColor: "#cfcfcf",
                    position: "sticky",
                    top: -2,
                    zIndex: 1,
                  }}
                >
                  업체 명
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: "center",
                    backgroundColor: "#cfcfcf",
                    position: "sticky",
                    top: -2,
                    zIndex: 1,
                  }}
                >
                  without benefit<br />(kg CO₂-Eq) (B)
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: "center",
                    backgroundColor: "#cfcfcf",
                    position: "sticky",
                    top: -2,
                    zIndex: 1,
                  }}
                >
                  with benefit<br />(kg CO₂-Eq) (A)
                </TableCell>
                <TableCell
                  align="right"
                  style={{
                    whiteSpace: "pre-wrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    textAlign: "center",
                    backgroundColor: "#cfcfcf",
                    position: "sticky",
                    top: -2,
                    zIndex: 1,
                  }}
                >
                  탄소배출 저감효과<br />(A-B)
                </TableCell>
              </>
            )}
          </TableRow>
        </TableHead>
          {renderTable()}
        </Table>
      </TableContainer>
    </div>
  );
};
