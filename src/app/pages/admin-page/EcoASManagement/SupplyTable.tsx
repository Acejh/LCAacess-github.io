import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../ComponentBox/UseCompany';
import numeral from 'numeral';
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
import * as XLSX from 'xlsx';

type Supply = {
  id: number;
  reccNo: string;
  reccDate: string;
  reccComBizno: string;
  reccComNo: string;
  reccComName: string;
  reccSupplyNo: string;
  supplyComName: string;
  supplyEtc: string;
  clientBizno: string;
  clientName: string;
  carNo: string;
  item1: string;
  item2: string;
  item3: string;
  weight: string;
  ecoasWeight: string;
};

const columns: ColumnDef<Supply>[] = [
  { accessorKey: 'reccNo', header: '관리표 번호' },
  { accessorKey: 'reccDate', header: '일시' },
  { accessorKey: 'reccComBizno', header: '사업자등록번호' },
  { accessorKey: 'reccComNo', header: () => <div style={{ textAlign: 'center' }}>EcoAS코드</div>},
  { accessorKey: 'reccComName', header: '사업회원명' },
  { accessorKey: 'reccSupplyNo', header: () => <div style={{ textAlign: 'center' }}>번호</div>},
  { accessorKey: 'supplyComName', header: '거래처명' },
  { accessorKey: 'supplyEtc', header: '비고' },
  { accessorKey: 'clientBizno', header: '거래처 사업자등록번호' },
  { accessorKey: 'clientName', header: '거래처 명' },
  { accessorKey: 'carNo', header: '차량번호' },
  { accessorKey: 'item1', header: '품목군' },
  { accessorKey: 'item2', header: '제품군' },
  { accessorKey: 'item3', header: '제품분류' },
  { accessorKey: 'weight', header: () => <div style={{ textAlign: 'center' }}>중량</div> , cell: info => numeral(info.getValue()).format('0,0') },
  { accessorKey: 'ecoasWeight', header: () => <div style={{ textAlign: 'center' }}>EcoAS중량</div> , cell: info => numeral(info.getValue()).format('0,0')  },
];

export function SupplyTable() {
  const [data, setData] = useState<Supply[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState({
    query: '',
    year: '',
    month: '',
    company: null as Company | null,
  });

  const fetchData = useCallback(async (pageIndex: number, pageSize: number, searchQuery = '') => {
    if (!searchParams.company) {
      setData([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }
  
    setLoading(true);
    try {
      let url = `https://lcaapi.acess.co.kr/EcoasRecc/Supply?page=${pageIndex + 1}&pageSize=${pageSize}`;
      if (searchQuery) {
        url += `&reccNo=${searchQuery}`;
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
      setData(list);
      setTotalCount(totalCount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData(pageIndex, pageSize, searchParams.query);
  }, [pageIndex, pageSize, fetchData, searchParams]);

  const totalPages = Math.ceil(totalCount / pageSize);

  // 엑셀 다운로드
  const handleDownloadExcel = () => {
    const tableData = table.getRowModel().rows.map(row => row.original);
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, '공급 관리표.xlsx');
  };

  //검색
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

  const table = useReactTable<Supply>({
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
    const selectedYear = event.target.value as string;
    // console.log(`Selected year: ${selectedYear}`); // 선택한 연도 로그
    setYear(selectedYear);
  };
  
  const handleMonthChange = (event: SelectChangeEvent<string>) => {
    const selectedMonth = event.target.value as string;
    // console.log(`Selected month: ${selectedMonth}`); // 선택한 월 로그
    setMonth(selectedMonth);
  };

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        공급 관리표
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
            {Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()).map(year => (
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
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
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
      <TableContainer component={Paper} style={{ maxHeight: 545, overflowY: 'auto' }}>
        <Table>
          {loading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={12} style={{ textAlign: 'center' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <>
              <TableHead>
              {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableCell 
                        key={header.id} 
                        style={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          position: 'sticky', 
                          top: 0, 
                          backgroundColor: '#cfcfcf', 
                          zIndex: 1 
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
                    <TableCell colSpan={19} style={{ textAlign: 'center' }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {!hasSearched ? (
                      <TableRow>
                        <TableCell colSpan={19} style={{ textAlign: 'center', color: 'red' }}>
                          사업회원을 선택하여 조회하십시오.
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map(row => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                              textAlign: ['reccComNo', 'reccSupplyNo', 'weight', 'ecoasWeight'].includes(cell.column.id) ? 'right' : 'left', }}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={19} style={{ textAlign: 'center', color: 'red' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
          <Button onClick={() => table.setPageIndex(0)} disabled={pageIndex === 0} variant="contained" color="primary" style={{ marginRight: '10px', minWidth: '30px', padding: '5px', width: 50 }}>
            처음
          </Button>
          <Button onClick={() => table.setPageIndex(Math.max(0, pageIndex - 5))} disabled={pageIndex < 5} variant="contained" color="warning" style={{ marginRight: '15px', minWidth: '30px', padding: '5px' }}>
            -5
          </Button>
          {renderPageNumbers()}
          <Button onClick={() => table.setPageIndex(Math.min(table.getPageCount() - 1, pageIndex + 5))} disabled={pageIndex >= table.getPageCount() - 5} variant="contained" color="warning" style={{ marginLeft: '10px', minWidth: '30px', padding: '5px' }}>
            +5
          </Button>
          <Button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={pageIndex === table.getPageCount() - 1} variant="contained" color="primary" style={{ marginLeft: '10px', minWidth: '30px', padding: '5px', width: 50 }}>
            끝
          </Button>
        </div>
        <div>
          <Typography variant="body1" component="span" style={{ marginRight: '10px' }}>
            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </Typography>
          <Select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20, 30, 40, 50].map(pageSize => (
              <MenuItem key={pageSize} value={pageSize}>
                Show {pageSize}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
    </div>
  );
}