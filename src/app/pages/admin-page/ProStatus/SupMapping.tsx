import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
import ValuableMap from '../../ComponentBox/ValuableMap';

type Car = {
  id: number;
  companycode: string;
  inOutType: string;
  carNo: string;
  spec: number;
};

type ClientType = {
  inOutType: string;
  code: string;
  title: string;
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

type Basic = {
  id: number;
  companyCode: string;
  reccNo: string;
  reccDate: string;
  clientBizno: string;
  clientName: string;
  carNo: string;
  item1: string;
  item2: string;
  item3: string;
  weight: number;
  ecoasWeight: number;
  reccSupplyCar: {
    id: number;
    carId: number;
    inOutType: string;
    carNo: string;
    spec: number;
  };
  reccSupplyClient: {
    id: number;
    clientId: number;
    inOutType: string;
    clientType: string;
    clientName: string;
    bizNo: string;
  };
  reccSupplyClient2nd: {
    id: number;
    clientId: number;
    inOutType: string;
    clientType: string;
    clientName: string;
    bizNo: string;
  } | null;
  reccSupplyItem: {
    id: number;
    valuableThingId: number;
    valuableThingTitle: string;
  } | null;
  selectedValuableThingId?: number; 
};

export function SupMapping() {
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
  const [itemMappingStatus, setItemMappingStatus] = useState<string>('');
  const [clientMappingStatus, setClientMappingStatus] = useState<string>('');
  const [extraClientMappingStatus, setExtraClientMappingStatus] = useState<string>('');
  const [carMappingStatus, setCarMappingStatus] = useState<string>('');
  const [searchParams, setSearchParams] = useState({
    query: '',
    year: '',
    month: '',
    company: null as Company | null,
    itemMappingStatus: '', // 유가물 매핑 상태
    clientMappingStatus: '', // 거래처 매핑 상태
    extraClientMappingStatus: '', // 2차 거래처 매핑 상태
    carMappingStatus: '', // 차량 매핑 상태
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Basic['reccSupplyClient'] | null>(null);
  const [selectedCar, setSelectedCar] = useState<Basic['reccSupplyCar'] | null>(null);
  const [client2ndModalOpen, setClient2ndModalOpen] = useState(false);
  const [clients, setClients] = useState<Basic['reccSupplyClient'][]>([]);
  const [clients2nd, setClients2nd] = useState<Basic['reccSupplyClient'][]>([]);
  const [cars, setCars] = useState<Basic['reccSupplyCar'][]>([]);
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [selectedClient2nd, setSelectedClient2nd] = useState<Basic['reccSupplyClient'] | null>(null);
  const navigate = useNavigate();
  
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
      const response = await axios.get(`https://lcaapi.acess.co.kr/Clients?companyCode=${companyCode}&inOutType=OUT&type=VP&withPagination=false`);
      const clientsData = Array.isArray(response.data.list) ? response.data.list.map((client: Client) => ({
        id: client.id,
        clientId: client.id,
        inOutType: client.inOutType,
        clientType: client.type,
        clientName: client.name,
        bizNo: client.bizNo,
      })) : [];
      setClients(clientsData);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setErrorMessage('권한이 없습니다');
      } else {
        console.error('1차 거래처 데이터를 가져오는 중 에러 발생:', error);
        setErrorMessage('데이터를 가져오는 중 에러 발생');
      }
      setClients([]);
    }
  };

  const fetchClients2nd = async (companyCode: string) => {
    try {
      const response = await axios.get(`https://lcaapi.acess.co.kr/Clients?companyCode=${companyCode}&inOutType=OUT&type=VP&withPagination=false`);
      const clients = Array.isArray(response.data.list) ? response.data.list.map((client: Client) => ({
        id: client.id,
        clientId: client.id,
        inOutType: client.inOutType,
        clientType: client.type,
        clientName: client.name,
        bizNo: client.bizNo,
      })) : [];
      setClients2nd(clients);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setErrorMessage('권한이 없습니다');
      } else {
        console.error('2차 거래처 데이터를 가져오는 중 에러 발생:', error);
        setErrorMessage('데이터를 가져오는 중 에러 발생');
      }
      setClients2nd([]);
    }
  };
  
  useEffect(() => {
    if (selectedCompany) {
      fetchClients(selectedCompany.code);
      fetchClients2nd(selectedCompany.code);
      fetchCars(selectedCompany.code); 
    }
  }, [selectedCompany]);

  const fetchData = useCallback(async (pageIndex: number, pageSize: number, searchQuery = '') => {
    setLoading(true);
    try {
      let url = `https://lcaapi.acess.co.kr/ReccValuableMapping?page=${pageIndex + 1}&pageSize=${pageSize}`;
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
      if (searchParams.itemMappingStatus) {
        url += `&itemMappingStatus=${searchParams.itemMappingStatus}`;
      }
      if (searchParams.clientMappingStatus) {
        url += `&clientMappingStatus=${searchParams.clientMappingStatus}`;
      }
      if (searchParams.extraClientMappingStatus) {
        url += `&extraClientMappingStatus=${searchParams.extraClientMappingStatus}`;
      }
      if (searchParams.carMappingStatus) {
        url += `&carMappingStatus=${searchParams.carMappingStatus}`;
      }
  
      const response = await axios.get(url);
      const { list, totalCount } = response.data;
  
      setData(list);
      setTotalCount(totalCount);
      setLoading(false);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setErrorMessage('권한이 없습니다');
      } else {
        console.error('데이터를 가져오는 중 에러 발생:', error);
        setErrorMessage('데이터를 가져오는 중 에러 발생');
      }
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
    XLSX.writeFile(workbook, '공급 매핑.xlsx');
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
      itemMappingStatus, // 유가물 매핑 상태
      clientMappingStatus, // 거래처 매핑 상태
      extraClientMappingStatus, // 2차 거래처 매핑 상태
      carMappingStatus, // 차량 매핑 상태
    });
  };

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleConfirmClientMapping = async () => {
    if (selectedClient && selectedRowId !== null) {
      const postData = {
        reccSupplyId: selectedRowId,
        clientId: selectedClient.clientId,
      };
      
      try {
        const response = await axios.post('https://lcaapi.acess.co.kr/ReccSupplyMapping/Client', postData);
  
        if (response.status === 204) {
          setData((prevData) =>
            prevData.map((item) =>
              item.id === selectedRowId
                ? { ...item, reccSupplyClient: { ...item.reccSupplyClient, id: selectedClient.id + 1 } }
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
        reccSupplyId: selectedRowId,
        carId: selectedCar.carId,
      };
      
  
      try {
        const response = await axios.post('https://lcaapi.acess.co.kr/ReccSupplyMapping/Car', postData);
  
        if (response.status === 204) {
          setData((prevData) =>
            prevData.map((item) =>
              item.id === selectedRowId
                ? { ...item, reccSupplyCar: { ...item.reccSupplyCar, id: selectedCar.id + 1 } }
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
      const postData = {
        reccSupplyId: selectedRowId,
        valuableThingId: selectedItem,
      };
  
    
      try {
        const response = await axios.post('https://lcaapi.acess.co.kr/ReccSupplyMapping/Item', postData);
  
        if (response.status === 204) {
          setData((prevData) =>
            prevData.map((item) =>
              item.id === selectedRowId
                ? { ...item, reccSupplyItem: { id: selectedItem, valuableThingId: selectedItem, valuableThingTitle: 'Updated Item' } }
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

  const handleConfirmClient2ndMapping = async () => {
    if (selectedClient2nd && selectedRowId !== null) {
      const postData = {
        reccSupplyId: selectedRowId,
        clientId: selectedClient2nd.clientId,
      };
  
  
      try {
        const response = await axios.post('https://lcaapi.acess.co.kr/ReccSupplyMapping/Client2nd', postData);
  
        if (response.status === 204) {
          setData((prevData) =>
            prevData.map((item) =>
              item.id === selectedRowId
                ? { ...item, reccSupplyClient2nd: { ...selectedClient2nd } }
                : item
            )
          );
        }
        handleCloseClient2ndModal();
      } catch (error) {
        console.error('2차 거래처 매핑 확인 중 에러 발생:', error);
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
    { accessorKey: 'reccDate', header: '공급일자' },
    { accessorKey: 'clientBizno', header: '거래처 사업자번호' },
    { accessorKey: 'clientName', header: '거래처 이름' },
    { accessorKey: 'carNo', header: '차량번호' },
    { accessorKey: 'item1', header: '품목군' },
    { accessorKey: 'item2', header: '제품군' },
    { accessorKey: 'item3', header: '제품분류' },
    {
      id: 'valuableMapping',
      header: '유가물 매핑 상태',
      cell: ({ row }) => (
        <Button
          variant="contained"
          sx={{
            backgroundColor: row.original.reccSupplyItem && row.original.reccSupplyItem.id ? 'success.main' : 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: row.original.reccSupplyItem && row.original.reccSupplyItem.id ? 'success.dark' : 'error.dark'
            }
          }}
          onClick={() => handleOpenItemModal(row.original.id, row.original.reccSupplyItem?.id || 0)}
        >
          {row.original.reccSupplyItem && row.original.reccSupplyItem.id ? '완료' : '미완료'}
        </Button>
      ),
    },
    { accessorKey: 'weight', header: () => <div style={{ textAlign: 'center' }}>무게(kg)</div>},
    { accessorKey: 'ecoasWeight', header: () => <div style={{ textAlign: 'center' }}>EcoAS무게(kg)</div>},
    {
      id: 'reccSupplyClient',
      header: '거래처 매핑 상태',
      cell: ({ row }) => (
        <Button
          variant="contained"
          sx={{
            backgroundColor: row.original.reccSupplyClient?.id ? 'success.main' : 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: row.original.reccSupplyClient?.id ? 'success.dark' : 'error.dark'
            }
          }}
          onClick={() => handleOpenClientModal(row.original.reccSupplyClient || { id: 0, clientId: 0, inOutType: '', clientType: '', clientName: '', bizNo: '' }, row.original.id)}
        >
          {row.original.reccSupplyClient?.id ? '완료' : '미완료'}
        </Button>
      ),
    },
    {
      id: 'reccSupplyClient2nd',
      header: '2차 거래처 매핑 상태',
      cell: ({ row }) => (
        <Button
          variant="contained"
          sx={{
            backgroundColor: row.original.reccSupplyClient2nd && row.original.reccSupplyClient2nd.id ? 'success.main' : 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: row.original.reccSupplyClient2nd && row.original.reccSupplyClient2nd.id ? 'success.dark' : 'error.dark'
            }
          }}
          onClick={() => handleOpenClient2ndModal(row.original.reccSupplyClient2nd || { id: 0, clientId: 0, inOutType: '', clientType: '', clientName: '', bizNo: '' }, row.original.id)}
        >
          {row.original.reccSupplyClient2nd && row.original.reccSupplyClient2nd.id ? '완료' : '미완료'}
        </Button>
      ),
    },
    {
      id: 'reccSupplyCar',
      header: '차량 매핑 상태',
      cell: ({ row }) => (
        <Button
          variant="contained"
          sx={{
            backgroundColor: row.original.reccSupplyCar?.id ? 'success.main' : 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: row.original.reccSupplyCar?.id ? 'success.dark' : 'error.dark'
            }
          }}
          onClick={() => handleOpenCarModal(row.original.reccSupplyCar, row.original.id)}
        >
          {row.original.reccSupplyCar?.id ? '완료' : '미완료'}
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

  const handleOpenClientModal = (client: Basic['reccSupplyClient'], id: number) => {
    setSelectedClient(client);
    setSelectedRowId(id);
    setClientModalOpen(true);
  };
  
  const handleOpenCarModal = (car: Basic['reccSupplyCar'], id: number) => {
    setSelectedCar(car);
    setSelectedRowId(id);
    setCarModalOpen(true);
  };

  const handleOpenItemModal = (rowId: number, value: number) => {
    setSelectedRowId(rowId);
    setSelectedItem(value);
    setItemModalOpen(true);
  };
  
  const handleOpenClient2ndModal = (client2nd: Basic['reccSupplyClient2nd'], id: number) => {
    setSelectedClient2nd(client2nd);
    setSelectedRowId(id);
    if (selectedCompany) {
      fetchClients2nd(selectedCompany.code);
    }
    setClient2ndModalOpen(true);
  };
  
  const handleCloseClient2ndModal = () => {
    setClient2ndModalOpen(false);
    setSelectedClient2nd(null);
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

  const navigateToCarsManagement = () => {
    navigate('/CarsControl');
  }

  const navigateToClientManagement = () => {
    navigate('/AdminClient');
  };

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        유가물 매핑
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
          style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px'}}
          onClick={handleSearch}
        >
          조회
        </Button>
        <Button
          variant="contained"
          color="secondary"
          style={{ height: '35px', padding: '0 10px', fontSize: '14px', display: 'none',}}
          onClick={handleDownloadExcel}
        >
          엑셀 다운로드
        </Button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <FormControl style={{ marginRight: '10px' }}>
          <InputLabel id="item-mapping-status-label">유가물 매핑 상태 조회</InputLabel>
          <Select
            labelId="item-mapping-status-label"
            id="item-mapping-status-select"
            value={itemMappingStatus}
            label="유가물 매핑 상태 조회"
            onChange={(e) => setItemMappingStatus(e.target.value)}
            style={{ width: '200px' }}
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
            <MenuItem value="MAPPED">매핑됨</MenuItem>
            <MenuItem value="NOT">매핑필요</MenuItem>
          </Select>
        </FormControl>

        <FormControl style={{ marginRight: '10px' }}>
          <InputLabel id="client-mapping-status-label">거래처 매핑 상태 조회</InputLabel>
          <Select
            labelId="client-mapping-status-label"
            id="client-mapping-status-select"
            value={clientMappingStatus}
            label="거래처 매핑 상태 조회"
            onChange={(e) => setClientMappingStatus(e.target.value)}
            style={{ width: '200px' }}
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
            <MenuItem value="MAPPED">매핑됨</MenuItem>
            <MenuItem value="NOT">매핑필요</MenuItem>
          </Select>
        </FormControl>

        <FormControl style={{ marginRight: '10px' }}>
          <InputLabel id="extra-client-mapping-status-label">2차 거래처 매핑 상태 조회</InputLabel>
          <Select
            labelId="extra-client-mapping-status-label"
            id="extra-client-mapping-status-select"
            value={extraClientMappingStatus}
            label="2차 거래처 매핑 상태 조회"
            onChange={(e) => setExtraClientMappingStatus(e.target.value)}
            style={{ width: '220px' }}
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
            <MenuItem value="MAPPED">매핑됨</MenuItem>
            <MenuItem value="NOT">매핑필요</MenuItem>
          </Select>
        </FormControl>

        <FormControl style={{ marginRight: '10px' }}>
          <InputLabel id="car-mapping-status-label">차량 매핑 상태 조회</InputLabel>
          <Select
            labelId="car-mapping-status-label"
            id="car-mapping-status-select"
            value={carMappingStatus}
            label="차량 매핑 상태 조회"
            onChange={(e) => setCarMappingStatus(e.target.value)}
            style={{ width: '200px' }}
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
            <MenuItem value="MAPPED">매핑됨</MenuItem>
            <MenuItem value="NOT">매핑필요</MenuItem>
          </Select>
        </FormControl>
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
              <Typography variant="body1"><strong>거래처 명칭:</strong> {selectedClient.clientName}</Typography>
              <Typography variant="body1"><strong>거래처 사업자번호:</strong> {selectedClient.bizNo}</Typography>
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
        <DialogTitle>유가물 매핑 확인</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>유가물 정보</Typography>
          <ValuableMap
            value={selectedItem || null}
            onChange={(value) => setSelectedItem(value)}
            menuWidth="160px"
            fontSize="12px"
          />
        </DialogContent>
        <DialogActions>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button onClick={handleCloseItemModal} color="secondary" variant="outlined">닫기</Button>
          <Button onClick={handleConfirmItemMapping} color="primary" variant="contained">확정</Button>
        </div>
        </DialogActions>
      </Dialog>

      <Dialog open={client2ndModalOpen} onClose={handleCloseClient2ndModal} maxWidth="sm" fullWidth>
        <DialogTitle>2차 거래처 매핑 확인</DialogTitle>
        <DialogContent dividers>
          {selectedClient2nd && selectedClient2nd.clientId !== 0 ? (
            <>
              <Typography variant="h6" gutterBottom>2차 거래처 정보</Typography>
              <Typography variant="body1"><strong>2차 거래처 ID:</strong> {selectedClient2nd.clientId}</Typography>
              <Typography variant="body1"><strong>2차 거래처 명칭:</strong> {selectedClient2nd.clientName}</Typography>
              <Typography variant="body1"><strong>2차 거래처 사업자번호:</strong> {selectedClient2nd.bizNo}</Typography>
              <Typography variant="body1"><strong>2차 거래처 구분:</strong> {getClientTypeTitle(selectedClient2nd.inOutType, selectedClient2nd.clientType)}</Typography>
              <Typography variant="body1"><strong>입출고 구분:</strong> {convertInOutType(selectedClient2nd.inOutType)}</Typography>
            </>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>2차 거래처 정보</Typography>
              <Autocomplete
                options={clients2nd}
                getOptionLabel={(option) => option.clientName}
                renderInput={(params) => <TextField {...params} label="2차 거래처 선택" variant="outlined" />}
                value={selectedClient2nd}
                onChange={(event, newValue) => {
                  setSelectedClient2nd(newValue || null);
                }}
                isOptionEqualToValue={(option, value) => option.clientId === value.clientId}
                style={{ maxHeight: 224, overflowY: 'auto' }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions style={{ justifyContent: 'space-between' }}>
          <Button onClick={navigateToClientManagement} color="primary" variant="contained">거래처 관리</Button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button onClick={handleCloseClient2ndModal} color="secondary" variant="outlined">닫기</Button>
            <Button onClick={handleConfirmClient2ndMapping} color="primary" variant="contained">확정</Button>
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