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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import * as XLSX from 'xlsx';

type ClientType = {
  inOutType: string;
  code: string;
  title: string;
};

type Basic = {
  id: number;
  transNo: string;
  takeDate: string;
  giveComNo: string;
  clientBizno: string | null;
  clientName: string;
  giveCarNo: string;
  transClient: {
    id: number;
    clientId: number;
    inOutType: string;
    clientType: string;
    clientName: string;
    bizNo: string;
  };
  transCar: {
    id: number;
    carId: number;
    carNo: string;
    spec: number;
  };
};

export function CTMapping() {
  const [data, setData] = useState<Basic[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [searchParams, setSearchParams] = useState({
    query: '',
    year: '',
    month: '',
    company: null as Company | null,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Basic['transClient'] | null>(null);
  const [selectedCar, setSelectedCar] = useState<Basic['transCar'] | null>(null);

  const fetchClientTypes = async () => {
    try {
      const response = await axios.get('https://lcaapi.acess.co.kr/Clients/types');
      setClientTypes(response.data);
    } catch (error) {
      console.error('Error fetching client types:', error);
    }
  };
  
  useEffect(() => {
    fetchClientTypes();
  }, []);

  const fetchData = useCallback(async (pageIndex: number, pageSize: number, searchQuery = '') => {
    setLoading(true);
    try {
      let url = `https://lcaapi.acess.co.kr/TransMapping?page=${pageIndex + 1}&pageSize=${pageSize}`;
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
  
      setData(list);
      setTotalCount(totalCount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.company) {
      fetchData(pageIndex, pageSize, searchParams.query);
    }
  }, [pageIndex, pageSize, fetchData, searchParams]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const getClientTypeTitle = (inOutType: string, code: string): string => {
    const clientType = clientTypes.find((type) => type.inOutType === inOutType && type.code === code);
    return clientType ? clientType.title : code;
  };
  
  const convertInOutType = (inOutType: string): string => {
    return inOutType === 'IN' ? '입고' : '출고';
  };

  const handleDownloadExcel = () => {
    const tableData = table.getRowModel().rows.map((row) => row.original);
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, '수집운반 관리표 원장.xlsx');
  };

  const handleSearch = () => {
    if (!selectedCompany) {
      setErrorMessage("사업회원을 선택하여주십시오");
      return;
    }
  
    setErrorMessage(null);
    setSearchParams({
      query: searchQuery,
      company: selectedCompany,
      year: year || '',  
      month,
    });
  };

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleConfirmClientMapping = async () => {
    if (selectedClient && selectedRowId !== null) {
      try {
        const response = await axios.post('https://lcaapi.acess.co.kr/TransMapping/client', {
          transOriginId: selectedRowId,
          clientId: selectedClient.clientId,
        });
        if (response.status === 204) {
          setData((prevData) =>
            prevData.map((item) =>
              item.id === selectedRowId
                ? { ...item, transClient: { ...item.transClient, id: selectedClient.id + 1 } } 
                : item
            )
          );
        }
        handleCloseClientModal();
      } catch (error) {
        console.error('Error confirming client mapping:', error);
      }
    }
  };
  
  const handleConfirmCarMapping = async () => {
    if (selectedCar && selectedRowId !== null) {
      try {
        const response = await axios.post('https://lcaapi.acess.co.kr/TransMapping/car', {
          transOriginId: selectedRowId,
          carId: selectedCar.carId,
        });
        if (response.status === 204) {
          setData((prevData) =>
            prevData.map((item) =>
              item.id === selectedRowId
                ? { ...item, transCar: { ...item.transCar, id: selectedCar.id + 1 } }  
                : item
            )
          );
        }
        handleCloseCarModal();
      } catch (error) {
        console.error('Error confirming car mapping:', error);
      }
    }
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
    setMonth(event.target.value === "전체" ? "" : event.target.value);
  };

  const columns: ColumnDef<Basic>[] = [
    { accessorKey: 'transNo', header: '관리표 번호' },
    { accessorKey: 'takeDate', header: '인수일' },
    { accessorKey: 'giveComNo', header: () => <div style={{ textAlign: 'center' }}>인계업체 코드</div>},
    { accessorKey: 'clientBizno', header: '거래처 사업자번호' },
    { accessorKey: 'clientName', header: '거래처 이름' },
    { accessorKey: 'giveCarNo', header: '인계 차량번호' },
    {
      id: 'transClient',
      header: '거래처 매핑 상태',
      cell: ({ row }) => (
        <Button
          variant="contained"
          sx={{
            backgroundColor: row.original.transClient.id > 0 ? 'success.main' : 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: row.original.transClient.id > 0 ? 'success.dark' : 'error.dark'
            }
          }}
          onClick={() => handleOpenClientModal(row.original.transClient, row.original.id)}
        >
          {row.original.transClient.id > 0 ? '완료' : '미완료'}
        </Button>
      ),
    },
    {
      id: 'transCar',
      header: '차량 매핑 상태',
      cell: ({ row }) => (
        <Button
          variant="contained"
          sx={{
            backgroundColor: row.original.transCar.id > 0 ? 'success.main' : 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: row.original.transCar.id > 0 ? 'success.dark' : 'error.dark'
            }
          }}
          onClick={() => handleOpenCarModal(row.original.transCar, row.original.id)}
        >
          {row.original.transCar.id > 0 ? '완료' : '미완료'}
        </Button>
      ),
    },
  ];

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

  const handleOpenClientModal = (client: Basic['transClient'], id: number) => {
    setSelectedClient(client);
    setSelectedRowId(id);
    setClientModalOpen(true);
  };
  
  const handleOpenCarModal = (car: Basic['transCar'], id: number) => {
    setSelectedCar(car);
    setSelectedRowId(id);
    setCarModalOpen(true);
  };

  const handleCloseClientModal = () => {
    setClientModalOpen(false);
    setSelectedClient(null);
  };

  const handleCloseCarModal = () => {
    setCarModalOpen(false);
    setSelectedCar(null);
  };

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        수집운반 매핑
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
          style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleSearch}
        >
          조회
        </Button>
      </div>
      <TableContainer
        component={Paper}
        style={{ maxHeight: 545, overflowY: 'auto' }}
        className="custom-scrollbar custom-table"
      >
      <Table>
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
              <TableCell colSpan={columns.length} style={{ textAlign: 'center' }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : errorMessage ? (
            <TableRow>
              <TableCell colSpan={columns.length} style={{ textAlign: 'center', color: 'red' }}>
                {errorMessage}
              </TableCell>
            </TableRow>
          ) : !selectedCompany ? (
            <TableRow>
              <TableCell colSpan={columns.length} style={{ textAlign: 'center', color: 'red' }}>
                조회하여 주십시오.
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    textAlign: ['giveComNo'].includes(cell.column.id) ? 'right' : 'left',
                  }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} style={{ textAlign: 'center' }}>
                데이터가 없습니다.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
    <Dialog open={clientModalOpen} onClose={handleCloseClientModal} maxWidth="sm" fullWidth>
      <DialogTitle>거래처 매핑 확인</DialogTitle>
      <DialogContent dividers>
        {selectedClient && (
          <>
            <Typography variant="h6" gutterBottom>거래처 정보</Typography>
            <Typography variant="body1"><strong>거래처 ID:</strong> {selectedClient.clientId}</Typography>
            <Typography variant="body1"><strong>거래처 명:</strong> {selectedClient.clientName}</Typography>
            <Typography variant="body1"><strong>거래처 사업자번호:</strong> {selectedClient.bizNo}</Typography>
            <Typography variant="body1"><strong>거래처 구분:</strong> {getClientTypeTitle(selectedClient.inOutType, selectedClient.clientType)}</Typography>
            <Typography variant="body1"><strong>입출고 구분:</strong> {convertInOutType(selectedClient.inOutType)}</Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseClientModal} color="secondary" variant="outlined">닫기</Button>
        {selectedClient && selectedClient.id === 0 && (
          <Button onClick={handleConfirmClientMapping} color="primary" variant="contained">확정</Button>
        )}
      </DialogActions>
    </Dialog>

    <Dialog open={carModalOpen} onClose={handleCloseCarModal} maxWidth="sm" fullWidth>
      <DialogTitle>차량 매핑 확인</DialogTitle>
      <DialogContent dividers>
        {selectedCar && (
          <>
            <Typography variant="h6" gutterBottom>차량 정보</Typography>
            <Typography variant="body1"><strong>차량 ID:</strong> {selectedCar.carId}</Typography>
            <Typography variant="body1"><strong>차량번호:</strong> {selectedCar.carNo}</Typography>
            <Typography variant="body1"><strong>차량규격:</strong> {selectedCar.spec}</Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseCarModal} color="secondary" variant="outlined">닫기</Button>
        {selectedCar && selectedCar.id === 0 && (
          <Button onClick={handleConfirmCarMapping} color="primary" variant="contained">확정</Button>
        )}
      </DialogActions>
    </Dialog>
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