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
  Autocomplete,
} from '@mui/material';
import * as XLSX from 'xlsx';

type ClientType = {
  inOutType: string;
  code: string;
  title: string;
};


type Car = {
  id: number;
  companycode: string;
  inOutType: string;
  carNo: string;
  spec: number;
};

type Client = {
  id: number;
  companyCode: string;
  inOutType: string;
  type: string;
  name: string;
  bizNo: string;
  address: string;
  distance: number;
};

type WasteItem = {
  id: number;
  wasteGroup: string;
  name: string;
};

type Basic = {
  id: number;
  companyCode: string;
  reccNo: string;
  reccDate: string;
  clientBizno: string | null;
  clientName: string;
  etcGubun: string;
  etcName: string;
  etcMethod: string;
  carNo: string;
  item1: string;
  item2: string;
  item3: string;
  weight: number;
  ecoasWeight: number;
  reccWasteCar: {
    id: number;
    carId: number;
    inOutType: string;
    carNo: string;
    spec: number;
  };
  reccWasteClient: {
    id: number;
    clientId: number;
    inOutType: string;
    clientType: string;
    clientName: string;
    bizNo: string;
  };
  reccWasteItem: {
    id: number;
    wasteItemId: number;
    wasteGroup: string;
    name: string;
    items: string[];
  } | null;
  selectedValuableThingId?: number; 
};

export function DisMapping() {
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
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([]);
  const [clients, setClients] = useState<Basic['reccWasteClient'][]>([]);
  const [cars, setCars] = useState<Basic['reccWasteCar'][]>([]);
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
  const [selectedClient, setSelectedClient] = useState<Basic['reccWasteClient'] | null>(null);
  const [selectedCar, setSelectedCar] = useState<Basic['reccWasteCar'] | null>(null);

  const fetchClientTypes = async () => {
    try {
      const response = await axios.get('https://lcaapi.acess.co.kr/Clients/types');
      setClientTypes(response.data);
    } catch (error) {
      console.error('거래처 타입 데이터를 가져오는 중 에러 발생:', error);
    }
  };
  
  useEffect(() => {
    fetchClientTypes();
  }, []);

  const fetchCars = async (companyCode: string) => {
    try {
      const response = await axios.get(`https://lcaapi.acess.co.kr/Cars?companyCode=${companyCode}&inOutType=OUT&page=1&pageSize=1000`);
      const carsData = Array.isArray(response.data.list) ? response.data.list.map((car: Car) => ({
        id: car.id,
        carId: car.id,
        inOutType: car.inOutType,
        carNo: car.carNo,
        spec: car.spec,
      })) : [];
      setCars(carsData);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setErrorMessage('권한이 없습니다');
      } else {
        console.error('차량 데이터를 가져오는 중 에러 발생:', error);
        setErrorMessage('데이터를 가져오는 중 에러 발생');
      }
      setCars([]);
    }
  };

  const fetchClients = async (companyCode: string) => {
    try {
      const response = await axios.get(`https://lcaapi.acess.co.kr/Clients?companyCode=${companyCode}&inOutType=OUT&type=WS&withPagination=false`);
      const fetchedClients = Array.isArray(response.data.list) ? response.data.list.map((client: Client) => ({
        id: client.id,
        clientId: client.id,
        inOutType: client.inOutType,
        clientType: client.type,
        clientName: client.name,
        bizNo: client.bizNo,
      })) : [];
      setClients(fetchedClients);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setErrorMessage('권한이 없습니다');
      } else {
        console.error('거래처 데이터를 가져오는 중 에러 발생:', error);
        setErrorMessage('데이터를 가져오는 중 에러 발생');
      }
      setClients([]);
    }
  };
  
  useEffect(() => {
    if (selectedCompany) {
      fetchClients(selectedCompany.code);
      fetchCars(selectedCompany.code); 
    }
  }, [selectedCompany]);

  const fetchWasteItems = async (companyCode: string) => {
    try {
      const response = await axios.get(`https://lcaapi.acess.co.kr/WasteItems?companyCode=${companyCode}`);
      const { wasteItems } = response.data;
      setWasteItems(wasteItems);
    } catch (error) {
      console.error('폐기물 항목을 가져오는 중 에러 발생:', error);
    }
  };

  useEffect(() => {
    if (selectedCompany) {
      fetchWasteItems(selectedCompany.code);
    }
  }, [selectedCompany]);

  const fetchData = useCallback(async (pageIndex: number, pageSize: number, searchQuery = '') => {
    setLoading(true);
    try {
      let url = `https://lcaapi.acess.co.kr/ReccWasteMapping?page=${pageIndex + 1}&pageSize=${pageSize}`;
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
      console.error('데이터를 가져오는 중 에러 발생:', error);
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
    XLSX.writeFile(workbook, '폐기 매핑.xlsx');
  };

  const handleSearch = () => {
    if (!selectedCompany) {
        setErrorMessage("사업회원을 선택하여주십시오");
        return;
    }

    setErrorMessage(null);

    setPageIndex(0);

    setSearchParams({
        query: searchQuery,
        company: selectedCompany,
        year: year || '', 
        month: month || '', 
    });
};

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleConfirmClientMapping = async () => {
    if (selectedClient && selectedRowId !== null) {
      const postData = {
        reccWasteId: selectedRowId,
        clientId: selectedClient.clientId,
      };
      
  
      try {
        const response = await axios.post('https://lcaapi.acess.co.kr/ReccWasteMapping/Client', postData);

        if (response.status === 204) {
          setData((prevData) =>
            prevData.map((item) =>
              item.id === selectedRowId
                ? { ...item, reccWasteClient: { ...item.reccWasteClient, id: selectedClient.id + 1 } }
                : item
            )
          );
        }
        handleCloseClientModal();
      } catch (error) {
        console.error('거래처 매핑 확인 중 에러 발생:', error);
      }
    }
  };

  const handleConfirmCarMapping = async () => {
    if (selectedCar && selectedRowId !== null) {
      const postData = {
        reccWasteId: selectedRowId,
        carId: selectedCar.carId,
      };
      
  
      try {
        const response = await axios.post('https://lcaapi.acess.co.kr/ReccWasteMapping/Car', postData);
  
        if (response.status === 204) {
          setData((prevData) =>
            prevData.map((item) =>
              item.id === selectedRowId
                ? { ...item, reccWasteCar: { ...item.reccWasteCar, id: selectedCar.id + 1 } }
                : item
            )
          );
        }
        handleCloseCarModal();
      } catch (error) {
        console.error('차량 매핑 확인 중 에러 발생:', error);
      }
    }
  };

  const handleConfirmItemMapping = async () => {
    if (selectedItem !== null && selectedRowId !== null) {
      const selectedWasteItem = wasteItems.find(item => item.id === selectedItem);
      const postData = {
        reccWasteId: selectedRowId,
        wasteItemId: selectedItem,
      };
  
  
      try {
        const response = await axios.post('https://lcaapi.acess.co.kr/ReccWasteMapping/Item', postData);
  
        if (response.status === 204 && selectedWasteItem) {
          setData((prevData) =>
            prevData.map((item) =>
              item.id === selectedRowId
                ? { ...item, reccWasteItem: { id: selectedItem, wasteItemId: selectedItem, wasteGroup: selectedWasteItem.wasteGroup, name: selectedWasteItem.name, items: [] } }
                : item
            )
          );
        }
        handleCloseItemModal();
      } catch (error) {
        console.error('제품 매핑 확인 중 에러 발생:', error);
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
    const selectedYear = event.target.value as string;
    setYear(selectedYear);
  };

  const handleMonthChange = (event: SelectChangeEvent<string>) => {
    const selectedMonth = event.target.value as string;
    setMonth(selectedMonth === "전체" ? "" : selectedMonth);
  };

  const columns: ColumnDef<Basic>[] = [
    { accessorKey: 'reccNo', header: '관리표 번호' },
    { accessorKey: 'reccDate', header: '폐기일자' },
    { accessorKey: 'clientBizno', header: '거래처 사업자번호' },
    { accessorKey: 'clientName', header: '거래처 이름' },
    { accessorKey: 'carNo', header: '차량번호' },
    { accessorKey: 'item1', header: '품목군' },
    { accessorKey: 'item2', header: '제품군' },
    { accessorKey: 'item3', header: '제품분류' },
    { accessorKey: 'etcMethod', header: '처리방법'},
    {
      id: 'valuableMapping',
      header: '폐기물 매핑 상태',
      cell: ({ row }) => (
        <Button
          variant="contained"
          sx={{
            backgroundColor: row.original.reccWasteItem && row.original.reccWasteItem.id > 0 ? 'success.main' : 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: row.original.reccWasteItem && row.original.reccWasteItem.id > 0 ? 'success.dark' : 'error.dark'
            }
          }}
          onClick={() => handleOpenItemModal(row.original.id, row.original.reccWasteItem?.id || 0)}
        >
          {row.original.reccWasteItem && row.original.reccWasteItem.id > 0 ? '완료' : '미완료'}
        </Button>
      ),
    },
    { accessorKey: 'weight', header: () => <div style={{ textAlign: 'center' }}>무게(kg)</div>},
    { accessorKey: 'ecoasWeight', header: () => <div style={{ textAlign: 'center' }}>EcoAS무게(kg)</div>},
    {
      id: 'reccWasteClient',
      header: '거래처 매핑 상태',
      cell: ({ row }) => (
        <Button
          variant="contained"
          sx={{
            backgroundColor: row.original.reccWasteClient?.id ? 'success.main' : 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: row.original.reccWasteClient?.id ? 'success.dark' : 'error.dark'
            }
          }}
          onClick={() => handleOpenClientModal(row.original.reccWasteClient, row.original.id)}
        >
          {row.original.reccWasteClient?.id ? '완료' : '미완료'}
        </Button>
      ),
    },
    {
      id: 'reccWasteCar',
      header: '차량 매핑 상태',
      cell: ({ row }) => (
        <Button
          variant="contained"
          sx={{
            backgroundColor: row.original.reccWasteCar?.id ? 'success.main' : 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: row.original.reccWasteCar?.id ? 'success.dark' : 'error.dark'
            }
          }}
          onClick={() => handleOpenCarModal(row.original.reccWasteCar, row.original.id)}
        >
          {row.original.reccWasteCar?.id ? '완료' : '미완료'}
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

  const handleOpenClientModal = (client: Basic['reccWasteClient'], id: number) => {
    setSelectedClient(client);
    setSelectedRowId(id);
    setClientModalOpen(true);
  };
  
  const handleOpenCarModal = (car: Basic['reccWasteCar'], id: number) => {
    setSelectedCar(car);
    setSelectedRowId(id);
    setCarModalOpen(true);
  };
  
  const handleOpenItemModal = (rowId: number, value: number) => {
    setSelectedRowId(rowId);
    setSelectedItem(value);
    setItemModalOpen(true);
  };
  
  const handleCloseItemModal = () => {
    setItemModalOpen(false);
    setSelectedItem(null);
  };
  
  const handleCloseClientModal = () => {
    setClientModalOpen(false);
    setSelectedClient(null);
  };
  
  const handleCloseCarModal = () => {
    setCarModalOpen(false);
    setSelectedCar(null);
  };

  const navigateToClientManagement = () => {
    window.location.href = '/AdminClient'; 
  };

  const navigateToWasteManagement = () => {
    window.location.href = '/Ad_Waste'; 
  };

  const navigateToCarsManagement = () => {
    window.location.href = '/CarsControl'; 
  };
  
  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        폐기물 매핑
      </Typography>
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
        <Button
          variant="contained"
          color="secondary"
          style={{ height: '35px', marginBottom: '20px', padding: '0 10px', fontSize: '14px', display: 'none' }}
          onClick={handleDownloadExcel}
        >
          엑셀 다운로드
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
                  사업회원을 선택하여 조회하십시오.
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
                        textAlign: ['weight', 'ecoasWeight'].includes(cell.column.id) ? 'right' : 'left',
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
      <Dialog open={clientModalOpen} onClose={handleCloseClientModal} maxWidth="sm" fullWidth>
        <DialogTitle>거래처 매핑 확인</DialogTitle>
        <DialogContent dividers>
          {selectedClient && selectedClient.clientId !== 0 ? (
            <>
              <Typography variant="h6" gutterBottom>거래처 정보</Typography>
              <Typography variant="body1"><strong>거래처 ID:</strong> {selectedClient.clientId}</Typography>
              <Typography variant="body1"><strong>거래처 이름:</strong> {selectedClient.clientName}</Typography>
              <Typography variant="body1"><strong>사업자번호:</strong> {selectedClient.bizNo}</Typography>
              <Typography variant="body1"><strong>거래처 구분:</strong> {getClientTypeTitle(selectedClient.inOutType, selectedClient.clientType)}</Typography>
              <Typography variant="body1"><strong>입출고 구분:</strong> {convertInOutType(selectedClient.inOutType)}</Typography>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>거래처 정보</Typography>
              <Autocomplete
                options={clients}
                getOptionLabel={(option) => option.clientName}
                renderInput={(params) => <TextField {...params} label="거래처 선택" variant="outlined" />}
                value={selectedClient}
                onChange={(event, newValue) => {
                  setSelectedClient(newValue || null);
                }}
                isOptionEqualToValue={(option, value) => option.clientId === value.clientId}
              />
            </>
          )}
        </DialogContent>
        <DialogActions style={{ justifyContent: 'space-between' }}>
          <Button onClick={navigateToClientManagement} color="primary" variant="contained">거래처 관리</Button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={handleCloseClientModal} color="secondary" variant="outlined">닫기</Button>
            <Button onClick={handleConfirmClientMapping} color="primary" variant="contained">확정</Button>
          </div>
        </DialogActions>
      </Dialog>

      <Dialog open={carModalOpen} onClose={handleCloseCarModal} maxWidth="sm" fullWidth>
        <DialogTitle>차량 매핑 확인</DialogTitle>
        <DialogContent dividers>
          {selectedCar && selectedCar.carId !== 0 ? (
            <>
              <Typography variant="h6" gutterBottom>차량 정보</Typography>
              <Typography variant="body1"><strong>차량 ID:</strong> {selectedCar.carId}</Typography>
              <Typography variant="body1"><strong>차량번호:</strong> {selectedCar.carNo}</Typography>
              <Typography variant="body1"><strong>차량규격:</strong> {selectedCar.spec}</Typography>
              <Typography variant="body1"><strong>입출고 구분:</strong> {convertInOutType(selectedCar.inOutType)}</Typography>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>차량 정보</Typography>
              <Autocomplete
                options={cars}
                getOptionLabel={(option) => option.carNo}
                renderInput={(params) => <TextField {...params} label="차량 선택" variant="outlined" />}
                value={selectedCar}
                onChange={(event, newValue) => {
                  setSelectedCar(newValue || null);
                }}
                isOptionEqualToValue={(option, value) => option.carId === value.carId}
                style={{ maxHeight: 224, overflowY: 'auto' }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions style={{ justifyContent: 'space-between' }}>
          <Button onClick={navigateToCarsManagement} color="primary" variant="contained">차량 관리</Button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={handleCloseCarModal} color="secondary" variant="outlined">닫기</Button>
            <Button onClick={handleConfirmCarMapping} color="primary" variant="contained">확정</Button>
          </div>
        </DialogActions>
      </Dialog>

      <Dialog open={itemModalOpen} onClose={handleCloseItemModal} maxWidth="sm" fullWidth>
        <DialogTitle>폐기물 매핑 확인</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>폐기물 정보</Typography>
          <Autocomplete
            options={wasteItems}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => <TextField {...params} label="폐기물 선택" variant="outlined" />}
            value={wasteItems.find(item => item.id === selectedItem) || null}
            onChange={(event, newValue) => {
              setSelectedItem(newValue ? newValue.id : null);
            }}
            style={{ maxHeight: 224, overflowY: 'auto' }}
          />
        </DialogContent>
        <DialogActions style={{ justifyContent: 'space-between' }}>
        <Button onClick={navigateToWasteManagement} color="primary" variant="contained">폐기물 관리</Button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={handleCloseItemModal} color="secondary" variant="outlined">닫기</Button>
          <Button onClick={handleConfirmItemMapping} color="primary" variant="contained">확정</Button>
        </div>
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