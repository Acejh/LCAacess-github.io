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
  const [role, setRole] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState({
    query: '',
    year: '',
    month: '',
    company: null as Company | null,
  });
  const [downloading, setDownloading] = useState(false); 

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('kt-auth-react-v') || '{}');
    const roleFromStorage = storedData.userInfo?.role || 'User'; 
    setRole(roleFromStorage);
  }, []);

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
    if (!selectedCompany || selectedCompany.code === '전체') {
      // 사업회원이 전체로 선택된 경우 경고 메시지
      alert('사업회원을 선택해 주세요.');
      return;
    }
  
    if (!year) {
      console.error('연도를 선택해 주세요.');
      return;
    }
  
    setDownloading(true); // 다운로드 시작
  
    try {
      const url = `https://lcaapi.acess.co.kr/EcoasTrans/Export-Scaled?page=${pageIndex + 1}&pageSize=${pageSize}&companyCode=${selectedCompany.code}&year=${year}&month=${month || ''}`;
      
      const response = await axios.get(url, {
        responseType: 'blob',
        timeout: 180000, // 3분 타임아웃 설정
      });
  
      const contentDisposition = response.headers['content-disposition'];
      let filename = '수집운반_보정중량.xlsx'; // 기본 파일 이름
  
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
      alert('단일 사업회원을 선택하여주십시오.');
    } finally {
      setDownloading(false); 
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

  const columns: ColumnDef<Scale>[] = [
    { accessorKey: 'companyCode', header: '사업회원' },
    { accessorKey: 'transNo', header: '관리표 번호' },
    { accessorKey: 'takeDate', header: '인수일' },
    ...(role !== 'User' ? [
      { accessorKey: 'categoryCode', header: () => <div style={{ textAlign: 'center' }}>품목코드</div> }
    ] : []),
    { accessorKey: 'categoryName', header: '제품군' },
    ...(role !== 'User' ? [
      { accessorKey: 'midItemCode', header: () => <div style={{ textAlign: 'center' }}>제품군코드</div> }
    ] : []),
    { accessorKey: 'midItemName', header: '품목명' },
    ...(role !== 'User' ? [
      { accessorKey: 'itemCode', header: () => <div style={{ textAlign: 'center' }}>제품코드</div> }
    ] : []),
    { accessorKey: 'itemName', header: '세부품목명' },
    { accessorKey: 'itemCount', header: () => <div style={{ textAlign: 'center' }}>제품개수</div> },
    { accessorKey: 'meanWeight', header: () => <div style={{ textAlign: 'center' }}>평균중량 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0.00000') },
    { accessorKey: 'totalWeight', header: () => <div style={{ textAlign: 'center' }}>평균중량합계 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0.00000') },
    { accessorKey: 'ratio', header: () => <div style={{ textAlign: 'center' }}>비율 (%)</div>, cell: info => numeral(info.getValue()).format('0.00000') },
    { accessorKey: 'tkinWeight', header: () => <div style={{ textAlign: 'center' }}>실중량 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0') },
    { accessorKey: 'weight', header: () => <div style={{ textAlign: 'center' }}>보정중량 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0.00000') },
  ];

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
        관리표별 중량
      </Typography>
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
      <TableContainer
        component={Paper}
        style={{ maxHeight: 545, overflowY: 'auto' }}
        className="custom-scrollbar custom-table"
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
                        조회하여 주십시오.
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
