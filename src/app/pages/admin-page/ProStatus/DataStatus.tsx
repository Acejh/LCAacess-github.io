import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../ComponentBox/UseCompany';
import '../../CSS/SCbar.css';
import { getApiUrl } from '../../../../main';
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
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import * as XLSX from 'xlsx';

type PostData = {
  companyCode: string;
  year: string;
  month?: string; // LCA 모달에서는 제외되므로 optional
};

type Status = {
  companyName: string;
  year: number;
  month: number;
  transCount: number;
  supplyCount: number;
  wasteCount: number;
  noAddressClientCount: number;
  noSpecCarCount: number;
  transClientMappingCount: number;
  transCarMappingCount: number;
  valuableClientMappingCount: number;
  valuableCarMappingCount: number;
  valuableItemMappingCount: number;
  valuableExtraClientMappingCount: number;
  wasteClientMappingCount: number;
  wasteCarMappingCount: number;
  wasteItemMappingCount: number;
  state: string; // 상태 필드
};

type ApiData = {
  companyCode: string;
  year: number;
  month: number;
  transCount: number;
  supplyCount: number;
  wasteCount: number;
  noAddressClientCount: number;
  noSpecCarCount: number;
  transClientMappingCount: number;
  transCarMappingCount: number;
  valuableClientMappingCount: number;
  valuableCarMappingCount: number;
  valuableItemMappingCount: number;
  valuableExtraClientMappingCount: number;
  wasteClientMappingCount: number;
  wasteCarMappingCount: number;
  wasteItemMappingCount: number;
  state: string; // 상태 필드
};

type CompanyData = {
  code: string;
  name: string;
};

const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());

const columns: ColumnDef<Status>[] = [
  { accessorKey: 'companyName', header: '업체명' },
  { accessorKey: 'year', header: () => <div style={{ textAlign: 'center' }}>연도</div>},
  { accessorKey: 'month', header: () => <div style={{ textAlign: 'center' }}>월</div>},
  { 
    accessorKey: 'transClientMappingCount', 
    header: () => <div style={{ textAlign: 'center' }}>수집운반 거래처</div>, 
    cell: ({ row }) => `${row.original.transClientMappingCount}/${row.original.transCount}` 
  },
  { 
    accessorKey: 'transCarMappingCount', 
    header: () => <div style={{ textAlign: 'center' }}>수집운반 차량</div>, 
    cell: ({ row }) => `${row.original.transCarMappingCount}/${row.original.transCount}` 
  },
  { 
    accessorKey: 'valuableClientMappingCount', 
    header: () => <div style={{ textAlign: 'center' }}>유가물 거래처</div>, 
    cell: ({ row }) => `${row.original.valuableClientMappingCount}/${row.original.supplyCount}` 
  },
  { 
    accessorKey: 'valuableCarMappingCount', 
    header: () => <div style={{ textAlign: 'center' }}>유가물 차량</div>, 
    cell: ({ row }) => `${row.original.valuableCarMappingCount}/${row.original.supplyCount}` 
  },
  { 
    accessorKey: 'valuableItemMappingCount', 
    header: () => <div style={{ textAlign: 'center' }}>유가물 품목</div>, 
    cell: ({ row }) => `${row.original.valuableItemMappingCount}/${row.original.supplyCount}` 
  },
  { 
    accessorKey: 'wasteClientMappingCount', 
    header: () => <div style={{ textAlign: 'center' }}>폐기물 거래처</div>, 
    cell: ({ row }) => `${row.original.wasteClientMappingCount}/${row.original.wasteCount}` 
  },
  { 
    accessorKey: 'wasteCarMappingCount', 
    header: () => <div style={{ textAlign: 'center' }}>폐기물 차량</div>, 
    cell: ({ row }) => `${row.original.wasteCarMappingCount}/${row.original.wasteCount}` 
  },
  { 
    accessorKey: 'wasteItemMappingCount', 
    header: () => <div style={{ textAlign: 'center' }}>폐기물 품목</div>, 
    cell: ({ row }) => `${row.original.wasteItemMappingCount}/${row.original.wasteCount}` 
  },
  {
    accessorKey: 'state',
    header: () => <div style={{ textAlign: 'center' }}>매핑 상태</div>,
    cell: ({ row }) => (
      <div style={{ textAlign: 'center' }}>
        {row.original.state}
      </div>
    ),
  },
];


export function DataStatus() {
  const [data, setData] = useState<Status[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [role, setRole] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState({
    year: '',
    month: '',
    company: null as Company | null,
  });
  const [companies, setCompanies] = useState<CompanyData[]>([]);

  const handleOpenModal = (modalType: string) => {
    setOpenModal(modalType);
    setSelectedCompany(null);
    setYear('');
    setMonth('');
  };

  const handleCloseModal = () => {
    setOpenModal(null);
    setSelectedCompany(null);
    setYear('');
    setMonth('');
  };

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('kt-auth-react-v') || '{}');
    const roleFromStorage = storedData.userInfo?.role || 'User'; 
    setRole(roleFromStorage);
  }, []);

  useEffect(() => {
    axios.get(`${getApiUrl}/Companies`)
      .then(response => {
        setCompanies(response.data.list);
      })
      .catch(error => {
        console.error('Error fetching companies:', error);
      });
  }, []);

  const transformData = useCallback(
    (apiData: ApiData[]): Status[] => {
      return apiData.map((item) => {
        const company = companies.find((c) => c.code === item.companyCode);
        return {
          companyName: company ? company.name : `사업회원 ${item.companyCode}`,
          year: item.year,
          month: item.month,
          transCount: item.transCount,
          supplyCount: item.supplyCount,
          wasteCount: item.wasteCount,
          noAddressClientCount: item.noAddressClientCount,
          noSpecCarCount: item.noSpecCarCount,
          transClientMappingCount: item.transClientMappingCount,
          transCarMappingCount: item.transCarMappingCount,
          valuableClientMappingCount: item.valuableClientMappingCount,
          valuableCarMappingCount: item.valuableCarMappingCount,
          valuableItemMappingCount: item.valuableItemMappingCount,
          valuableExtraClientMappingCount: item.valuableExtraClientMappingCount,
          wasteClientMappingCount: item.wasteClientMappingCount,
          wasteCarMappingCount: item.wasteCarMappingCount,
          wasteItemMappingCount: item.wasteItemMappingCount,
          state: item.state, 
        };
      });
    },
    [companies]
  );

  const fetchData = useCallback(async (pageIndex: number, pageSize: number, params: typeof searchParams) => {
    setLoading(true);
    try {
      let url = `${getApiUrl}/ProcessStatus?page=${pageIndex + 1}&pageSize=${pageSize}`;
      if (params.company) {
        url += `&companyCode=${params.company.code}`;
      }
      if (params.year) {
        url += `&year=${params.year}`;
      }
      if (params.month) {
        url += `&month=${params.month}`;
      }
      const response = await axios.get(url);
      const { list, totalCount } = response.data;
      setData(transformData(list as ApiData[]));
      setTotalCount(totalCount);
      setLoading(false);
    } catch (error) {
      console.error('데이터 가져오는 중 오류 발생:', error);
      setLoading(false);
    }
  }, [transformData]);

  const prevSearchParamsRef = useRef(searchParams);
  
  useEffect(() => {
    if (prevSearchParamsRef.current !== searchParams) {
      prevSearchParamsRef.current = searchParams;
      return;
    }
    fetchData(pageIndex, pageSize, searchParams);
  }, [pageIndex, pageSize, fetchData, searchParams]);

  const handleDownloadExcel = () => {
    const tableData = table.getRowModel().rows.map(row => {
      const original = row.original;
      return {
        ...original,
        collTrans: `${original.transClientMappingCount}/${original.transCount}`,
        collCar: `${original.transCarMappingCount}/${original.transCount}`,
        supItem: `${original.valuableItemMappingCount}/${original.supplyCount}`,
        supTrans: `${original.valuableClientMappingCount}/${original.supplyCount}`,
        supCar: `${original.valuableCarMappingCount}/${original.supplyCount}`,
        dispItem: `${original.wasteItemMappingCount}/${original.wasteCount}`,
        dispTrans: `${original.wasteClientMappingCount}/${original.wasteCount}`,
        dispCar: `${original.wasteCarMappingCount}/${original.wasteCount}`,
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, '데이터 현황.xlsx');
  };

  const handleSubmit = async () => {
    if (!selectedCompany || !year || (openModal !== 'LCA' && !month)) {
      alert('모든 필드를 선택해주세요.');
      return;
    }
  
    const urlMap: Record<string, string> = {
      EcoAS: `${getApiUrl}/EcoasData/fetch`,
      AutoMapping: `${getApiUrl}/Mapping`,
      GTG: `${getApiUrl}/Cals/gtog`,
      LCA: `${getApiUrl}/Cals/lca`,
    };
  
    const postData: PostData = {
      companyCode: selectedCompany?.code as string,
      year: year,
      ...(openModal !== 'LCA' && { month: month }),
    };
  
    setLoading(true);
  
    try {
      const response = await axios.post(urlMap[openModal!], postData);
      const message = response.data?.message || '작업은 완료되었으나 표시오류가 있습니다.';
      alert(message); 
    } catch (error: unknown) {
      console.error(`${openModal} 오류:`, error);
    
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.message 
          ? error.response.data.message
          : error instanceof Error 
          ? error.message
          : '작업 중 오류가 발생했습니다.'; 
    
      alert(errorMessage); 
    } finally {
      setLoading(false);
      handleCloseModal();
    }
  };

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    if (typeof updater === 'function') {
      const newState = updater({ pageIndex, pageSize });
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
      fetchData(newState.pageIndex, newState.pageSize, searchParams);
    } else {
      const newPageIndex = updater.pageIndex ?? pageIndex;
      const newPageSize = updater.pageSize ?? pageSize;
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
      fetchData(newPageIndex, newPageSize, searchParams);
    }
  };

  const table = useReactTable<Status>({
    data,
    columns,
    pageCount: Math.ceil(totalCount / pageSize),
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
    const endPage = Math.min(startPage + 5, Math.ceil(totalCount / pageSize));
  
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
    setSearchParams((prev) => ({ ...prev, year: event.target.value }));
  };
  
  const handleMonthChange = (event: SelectChangeEvent<string>) => {
    setSearchParams((prev) => ({ ...prev, month: event.target.value }));
  };
  
  const handleCompanyChange = (company: Company | null) => {
    setSearchParams((prev) => ({ ...prev, company }));
  };
  
  const handleSearch = () => {
    if (!searchParams.company) {
      alert("사업회원을 선택하여주십시오");
      return;
    }
    setPageIndex(0);
    setSearchInitiated(true);
    fetchData(0, pageSize, searchParams);
  };
  
  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        데이터 매핑 현황
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
        <UseCompany onCompanyChange={handleCompanyChange} />
        <FormControl style={{ marginRight: '10px' }}>
          <InputLabel id="year-label">연도</InputLabel>
          <Select
            labelId="year-label"
            id="year-select"
            value={searchParams.year}
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
            value={searchParams.month}
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
        {role === 'Admin' && (
          <>
            <Button
              variant="contained"
              color="primary"
              style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px' }}
              onClick={() => handleOpenModal('EcoAS')}
            >
              EcoAS관리표 가져오기
            </Button>
            <Button
              variant="contained"
              color="primary"
              style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px' }}
              onClick={() => handleOpenModal('AutoMapping')}
            >
              자동 매핑
            </Button>
            <Button
              variant="contained"
              color="primary"
              style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px' }}
              onClick={() => handleOpenModal('GTG')}
            >
              GTG결과 산출하기
            </Button>
            <Button
              variant="contained"
              color="primary"
              style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px' }}
              onClick={() => handleOpenModal('LCA')}
            >
              LCA결과 산출하기
            </Button>
          </>
        )}
      </div>
      <TableContainer
        component={Paper}
        style={{ maxHeight: 545, overflowY: 'auto' }}
        className="custom-scrollbar custom-table"
      >
        <Table>
          {!searchInitiated ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={14} style={{ textAlign: 'center', color: 'red' }}>
                  조회하여 주십시오.
                </TableCell>
              </TableRow>
            </TableBody>
          ) : loading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={14} style={{ textAlign: 'center' }}>
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
                    기본 정보
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
                    수집운반 관리표
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
                    유가물 관리표
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
                    폐기물 관리표
                  </TableCell>
                  <TableCell
                    colSpan={1}
                    style={{
                      textAlign: 'center',
                      fontWeight: 'bold',
                      borderRight: '1px solid #e0e0e0',
                      backgroundColor: '#d8d8d8',
                    }}
                  >
                    매핑
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
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textAlign: [
                              'year',
                              'month',
                              'transClientMappingCount',
                              'transCarMappingCount',
                              'valuableClientMappingCount',
                              'valuableCarMappingCount',
                              'valuableItemMappingCount',
                              'wasteClientMappingCount',
                              'wasteCarMappingCount',
                              'wasteItemMappingCount',
                            ].includes(cell.column.id)
                              ? 'right'
                              : 'left',
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={14} style={{ textAlign: 'center' }}>
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
          <Button onClick={() => table.setPageIndex(Math.min(Math.ceil(totalCount / pageSize) - 1, pageIndex + 5))} disabled={pageIndex + 5 >= Math.ceil(totalCount / pageSize)} variant="contained" color="warning" style={{ marginLeft: '10px', minWidth: '30px', padding: '5px' }}>
            +5
          </Button>
          <Button onClick={() => table.setPageIndex(Math.ceil(totalCount / pageSize) - 1)} disabled={pageIndex === Math.ceil(totalCount / pageSize) - 1} variant="contained" color="primary" style={{ marginLeft: '10px', minWidth: '30px', padding: '5px', width: 50 }}>
            끝
          </Button>
        </div>
        <div>
          <Typography variant="body1" component="span" style={{ marginRight: '10px' }}>
            Page {pageIndex + 1} / {Math.ceil(totalCount / pageSize)}
          </Typography>
          <Select
            value={pageSize}
            onChange={(e) => { 
              const newPageSize = Number(e.target.value);
              setPageSize(newPageSize); 
              fetchData(pageIndex, newPageSize, searchParams); 
            }}
          >
            {[5, 10, 20, 30, 40, 50].map((size) => (
              <MenuItem key={size} value={size}>
                Show {size}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
      {['EcoAS', 'AutoMapping', 'GTG', 'LCA'].map((modalType) => (
        <Dialog
          key={modalType}
          open={openModal === modalType}
          onClose={handleCloseModal}
          maxWidth="sm"
        >
          <DialogTitle>
            {modalType === 'EcoAS'
              ? 'EcoAS 관리표 가져오기'
              : modalType === 'AutoMapping'
              ? '자동 매핑'
              : modalType === 'GTG'
              ? 'GTG 결과 가져오기'
              : 'LCA 결과 가져오기'}
          </DialogTitle>
          <DialogContent
            dividers
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1, // 요소 간 간격
            }}
          >
            <UseCompany onCompanyChange={setSelectedCompany} showAllOption={false}/>
            <FormControl
              fullWidth
              margin="normal"
              sx={{
                width: '100%',
                maxWidth: '300px', // 원하는 최대 너비 설정
              }}
            >
              <InputLabel id={`${modalType}-year-label`}>연도</InputLabel>
              <Select
                labelId={`${modalType}-year-label`}
                label="연도"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200, // 드롭다운 높이 제한
                    },
                  },
                }}
              >
                {years.map((y) => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {modalType !== 'LCA' && (
              <FormControl
                fullWidth
                margin="normal"
                sx={{
                  width: '100%',
                  maxWidth: '300px',
                }}
              >
                <InputLabel id={`${modalType}-month-label`}>월</InputLabel>
                <Select
                  labelId={`${modalType}-month-label`}
                  label="월"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200, // 드롭다운 최대 높이
                        overflowY: 'auto', // 스크롤 가능
                      },
                    },
                  }}
                >
                  {months.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleSubmit}
              color="primary"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : '진행'}
            </Button>
            <Button onClick={handleCloseModal} color="secondary" variant="outlined">
              닫기
            </Button>
          </DialogActions>
        </Dialog>
      ))}
    </div>
  );
}