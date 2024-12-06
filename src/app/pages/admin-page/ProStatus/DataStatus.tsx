import React, { useState, useEffect, useCallback, useRef } from 'react';
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
} from '@mui/material';
import * as XLSX from 'xlsx';

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
];


export function DataStatus() {
  const [data, setData] = useState<Status[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState({
    year: '',
    month: '',
    company: null as Company | null,
  });
  const [companies, setCompanies] = useState<CompanyData[]>([]);

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
          state: item.state, // 상태 값 포함
        };
      });
    },
    [companies]
  );

  const fetchData = useCallback(async (pageIndex: number, pageSize: number, params: typeof searchParams) => {
    setLoading(true);
    try {
      let url = `https://lcaapi.acess.co.kr/ProcessStatus?page=${pageIndex + 1}&pageSize=${pageSize}`;
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
        <Button
          variant="contained"
          color="primary"
          style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleSearch}
        >
          자동 매핑
        </Button>
        <Button
          variant="contained"
          color="primary"
          style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleSearch}
        >
          GTG결과 가져오기
        </Button>
        <Button
          variant="contained"
          color="primary"
          style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleSearch}
        >
          LCA결과 가져오기
        </Button>
        <Button
          variant="contained"
          color="primary"
          style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleSearch}
        >
          EcoAS관리표 가져오기
        </Button>
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
                  {role !== 'User' && (
                    <TableCell
                      colSpan={1}
                      style={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        borderRight: '1px solid #e0e0e0',
                        backgroundColor: '#d8d8d8',
                      }}
                    >
                      결과
                    </TableCell>
                  )}
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
                    {role !== 'User' && (
                      <TableCell style={{ 
                        textAlign: 'center', 
                        backgroundColor: '#cfcfcf',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1,
                      }}>
                        산출
                      </TableCell>
                    )}
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
                      {role === 'Admin' && (
                        <TableCell style={{ textAlign: 'center' }}>
                          {/* row.original 접근이 제대로 이루어지는지 확인 */}
                          <Button
                            variant="contained"
                            disabled={row.original?.state !== 'Done'} // "Done"인 경우에만 버튼 활성화
                            onClick={() => console.log(`산출: ${row.original?.companyName}`)}
                          >
                            산출
                          </Button>
                        </TableCell>
                      )}
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
    </div>
  );
}