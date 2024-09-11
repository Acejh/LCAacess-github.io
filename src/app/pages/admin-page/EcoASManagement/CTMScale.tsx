import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../ComponentBox/UseCompany';
import numeral from 'numeral';
import '../../CSS/SCbar.css';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  Updater,
  PaginationState,
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
  InputLabel,
  FormControl,
  SelectChangeEvent,
  CircularProgress,
  TextField,
} from '@mui/material';

type Scale = {
  id: number;
  companyCode: string;
  transNo: string;
  takeDate: string;
  categoryCode: string;
  categoryName: string;
  midItemCode: string;
  midItemName: string;
  itemCode: string;
  itemName: string;
  itemCount: string;
  meanWeight: string;
  totalWeight: string;
  ratio: string;
  tkinWeight: string;
  weight: string;
};

const columns: ColumnDef<Scale>[] = [
  { accessorKey: 'companyCode', header: '사업회원' },
  { accessorKey: 'transNo', header: '관리표 번호' },
  { accessorKey: 'takeDate', header: '인수일' },
  { accessorKey: 'categoryCode', header: () => <div style={{ textAlign: 'center' }}>품목코드</div>},
  { accessorKey: 'categoryName', header: '품목명' },
  { accessorKey: 'midItemCode', header: () => <div style={{ textAlign: 'center' }}>제품군코드</div>},
  { accessorKey: 'midItemName', header: '제품군명' },
  { accessorKey: 'itemCode', header: () => <div style={{ textAlign: 'center' }}>제품코드</div>},
  { accessorKey: 'itemName', header: '제품명' },
  { accessorKey: 'itemCount', header: () => <div style={{ textAlign: 'center' }}>제품개수</div>},
  { accessorKey: 'meanWeight', header: () => <div style={{ textAlign: 'center' }}>평균중량 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0.00000')},
  { accessorKey: 'totalWeight', header: () => <div style={{ textAlign: 'center' }}>평균중량합계 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0.00000') },
  { accessorKey: 'ratio', header: () => <div style={{ textAlign: 'center' }}>비율 (%)</div>, cell: info => numeral(info.getValue()).format('0.00000')},
  { accessorKey: 'tkinWeight', header: () => <div style={{ textAlign: 'center' }}>실중량 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0') },
  { accessorKey: 'weight', header: () => <div style={{ textAlign: 'center' }}>보정중량 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0.00000') },
];

export function CTMScale() {
  const [data, setData] = useState<Scale[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState({
    query: '',
    year: '',
    month: '',
    company: null as Company | null,
  });
  const [downloading, setDownloading] = useState(false); 

  useEffect(() => {
    axios.get('https://lcaapi.acess.co.kr/Companies')
      .then(response => {
        setCompanies(response.data.list);
      })
      .catch(error => {
        console.error('Error fetching companies:', error);
      });
  }, []);

  const fetchData = useCallback(async (pageIndex: number, pageSize: number, searchQuery = '') => {
    if (!searchParams.company) {
      setData([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }
  
    setLoading(true);
    try {
      let url = `https://lcaapi.acess.co.kr/EcoasTrans/Scaled?page=${pageIndex + 1}&pageSize=${pageSize}`;
      if (searchQuery) {
        url += `&transNo=${searchQuery}`;
      }
      if (searchParams.company) {
        url += `&companyCode=${searchParams.company.code}`;
      }
      if (searchParams.year) {
        url += `&year=${searchParams.year}`;
      }
      if (searchParams.month) {
        url += `&month=${searchParams.month}`;
      }
  
      const response = await axios.get(url);
      const { list, totalCount } = response.data;
  
      const transformedList = list.map((item: Scale) => {
        const company = companies.find(c => c.code === item.companyCode);
        return {
          ...item,
          companyCode: company ? company.name : item.companyCode,
        };
      });
  
      setData(transformedList);
      setTotalCount(totalCount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [searchParams, companies]);

  useEffect(() => {
    fetchData(pageIndex, pageSize, searchParams.query);
  }, [pageIndex, pageSize, fetchData, searchParams]);

  const totalPages = Math.ceil(totalCount / pageSize);

  //엑셀다운
  const handleDownloadExcel = async () => {
    setDownloading(true); // 다운로드 중 상태 설정
    
    // 3분(180초) 타임아웃 설정
    const countdownTimeout = setTimeout(() => {
      setDownloading(false); // 3분 후 다운로드 중 상태 해제
    }, 180000); // 3분 후 해제
  
    try {
      let url = `https://lcaapi.acess.co.kr/EcoasTrans/Export-Scaled?page=${pageIndex + 1}&pageSize=${pageSize}`;
      if (searchQuery) {
        url += `&transNo=${searchQuery}`;
      }
      if (selectedCompany) {
        url += `&companyCode=${selectedCompany.code}`;
      }
      if (year) {
        url += `&year=${year}`;
      }
      if (month) {
        url += `&month=${month}`;
      }
  
      const response = await axios.get(url, {
        responseType: 'blob',
        timeout: 180000, // 3분 타임아웃 설정
      });
  
      // 서버에서 전달된 파일 이름 추출
      const contentDisposition = response.headers['content-disposition'];
      let filename = '수집운반_보정중량.xlsx'; 
  
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
  
      // Blob 생성 및 파일 다운로드
      const blob = new Blob([response.data]);
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', filename); 
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
  
    } catch (error) {
      console.error('Error downloading Excel file:', error);
    } finally {
      clearTimeout(countdownTimeout); // 타임아웃 클리어
      setDownloading(false); // 다운로드가 완료되면 다시 원래 상태로 돌림
    }
  };

  const handleSearch = () => {
    setSearchParams({
      query: searchQuery,
      company: selectedCompany,
      year,
      month,
    });
    setPageIndex(0);
    setHasSearched(true); 
  };

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    if (typeof updater === 'function') {
      const newState = updater({ pageIndex, pageSize });
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
      fetchData(newState.pageIndex, newState.pageSize);
    } else {
      const newPageIndex = updater.pageIndex ?? pageIndex;
      const newPageSize = updater.pageSize ?? pageSize;
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
      fetchData(newPageIndex, newPageSize);
    }
  };

  const table = useReactTable<Scale>({
    data,
    columns,
    pageCount: totalPages,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    manualPagination: true,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  const renderPageNumbers = () => {
    const startPage = Math.floor(pageIndex / 5) * 5;
    const endPage = Math.min(startPage + 5, totalPages);

    return Array.from({ length: endPage - startPage }, (_, i) => startPage + i).map((number) => (
      <Button
        key={number}
        variant={pageIndex === number ? 'contained' : 'outlined'}
        color="primary"
        style={{ marginRight: '5px', minWidth: '30px', padding: '5px' }}
        onClick={() => {
          table.setPageIndex(number);
        }}
      >
        {number + 1}
      </Button>
    ));
  };

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setYear(event.target.value);
  };
  
  const handleMonthChange = (event: SelectChangeEvent<string>) => {
    setMonth(event.target.value);
  };

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        수집운반 보정중량
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        style={{ height: '35px', marginBottom: '20px', padding: '0 10px', fontSize: '14px' }}
        onClick={handleDownloadExcel}
        disabled={!hasSearched || !selectedCompany || !year || downloading} 
      >
        {downloading ? '다운로드 중...' : '엑셀 다운로드'}
      </Button>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <UseCompany onCompanyChange={setSelectedCompany} />
        <FormControl style={{ marginRight: '10px' }}>
          <InputLabel id="year-label">연도</InputLabel>
          <Select
            labelId="year-label"
            id="year-select"
            value={year}
            label="연도"
            onChange={handleYearChange}
            style={{ width: '100px' }}
            sx={{ height: '45px' }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 120,
                },
              },
            }}
          >
            <MenuItem value="">전체</MenuItem>
            {Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()).map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl style={{ marginRight: '10px' }}>
          <InputLabel id="month-label">월</InputLabel>
          <Select
            labelId="month-label"
            id="month-select"
            value={month}
            label="월"
            onChange={handleMonthChange}
            style={{ width: '100px' }}
            sx={{ height: '45px' }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 120,
                },
              },
            }}
          >
            <MenuItem value="">전체</MenuItem>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <MenuItem key={month} value={String(month)}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl style={{ marginRight: '10px' }}>
          <TextField
            id="search-query-input"
            label="관리표 번호 조회"
            value={searchQuery}
            onChange={handleSearchQueryChange}
            style={{ width: '200px' }}
            sx={{ '& .MuiInputBase-root': { height: '45px' } }}
          />
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px'}}
          onClick={handleSearch}
        >
          조회
        </Button>
      </div>
      <TableContainer
        component={Paper}
        style={{ maxHeight: 545, overflowY: 'auto' }}
        className="custom-scrollbar"
      >
      <Table>
        {loading ? (
          <TableBody>
            <TableRow>
              <TableCell colSpan={15} style={{ textAlign: 'center' }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          </TableBody>
        ) : (
          <>
            <TableHead>
              <TableRow>
                <TableCell
                  colSpan={3}
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    borderRight: '1px solid #e0e0e0',
                    backgroundColor: '#d8d8d8',
                  }}
                >
                  구분
                </TableCell>
                <TableCell
                  colSpan={2}
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    borderRight: '1px solid #e0e0e0',
                    backgroundColor: '#d8d8d8',
                  }}
                >
                  품목
                </TableCell>
                <TableCell
                  colSpan={2}
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    borderRight: '1px solid #e0e0e0',
                    backgroundColor: '#d8d8d8',
                  }}
                >
                  제품군
                </TableCell>
                <TableCell
                  colSpan={3}
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    borderRight: '1px solid #e0e0e0',
                    backgroundColor: '#d8d8d8',
                  }}
                >
                  제품분류
                </TableCell>
                <TableCell
                  colSpan={5}
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    borderRight: '1px solid #e0e0e0',
                    backgroundColor: '#d8d8d8',
                  }}
                >
                  중량
                </TableCell>
              </TableRow>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell
                      key={header.id}
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        position: 'sticky',
                        top: 0,
                        backgroundColor: '#cfcfcf',
                        zIndex: 1,
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
                  <TableCell colSpan={15} style={{ textAlign: 'center' }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {!hasSearched ? (
                    <TableRow>
                      <TableCell colSpan={15} style={{ textAlign: 'center', color: 'red' }}>
                        사업회원을 선택하여 조회하십시오.
                      </TableCell>
                    </TableRow>
                  ) : table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            textAlign: ['categoryCode' , 'midItemCode' , 'itemCode' , 'itemCount' , 'meanWeight' , 'totalWeight' , 'ratio' , 'tkinWeight' , 'weight'].includes(cell.column.id) ? 'right' : 'left',
                          }}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={15} style={{ textAlign: 'center', color: 'red' }}>
                        데이터가 없습니다.
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </>
        )}
      </Table>
      </TableContainer>
      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Button onClick={() => table.setPageIndex(pageIndex - 1)} disabled={!table.getCanPreviousPage()} variant="contained" color="primary" style={{ marginRight: '10px' }}>
            이전
          </Button>
          <Button onClick={() => table.setPageIndex(pageIndex + 1)} disabled={!table.getCanNextPage()} variant="contained" color="primary">
            다음
          </Button>
        </div>
        <div>
          <Button onClick={() => table.setPageIndex(0)} disabled={pageIndex === 0} variant="contained" color="primary" style={{ marginRight: '10px', minWidth: '30px', padding: '5px', width: 50 }}>
            처음
          </Button>
          <Button onClick={() => table.setPageIndex(Math.max(0, pageIndex - 5))} disabled={pageIndex < 5} variant="contained" color="warning" style={{ marginRight: '15px', minWidth: '30px', padding: '5px' }}>
            -5
          </Button>
          {renderPageNumbers()}
          <Button onClick={() => table.setPageIndex(Math.min(totalPages - 1, pageIndex + 5))} disabled={pageIndex + 5 >= totalPages} variant="contained" color="warning" style={{ marginLeft: '10px', minWidth: '30px', padding: '5px' }}>
            +5
          </Button>
          <Button onClick={() => table.setPageIndex(totalPages - 1)} disabled={pageIndex === totalPages - 1} variant="contained" color="primary" style={{ marginLeft: '10px', minWidth: '30px', padding: '5px', width: 50 }}>
            끝
          </Button>
        </div>
        <div>
          <Typography variant="body1" component="span" style={{ marginRight: '10px' }}>
            Page {pageIndex + 1} / {totalPages}
          </Typography>
          <Select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); }}
          >
            {[5, 10, 20, 30, 40, 50].map((size) => (
              <MenuItem key={size} value={size}>
                Show {size}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}
