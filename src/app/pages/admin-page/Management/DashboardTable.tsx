import React, { useEffect, useState, useCallback } from "react";
import { Bar } from "react-chartjs-2";
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
  const [showChart, setShowChart] = useState(false);

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
            label="연도"
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
          onClick={() => {
            setActiveTable("item");
            setShowChart(false);
          }}
          style={{ marginRight: "10px" }}
        >
          제품별 LCA 결과값
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setActiveTable("company");
            setShowChart(false);
          }}
          style={{ marginRight: "10px" }}
        >
          사업회원별 LCA 결과값
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setActiveTable("item"); 
            setShowChart(true); 
          }}
          style={{ marginRight: "10px" }}
        >
          제품별 LCA 결과 그래프
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            setActiveTable("company"); 
            setShowChart(true); 
          }}
        >
          사업회원별 LCA 결과 그래프
        </Button>
      </div>
      {/* 테이블 */}
      <div>
        {showChart ? (
          <div style={{ position: "relative", width: "100%", overflowX: "auto", overflowY: "hidden" }}>
          {/* 그래프 위 고정 텍스트 */}
          <div
            style={{
              position: "sticky",
              top: 0, // 부모 컨테이너의 최상단에 고정
              left: 0,
              right: 0,
              zIndex: 1000,
              textAlign: "center",
              fontSize: "20px",
              fontWeight: "bold",
              color: "#333",
              backgroundColor: "rgba(255, 255, 255, 0.9)", // 배경색으로 텍스트 가독성 향상
              padding: "10px 0",
            }}
          >
            {activeTable === "item" ? "제품별 LCA 결과값" : "사업회원별 LCA 결과값"}
          </div>
          
          {/* 그래프 컨테이너 */}
          <div
            style={{
              width: "100%",
              height: "555px",
              overflowX: "auto", // 가로 스크롤 활성화
              overflowY: "hidden", // 세로 스크롤 비활성화
            }}
          >
            <div
              style={{
                width: `${Math.max(itemData.length, companyData.length) * 150}px`, // 데이터 개수 기반 너비 설정
                height: "100%",
              }}
            >
              <Bar
                data={{
                  labels: activeTable === "item"
                    ? itemData.map((row) => row.midItemName.match(/.{1,10}/g)) // 10자 단위로 분할
                    : companyData.map((row) => row.companyName.match(/.{1,10}/g)), // 10자 단위로 분할
                  datasets: [
                    {
                      label: "", // 레이블 제거
                      data: activeTable === "item"
                        ? itemData.map((row) => row.reductionEffect)
                        : companyData.map((row) => row.reductionEffect),
                      backgroundColor:
                        activeTable === "item"
                          ? "rgba(75, 192, 192, 0.849)"
                          : "rgba(153, 102, 255, 0.712)",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false, // 레전드 비활성화
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        autoSkip: false, // 모든 레이블 표시
                      },
                    },
                    y: {
                      reverse: true, // 축 반전
                      ticks: {
                        callback: (value) => numeral(value).format("0.0e+0"),
                      },
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
        ) : (
          <TableContainer
            component={Paper}
            style={{ maxHeight: 600, overflowY: "auto" }}
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
                        left: -1,
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
        )}
      </div>
    </div>
  );
};
