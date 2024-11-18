import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../ComponentBox/UseCompany';
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

type Basic = {
  id: number;
  transNo: string;
  giveComBizno: string;
  giveComNo: string;
  giveComName: string;
  giveCarNo: number;
  clientBizno: string;
  clientName: string;
  takeComBizno: string;
  takeComNo: string;
  takeComName: string;
  takeCarNo: string;
  takeDate: string;
};

const columns: ColumnDef<Basic>[] = [
  { accessorKey: 'transNo', header: '관리표 번호' },
  { accessorKey: 'giveComBizno', header: '사업자등록번호' },
  { accessorKey: 'giveComNo', header: () => <div style={{ textAlign: 'center' }}>EcoAS코드</div> },
  { accessorKey: 'giveComName', header: '업체명' },
  { accessorKey: 'giveCarNo', header: '차량번호' },
  { accessorKey: 'clientBizno', header: '사업자등록번호' },
  { accessorKey: 'clientName', header: '업체명' },
  { accessorKey: 'takeComBizno', header: '사업자등록번호' },
  { accessorKey: 'takeComNo', header: () => <div style={{ textAlign: 'center' }}>EcoAS코드</div> },
  { accessorKey: 'takeComName', header: '업체명' },
  { accessorKey: 'takeCarNo', header: '차량번호' },
  { accessorKey: 'takeDate', header: '인수일' },
];

export function CTMBasic() {
  const [data, setData] = useState<Basic[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [clientBizno, setClientBizno] = useState('');
  const [clientName, setClientName] = useState('');
  const [carNo, setCarNo] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchParams, setSearchParams] = useState({
    query: '',
    year: '',
    month: '',
    company: null as Company | null,
    clientBizno: '',
    clientName: '',
    carNo: '',
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
      let url = `https://lcaapi.acess.co.kr/EcoasTrans/Origin?page=${pageIndex + 1}&pageSize=${pageSize}`;
      if (searchQuery) url += `&transNo=${searchQuery}`;
      if (searchParams.clientBizno) url += `&clientBizno=${searchParams.clientBizno}`;
      if (searchParams.clientName) url += `&clientName=${searchParams.clientName}`;
      if (searchParams.carNo) url += `&carNo=${searchParams.carNo}`;
      if (searchParams.company) url += `&companyCode=${searchParams.company.code}`;
      if (searchParams.year) url += `&year=${searchParams.year}`;
      if (searchParams.month) url += `&month=${searchParams.month}`;
  
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

  //엑셀 다운로드
  const handleDownloadExcel = async () => {
    if (!selectedCompany) {
      console.error('회사를 선택해 주세요.');
      return;
    }
  
    setDownloading(true); // 다운로드 시작
  
    try {
      let url = `https://lcaapi.acess.co.kr/EcoasTrans/export?companyCode=${selectedCompany.code}`;
  
      // Optional parameters
      if (year) url += `&year=${year}`;
      if (month) url += `&month=${month}`;
      if (clientBizno) url += `&clientBizno=${clientBizno}`;
      if (clientName) url += `&clientName=${clientName}`;
      if (carNo) url += `&carNo=${carNo}`;
  
      const response = await axios.get(url, {
        responseType: 'blob',
        timeout: 180000, // 3분 타임아웃 설정
      });
  
      const contentDisposition = response.headers['content-disposition'];
      let filename = '수집운반_관리표.xlsx'; // 기본 파일 이름
  
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

  const handleSearch = () => {
    setSearchParams({
      query: searchQuery,
      company: selectedCompany,
      year,
      month,
      clientBizno,
      clientName,
      carNo,
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

  const table = useReactTable<Basic>({
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
    setYear(selectedYear);
  };

  const handleMonthChange = (event: SelectChangeEvent<string>) => {
    const selectedMonth = event.target.value as string;
    setMonth(selectedMonth);
  };

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        수집운반 관리표 원장
      </Typography>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '20px' }}>
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
          <Button
            variant="contained"
            color="primary"
            style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px' }}
            onClick={handleSearch}
          >
            조회
          </Button>
          <Button
            variant="contained"
            color="secondary"
            style={{ height: '35px', padding: '0 10px', fontSize: '14px' }}
            onClick={handleDownloadExcel}
            disabled={
              !selectedCompany || 
              !year ||
              downloading || 
              (selectedCompany.name === '전체' || selectedCompany.name === '공통')
            }
          >
            {downloading ? '다운로드 중...' : '엑셀 다운로드'}
          </Button>
        <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
          <FormControl style={{ marginRight: '10px', marginTop: '10px' }}>
            <TextField
              id="search-query-input"
              label="관리표 번호 조회"
              value={searchQuery}
              onChange={handleSearchQueryChange}
              style={{ width: '200px' }}
              sx={{ '& .MuiInputBase-root': { height: '45px' } }}
            />
          </FormControl>
          <FormControl style={{ marginRight: '10px', marginTop: '10px' }}>
            <TextField
              id="client-bizno-input"
              label="거래처 사업자등록번호 조회"
              value={clientBizno}
              onChange={(e) => setClientBizno(e.target.value)}
              style={{ width: '220px' }}
              sx={{ '& .MuiInputBase-root': { height: '45px' } }}
            />
          </FormControl>
          <FormControl style={{ marginRight: '10px', marginTop: '10px' }}>
            <TextField
              id="client-name-input"
              label="거래처 조회"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              style={{ width: '200px' }}
              sx={{ '& .MuiInputBase-root': { height: '45px' } }}
            />
          </FormControl>
          <FormControl style={{ marginRight: '10px', marginTop: '10px' }}>
            <TextField
              id="car-no-input"
              label=" 인수업체 차량번호 조회"
              value={carNo}
              onChange={(e) => setCarNo(e.target.value)}
              style={{ width: '200px' }}
              sx={{ '& .MuiInputBase-root': { height: '45px' } }}
            />
          </FormControl>
        </div>
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
                <TableCell colSpan={12} style={{ textAlign: 'center' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <>
              <TableHead>
                <TableRow>
                  <TableCell
                    colSpan={1}
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      border: '1px solid #ddd',
                      backgroundColor: '#c2cdff',
                    }}
                  >
                    구분
                  </TableCell>
                  <TableCell
                    colSpan={4}
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      border: '1px solid #ddd',
                      backgroundColor: '#a9b9ff',
                    }}
                  >
                    인계 업체
                  </TableCell>
                  <TableCell
                    colSpan={2}
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      border: '1px solid #ddd',
                      backgroundColor: '#9badfd',
                    }}
                  >
                    거래처
                  </TableCell>
                  <TableCell
                    colSpan={5}
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      border: '1px solid #ddd',
                      backgroundColor: '#8fa3ff',
                    }}
                  >
                    인수업체
                  </TableCell>
                </TableRow>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell
                        key={header.id}
                        style={{
                          textAlign: 'center',
                          border: '1px solid #ddd',
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
                {!hasSearched ? (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      style={{ textAlign: 'center', color: 'red', border: '1px solid #ddd' }}
                    >
                      조회하여 주십시오.
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            textAlign: 'center',
                            border: '1px solid #ddd',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      style={{ textAlign: 'center', color: 'red', border: '1px solid #ddd' }}
                    >
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
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