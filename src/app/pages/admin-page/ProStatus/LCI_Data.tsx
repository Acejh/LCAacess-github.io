import React, { useState, useCallback } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../ComponentBox/UseCompany';
import numeral from 'numeral';
import '../../CSS/SCbar.css';
import { getApiUrl } from '../../../../main';
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

type GTGData = {
  category: string;
  flow: string;
  amount: number;
  functionalUnit: number;
  unit: string;
  gwp: number;
  gwpAlt: number;
  emissionWithBenefit: number;
  emissionWithoutBenefit: number;
  reductionEffect: number; 
  [key: string]: string | number;
};

type MidItem = {
  midItemCode: string;
  midItemName: string;
};

type LCAItem = {
  id: number;
  midItemCode: string;
  midItemName: string;
  amount: number;
};

type LCAResult = {
  id: number;
  year: number;
  companyCode: string;
  companyName: string;
  category: string;
  flow: string;
  amount: number;
  functionalUnit: number;
  unit: string;
  gwp: number;
  gwpAlt: number;
  emissionWithBenefit: number;
  emissionWithoutBenefit: number;
  reductionEffect: number; 
  lcaItems: LCAItem[];
};

type APIResponse = {
  midItems: MidItem[];
  lcaResults: LCAResult[];
};

export function LCI_Data() {
  const [data, setData] = useState<GTGData[]>([]);
  const [midItems, setMidItems] = useState<MidItem[]>([]);
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [downloading, setDownloading] = useState(false);

  const columns: ColumnDef<GTGData>[] = [
    { 
      id: 'category', 
      accessorKey: 'category', 
      header: '구분',
      cell: (info: CellContext<GTGData, unknown>) => <div style={{ textAlign: 'left' }}>{info.getValue() as React.ReactNode}</div>
    },
    { 
      id: 'flow', 
      accessorKey: 'flow', 
      header: 'Flow',
      cell: (info: CellContext<GTGData, unknown>) => <div style={{ textAlign: 'left' }}>{info.getValue() as React.ReactNode}</div>
    },
    { 
      id: 'amount', 
      accessorKey: 'amount', 
      header: 'SUM', 
      cell: (info: CellContext<GTGData, unknown>) => {
        const value = info.getValue();
        return Number(value) === 0 ? '-' : numeral(value).format('0,0.00000');
      }
    },
    { 
      id: 'functionalUnit', 
      accessorKey: 'functionalUnit', 
      header: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>Functional</span>
          <span style={{ whiteSpace: 'nowrap' }}>Unit</span>
        </div>
      ),
      cell: (info: CellContext<GTGData, unknown>) => {
        const value = info.getValue();
        if (typeof value === 'number' && value === 0) {
          return '-';
        }
        if (typeof value === 'number') {
          return value.toExponential(5); // 지수 표기로 변환, 소수점 이하 5자리 표시
        }
        return value; // 숫자가 아닌 경우 그대로 반환
      }
    },
    { 
      id: 'unit', 
      accessorKey: 'unit', 
      header: 'Unit',
      cell: (info: CellContext<GTGData, unknown>) => <div style={{ textAlign: 'left' }}>{info.getValue() as React.ReactNode}</div>
    },
    // 이하 GWP, 배출량 열들은 오른쪽 정렬
    { 
      id: 'gwp', 
      accessorKey: 'gwp', 
      header: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>GWP</span>
          <span style={{ whiteSpace: 'nowrap' }}>재활용 처리</span>
        </div>
      ),
      cell: (info: CellContext<GTGData, unknown>) => {
        const value = info.getValue();
        return Number(value) === 0 ? '-' : (Number(value) || 0).toFixed(5);
      }
    },
    { 
      id: 'gwpAlt', 
      accessorKey: 'gwpAlt', 
      header: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>GWP</span>
          <span style={{ whiteSpace: 'nowrap' }}>유가물 재활용 및</span>
          <span style={{ whiteSpace: 'nowrap' }}>에너지 회수</span>
        </div>
      ),
      cell: (info: CellContext<GTGData, unknown>) => {
        const value = info.getValue();
        return Number(value) === 0 ? '-' : (Number(value) || 0).toFixed(5);
      }
    },
    { 
      id: 'emissionWithoutBenefit',  
      accessorKey: 'emissionWithoutBenefit', 
      header: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>배출량</span>
          <span style={{ whiteSpace: 'nowrap' }}>w/o_benefit(B)</span>
        </div>
      ),
      cell: (info: CellContext<GTGData, unknown>) => {
        const value = info.getValue();
        return Number(value) === 0 ? '-' : (Number(value) || 0).toExponential(5);
      }
    },
    { 
      id: 'emissionWithBenefit',  
      accessorKey: 'emissionWithBenefit', 
      header: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>배출량</span>
          <span style={{ whiteSpace: 'nowrap' }}>w/_benefit(A)</span>
        </div>
      ),
      cell: (info: CellContext<GTGData, unknown>) => {
        const value = info.getValue();
        return Number(value) === 0 ? '-' : (Number(value) || 0).toExponential(5);
      }
    },
    { 
      id: 'reductionEffect', 
      accessorKey: 'reductionEffect', 
      header: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>탄소배출</span>
          <span style={{ whiteSpace: 'nowrap' }}>저감효과(A-B)</span>
        </div>
      ),
      cell: (info: CellContext<GTGData, unknown>) => {
        const value = info.getValue();
        return Number(value) === 0 ? '-' : (Number(value) || 0).toFixed(5);
      }
    },
    ...midItems.map((item) => ({
  id: item.midItemCode,
  accessorKey: item.midItemCode,
  header: item.midItemName,
  cell: (info: CellContext<GTGData, unknown>) => {
    const value = info.getValue();
    return Number(value) === 0 ? '-' : numeral(value).format('0,0.00000');
  }
}))
  ];

  const fetchData = useCallback(async () => {
    if (!selectedCompany || !year) return;

    setLoading(true);
    try {
      const url = `${getApiUrl}/LcaResults?companyCode=${selectedCompany.code}&year=${year}`;
      const response = await axios.get<APIResponse>(url);  
      
      const { midItems, lcaResults } = response.data;

      const transformedData = lcaResults.map((item: LCAResult) => {
        const baseData: GTGData = {
          category: item.category,       // 구분
          flow: item.flow,               // Flow
          amount: item.amount,
          functionalUnit: item.functionalUnit,
          unit: item.unit,
          gwp: item.gwp,
          gwpAlt: item.gwpAlt,
          emissionWithBenefit: item.emissionWithBenefit,
          emissionWithoutBenefit: item.emissionWithoutBenefit,
          reductionEffect: item.reductionEffect,
        };
      
        midItems.forEach(({ midItemCode }) => {
          baseData[midItemCode] = 0;
        });
      
        item.lcaItems.forEach((subItem: LCAItem) => {
          baseData[subItem.midItemCode] = subItem.amount;
        });
      
        return baseData;
      });

      setData(transformedData);
      setMidItems(midItems);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCompany, year]);

  const handleDownloadExcel = async () => {
    if (!selectedCompany || !year) {
      console.error('회사 또는 연도를 선택해 주세요.');
      return;
    }
  
    setDownloading(true); // 다운로드 시작
  
    try {
      const url = `${getApiUrl}/LcaResults/export?companyCode=${selectedCompany.code}&year=${year}`;
  
      const response = await axios.get(url, {
        responseType: 'blob',
        timeout: 180000, // 3분 타임아웃 설정
      });
  
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'LCA_결과.xlsx'; // 기본 파일 이름
  
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?UTF-8['"]?''(.+?)['"]?(;|$)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        } else {
          const simpleFilenameMatch = contentDisposition.match(/filename="?(.+?)['"]?(;|$)/);
          if (simpleFilenameMatch && simpleFilenameMatch[1]) {
            filename = simpleFilenameMatch[1];
          }
        }
      }
  
      const blob = new Blob([response.data]);
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('엑셀 파일 다운로드 중 오류 발생:', error);
    } finally {
      setDownloading(false); // 다운로드 완료
    }
  };

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setYear(event.target.value as string);
  };

  const handleSearch = () => {
    fetchData();
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
        LCA 결과(종합,사업회원)
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <UseCompany onCompanyChange={setSelectedCompany} showGeneralOption={true} />
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
        <Button
          variant="contained"
          color="secondary"
          style={{ height: '35px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleDownloadExcel}
          disabled={!selectedCompany || !year || downloading}
        >
          {downloading ? '다운로드 중...' : '엑셀 다운로드'}
        </Button>
      </div>
      <TableContainer component={Paper} style={{ maxHeight: 600, overflowY: 'auto', overflowX: 'auto' }} className="custom-scrollbar custom-table">
        <Table stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    style={{
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'center',
                      backgroundColor: '#cfcfcf',
                      fontWeight: 'bold',
                      position: 'sticky',
                      top: 0,
                      zIndex: 5,
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} style={{ textAlign: 'center' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'right',
                        backgroundColor: '#fff',
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} style={{ textAlign: 'center', color: 'red' }}>
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
