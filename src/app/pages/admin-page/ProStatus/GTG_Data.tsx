import React, { useState, useCallback } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../ComponentBox/UseCompany';
import numeral from 'numeral';
import '../../CSS/SCbar.css';
import { CellContext } from '@tanstack/react-table';
import { SelectChangeEvent } from '@mui/material';
import {
  useReactTable,
  getCoreRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
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
  Typography,
  FormControl,
  CircularProgress,
} from '@mui/material';
import * as XLSX from 'xlsx';

type GTGData = {
  category: string;
  name: string;
  unit: string;
  amount: number;
  [key: string]: string | number; 
};

type GTGItem = {
  itemCode: string;
  amount: number;
};

type GTGResult = {
  lciItem: {
    category: string;
    name: string;
    unit: string;
  };
  amount: number;
  gtoGByItems: GTGItem[];
};

type WeightByItems = {
  itemName: string;
  ratio: number;
  totalWeight: number;
};

export function GTG_Data() {
  const [data, setData] = useState<GTGData[]>([]);
  const [weightByItems, setWeightByItems] = useState<WeightByItems[]>([]);
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchParams, setSearchParams] = useState({
    company: null as Company | null,
    year: '',
  });

  const columns: ColumnDef<GTGData>[] = [
    { accessorKey: 'category', header: '구분' },
    { accessorKey: 'name', header: '이름' },
    { accessorKey: 'unit', header: '단위' },
    { accessorKey: 'amount', header: '총값', cell: (info: CellContext<GTGData, unknown>) => numeral(info.getValue()).format('0,0') },
    ...data.length > 0
      ? Object.keys(data[0])
          .filter(key => !['category', 'name', 'unit', 'amount'].includes(key)) 
          .map(itemCode => ({
            accessorKey: itemCode,  
            header: itemCode,
            cell: (info: CellContext<GTGData, unknown>) => numeral(info.getValue()).format('0,0'),
          }))
      : [],
  ];

  const fetchGTGData = useCallback(async () => {
    if (!searchParams.company || !searchParams.year) {
      setData([]);
      setWeightByItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const url = `https://lcaapi.acess.co.kr/GToGResults?CompanyCode=${searchParams.company?.code}&Year=${searchParams.year}`;
      const response = await axios.get(url);
      const { gtoGResults, weightByItems }: { gtoGResults: GTGResult[]; weightByItems: WeightByItems[] } = response.data;

      // 데이터 변환
      const transformedData = gtoGResults.map((item: GTGResult) => {
        const baseData: GTGData = {
          category: item.lciItem.category,
          name: item.lciItem.name,
          unit: item.lciItem.unit,
          amount: item.amount,
        };

        // gtoGByItems의 itemCode와 amount를 동적으로 추가
        item.gtoGByItems.forEach((subItem: GTGItem) => {
          baseData[subItem.itemCode] = subItem.amount;
        });

        return baseData;
      });

      // weightByItems에서 itemName, ratio, totalWeight 추출
      const transformedWeightByItems = weightByItems.map((item: WeightByItems) => ({
        itemName: item.itemName,
        ratio: item.ratio,
        totalWeight: item.totalWeight,
      }));

      setData(transformedData);
      setWeightByItems(transformedWeightByItems);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching GTG data:', error);
      setLoading(false);
    }
  }, [searchParams]);

  const handleDownloadExcel = () => {
    const tableData = table.getRowModel().rows.map(row => row.original);
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GTGResults');
    XLSX.writeFile(workbook, 'GTGResults.xlsx');
  };

  const handleSearch = () => {
    setSearchParams({
      company: selectedCompany,
      year,
    });
    setLoading(true);
    fetchGTGData();
  };

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setYear(event.target.value as string);
  };

  const table = useReactTable<GTGData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        GTG 결과
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        style={{ height: '35px', marginBottom: '20px', padding: '0 10px', fontSize: '14px', display: 'none' }}
        onClick={handleDownloadExcel}
      >
        엑셀 다운로드
      </Button>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <UseCompany onCompanyChange={setSelectedCompany} showAllOption={false} />
        <FormControl style={{ marginRight: '10px' }}>
          <Select
            id="year-select"
            value={year}
            onChange={handleYearChange}
            displayEmpty
            style={{ width: '100px' }}
            sx={{ height: '45px' }}
          >
            <MenuItem value="" disabled>
              연도
            </MenuItem>
            {Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()).map(year => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleSearch}
          disabled={!selectedCompany || !year}
        >
          조회
        </Button>
      </div>
      <TableContainer
        component={Paper}
        style={{ maxHeight: 600, overflowY: 'auto', overflowX: 'auto' }} // 좌우 스크롤 추가
        className="custom-scrollbar"
      >
        <Table stickyHeader> {/* stickyHeader 속성 유지 */}
          <TableHead>
            <TableRow>
              <TableCell 
                colSpan={4} 
                style={{ 
                  textAlign: 'center', 
                  fontWeight: 'bold', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  backgroundColor: '#cfcfcf', 
                  position: 'sticky', 
                  left: 0, // 첫 번째 열이므로 left 값은 0
                  zIndex: 5,
                  width: '200px', // 처리제품의 너비 설정
                }}
              >
                처리제품
              </TableCell>
              {weightByItems.map((item, index) => (
                <TableCell 
                  key={index} 
                  style={{ 
                    textAlign: 'center', 
                    fontWeight: 'bold', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    backgroundColor: '#cfcfcf',
                    width: '200px', // 처리제품과 동일한 너비 설정
                  }}
                >
                  {item.itemName}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell 
                colSpan={4} 
                style={{ 
                  textAlign: 'center', 
                  fontWeight: 'bold', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  backgroundColor: '#cfcfcf', 
                  position: 'sticky', 
                  left: 0, // 첫 번째 열이므로 left 값은 0
                  zIndex: 5,
                  width: '200px', // 처리비율의 너비 설정
                }}
              >
                처리비율(%)
              </TableCell>
              {weightByItems.map((item, index) => (
                <TableCell 
                  key={index} 
                  style={{ 
                    textAlign: 'center', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    backgroundColor: '#cfcfcf',
                    width: '200px', // 처리비율과 동일한 너비 설정
                  }}
                >
                  {item.ratio}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell 
                colSpan={4} 
                style={{ 
                  textAlign: 'center', 
                  fontWeight: 'bold', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  backgroundColor: '#cfcfcf', 
                  position: 'sticky', 
                  left: 0, // 첫 번째 열이므로 left 값은 0
                  zIndex: 5,
                  width: '200px', // 총 처리 중량의 너비 설정
                }}
              >
                총 처리 중량(kg)
              </TableCell>
              {weightByItems.map((item, index) => (
                <TableCell 
                  key={index} 
                  style={{ 
                    textAlign: 'center', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    backgroundColor: '#cfcfcf',
                    width: '200px', // 총 처리 중량과 동일한 너비 설정
                  }}
                >
                  {item.totalWeight}
                </TableCell>
              ))}
            </TableRow>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  // 각 열에 대한 left 값을 설정
                  const leftValues = [0, 85, 260, 325]; // 각 열의 위치를 제어하기 위한 left 값
                  return (
                    <TableCell 
                      key={header.id} 
                      style={{ 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        textAlign: 'center',
                        backgroundColor: '#cfcfcf', 
                        fontWeight: 'bold',
                        position: index < 4 ? 'sticky' : 'static', // 구분, 이름, 단위, 총값 열을 고정
                        left: leftValues[index], // 각 열의 고정 위치를 설정 (배열에서 위치에 따른 값 적용)
                        width: index === 0 ? '150px' : index === 1 ? '200px' : index === 2 ? '100px' : '120px', // 각 열의 개별 너비 설정
                        zIndex: 10, // 스크롤 시 열 고정 처리
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={weightByItems.length + 3} style={{ textAlign: 'center' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell, index) => {
                    const isRightAligned = cell.column.id === 'amount' || !['category', 'name', 'unit', 'amount'].includes(cell.column.id);
                    const leftValues = [0, 85, 260, 325]; // 각 열의 위치를 제어하기 위한 left 값
            
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textAlign: isRightAligned ? 'right' : 'left',
                          position: index < 4 ? 'sticky' : 'static', // 고정해야 할 열에 대해 position 설정
                          left: leftValues[index], // 각 고정 열의 left 위치 설정 (배열에서 위치에 따른 값 적용)
                          width: index === 0 ? '150px' : index === 1 ? '200px' : index === 2 ? '100px' : '120px', // 각 열의 개별 너비 설정
                          backgroundColor: '#fff', // 고정된 셀의 배경색 설정
                          zIndex: 1, // 셀 고정 시 zIndex 설정
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={weightByItems.length + 3} style={{ textAlign: 'center', color: 'red' }}>
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
