import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UseCompany, { Company } from '../../ComponentBox/UseCompany';
import { getApiUrl } from '../../../../main';
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
  reccValuableCar: {
    id: number;
    carId: number;
    inOutType: string;
    carNo: string;
    spec: number;
  };
  reccValuableClient: {
    id: number;
    clientId: number;
    inOutType: string;
    clientType: string;
    clientName: string;
    bizNo: string | null;
  };
  reccValuableExtraClient: {
    id: number;
    clientId: number;
    inOutType: string;
    clientType: string;
    clientName: string;
    bizNo: string | null;
  } | null;
  reccValuableItem: {
    id?: number; // 선택적 필드로 변경
    lciItemId: number;
    lciItemTitle: string;
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
  const [mappingYear, setMappingYear] = useState<string>(new Date().getFullYear().toString());
  const [lciItems, setLciItems] = useState<{ id: number; name: string }[]>([]);
  const [selectedLciItem, setSelectedLciItem] = useState<number | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [clientMappingModalOpen, setClientMappingModalOpen] = useState(false);
  const [client2ndMappingModalOpen, setClient2ndMappingModalOpen] = useState(false);
  const [carMappingModalOpen, setCarMappingModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    carMappingStatus: '', 
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [carModalOpen, setCarModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Basic['reccValuableClient'] | null>(null);
  const [selectedCar, setSelectedCar] = useState<Basic['reccValuableCar'] | null>(null);
  const [client2ndModalOpen, setClient2ndModalOpen] = useState(false);
  const [clients, setClients] = useState<Basic['reccValuableClient'][]>([]);
  const [clients2nd, setClients2nd] = useState<Basic['reccValuableClient'][]>([]);
  const [cars, setCars] = useState<Basic['reccValuableCar'][]>([]);
  const [selectedClient2nd, setSelectedClient2nd] = useState<Basic['reccValuableClient'] | null>(null);
  const [itemMappingModalOpen, setItemMappingModalOpen] = useState(false);
  const navigate = useNavigate();
  

  const fetchLciItems = async (year: string) => {
    try {
      const response = await axios.get(`${getApiUrl}/ValuableMaps/LciItems?Year=${year}`);
      setLciItems(response.data.lciItems || []);
    } catch (error) {
      console.error('LCI 항목 데이터를 가져오는 중 에러 발생:', error);
      setLciItems([]);
    }
  };
  
  useEffect(() => {
    fetchLciItems(mappingYear);
  }, [mappingYear]);
  
  const handleMappingYearChange = (event: SelectChangeEvent<string>) => {
    setMappingYear(event.target.value);
  };
  
  // const handleLciItemChange = (event: SelectChangeEvent<string>) => {
  //   const selectedId = parseInt(event.target.value, 10); 
  //   setSelectedLciItem(selectedId); // 상태 업데이트
  // };

  const fetchCars = async (companyCode: string) => {
    try {
      const response = await axios.get(`${getApiUrl}/Cars?companyCode=${companyCode}&inOutType=OUT&page=1&pageSize=1000`);
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
      const response = await axios.get(`${getApiUrl}/Clients?companyCode=${companyCode}&inOutType=OUT&type=VP&withPagination=false`);
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchClients2nd = async (companyCode: string) => {
    try {
      const response = await axios.get(`${getApiUrl}/ExtraClientMaps/clients`);
  
      // 응답 데이터에서 리스트 추출
      const clients = Array.isArray(response.data.list)
            ? response.data.list.map((client: { id: number; name: string; address: string }) => ({
                id: client.id,
                clientName: client.name, // 이름 필드
                address: client.address, // 주소 필드
              }))
            : [];
  
      setClients2nd(clients);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setErrorMessage('권한이 없습니다');
      } else {
        console.error('2차 거래처 데이터를 가져오는 중 에러 발생:', error);
        setErrorMessage('데이터를 가져오는 중 에러 발생');
      }
      setClients2nd([]); // 실패 시 빈 배열로 초기화
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
      let url = `${getApiUrl}/ReccValuableMapping?page=${pageIndex + 1}&pageSize=${pageSize}`;
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
        reccValuableId: selectedRowId,
        clientId: selectedClient.clientId,
      };
  
      try {
        const response = await axios.post(
          `${getApiUrl}/ReccValuableMapping/Client`,
          postData
        );
  
        if (response.status === 204) {
          handleCloseClientModal(); // 모달 닫기
          handleCloseClientMappingModal(); // 매핑 모달 닫기
          await fetchData(pageIndex, pageSize); // 테이블 데이터 새로고침
        }
      } catch (error) {
        console.error('거래처 매핑 요청 에러:', error);
      }
    } else {
      console.warn('선택된 거래처 또는 Row ID가 없습니다.');
    }
  };

  const handleConfirmCarMapping = async () => {
    if (selectedCar && selectedRowId !== null) {
      const postData = {
        reccValuableId: selectedRowId,
        carId: selectedCar.carId,
      };
  
      try {
        const response = await axios.post(
          `${getApiUrl}/ReccValuableMapping/Car`,
          postData
        );
  
        if (response.status === 204) {
          handleCloseCarModal(); // 모달 닫기
          handleCloseCarMappingModal(); // 매핑 모달 닫기
          await fetchData(pageIndex, pageSize); // 테이블 데이터 새로고침
        }
      } catch (error) {
        console.error('차량 매핑 요청 에러:', error);
      }
    } else {
      console.warn('선택된 차량 또는 Row ID가 없습니다.');
    }
  };

  const handleConfirmItemMapping = async () => {
  
    if (selectedLciItem !== null && selectedRowId !== null) {
      const postData = {
        reccValuableId: selectedRowId,
        lciItemId: selectedLciItem, // 드롭다운에서 선택된 값
      };
  
      try {
        const response = await axios.post(
          `${getApiUrl}/ReccValuableMapping/Item`,
          postData
        );
  
  
        if (response.status === 204) {
          handleCloseItemMappingModal();
          await fetchData(pageIndex, pageSize);
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('유가물 매핑 요청 에러:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
        } else {
          console.error('알 수 없는 에러 발생:', error);
        }
      }
    } else {
      console.warn('선택된 항목 또는 Row ID가 없습니다.');
    }
  };

  useEffect(() => {
  }, [lciItems]);
  
  useEffect(() => {
    fetchLciItems(mappingYear);
  }, [mappingYear]);

  const handleConfirmClient2ndMapping = async () => {
    if (selectedClient2nd && selectedRowId !== null) {
      const postData = {
        reccValuableId: selectedRowId, // 선택된 Row ID
        clientId: selectedClient2nd.id, // 2차 거래처 ID
      };
  
      try {
        const response = await axios.post(
          `${getApiUrl}/ReccValuableMapping/Client2nd`,
          postData
        );
  
        if (response.status === 204) {
          handleCloseClient2ndModal();
          handleCloseClient2ndMappingModal();
          fetchData(pageIndex, pageSize); // 테이블 데이터 새로고침
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error('2차 거래처 매핑 요청 에러:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
          });
        } else {
          console.error('알 수 없는 에러 발생:', error);
        }
      }
    } else {
      console.warn('선택된 2차 거래처 또는 Row ID가 없습니다.');
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
    { accessorKey: 'item1', header: '품목1' },
    { accessorKey: 'item2', header: '품목2' },
    { accessorKey: 'item3', header: '품목3' },
    {
      id: 'valuableMapping',
      header: '유가물 매핑 상태',
      cell: ({ row }) => (
        <Button
          variant="contained"
          sx={{
            backgroundColor: row.original.reccValuableItem && row.original.reccValuableItem.id ? 'success.main' : 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: row.original.reccValuableItem && row.original.reccValuableItem.id ? 'success.dark' : 'error.dark'
            }
          }}
          onClick={() => handleOpenItemModal(row.original.id, row.original.reccValuableItem)}
        >
          {row.original.reccValuableItem && row.original.reccValuableItem.id ? '완료' : '미완료'}
        </Button>
      ),
    },
    { accessorKey: 'weight', header: () => <div style={{ textAlign: 'center' }}>무게(kg)</div>},
    { accessorKey: 'ecoasWeight', header: () => <div style={{ textAlign: 'center' }}>EcoAS무게(kg)</div>},
    {
      id: 'reccValuableClient',
      header: '거래처 매핑 상태',
      cell: ({ row }) => (
        <Button
          variant="contained"
          sx={{
            backgroundColor: row.original.reccValuableClient?.id ? 'success.main' : 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: row.original.reccValuableClient?.id ? 'success.dark' : 'error.dark'
            }
          }}
          onClick={() => handleOpenClientModal(row.original.reccValuableClient || { id: 0, clientId: 0, inOutType: '', clientType: '', clientName: '', bizNo: '' }, row.original.id)}
        >
          {row.original.reccValuableClient?.id ? '완료' : '미완료'}
        </Button>
      ),
    },
    {
      id: 'reccValuableExtraClient',
      header: '2차 거래처 매핑 상태',
      cell: ({ row }) => (
        <Button
          variant="contained"
          sx={{
            backgroundColor: row.original.reccValuableExtraClient && row.original.reccValuableExtraClient.id ? 'success.main' : 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: row.original.reccValuableExtraClient && row.original.reccValuableExtraClient.id ? 'success.dark' : 'error.dark'
            }
          }}
          onClick={() => handleOpenClient2ndModal(row.original.reccValuableExtraClient || { id: 0, clientId: 0, inOutType: '', clientType: '', clientName: '', bizNo: '' }, row.original.id)}
        >
          {row.original.reccValuableExtraClient && row.original.reccValuableExtraClient.id ? '완료' : '미완료'}
        </Button>
      ),
    },
    {
      id: 'reccValuableCar',
      header: '차량 매핑 상태',
      cell: ({ row }) => (
        <Button
          variant="contained"
          sx={{
            backgroundColor: row.original.reccValuableCar?.id ? 'success.main' : 'error.main',
            color: 'white',
            '&:hover': {
              backgroundColor: row.original.reccValuableCar?.id ? 'success.dark' : 'error.dark'
            }
          }}
          onClick={() => handleOpenCarModal(row.original.reccValuableCar, row.original.id)}
        >
          {row.original.reccValuableCar?.id ? '완료' : '미완료'}
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

  const handleOpenClientModal = (client: Basic['reccValuableClient'], id: number) => {
    setSelectedClient(client);
    setSelectedRowId(id);
    setClientModalOpen(true);
  };
  
  const handleOpenCarModal = (car: Basic['reccValuableCar'], id: number) => {
    setSelectedCar(car);
    setSelectedRowId(id);
  
    if (!car || car.carId === 0) {
      // 미완료 상태에서는 차량 매핑 모달 열기
      setCarMappingModalOpen(true);
    } else {
      // 완료 상태에서는 차량 정보 확인 모달 열기
      setCarModalOpen(true);
    }
  };
  
  const handleCloseCarMappingModal = () => {
    setCarMappingModalOpen(false);
  };

  const handleOpenItemModal = (rowId: number, reccValuableItem: Basic['reccValuableItem'] | null) => {
    setSelectedRowId(rowId); // 최상위 ID 설정
    setSelectedItem(reccValuableItem?.lciItemId || null); // LCI 항목 ID만 설정
  
    if (!reccValuableItem?.lciItemId) {
      fetchLciItems(mappingYear); // LCI 항목 데이터 새로 로드
      setItemMappingModalOpen(true); // 매핑 모달 열기
    } else {
      setItemModalOpen(true); // 확인 모달 열기
    }
  };
  
  const handleOpenClient2ndModal = (client2nd: Basic['reccValuableExtraClient'], id: number) => {
    setSelectedClient2nd(client2nd);
    setSelectedRowId(id);
  
    if (!client2nd || client2nd.clientId === 0) {
      // "미완료" 상태일 경우 바로 매핑 모달로 전환
      setClient2ndMappingModalOpen(true);
    } else {
      // "완료" 상태일 경우 확인 모달 열기
      setClient2ndModalOpen(true);
    }
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

  const handleCloseClient2ndMappingModal = () => {
    setClient2ndMappingModalOpen(false); // 2차 거래처 매핑 모달 닫기
  };

  const handleEditMapping = () => {
    // 기존 모달 닫기
    setItemModalOpen(false);
  
    // 유가물 매핑 모달 열기 및 데이터 로드
    fetchLciItems(mappingYear);
    setItemMappingModalOpen(true);
  };
  
  const handleCloseClientMappingModal = () => {
    setClientMappingModalOpen(false); // 거래처 매핑 모달 닫기
  };

  // 유가물 매핑 모달 닫기 핸들러
  const handleCloseItemMappingModal = () => {
    setItemMappingModalOpen(false);
  };

  const navigateToCarsManagement = () => {
    navigate('/CarsControl');
  }

  const navigateToClientManagement = () => {
    navigate('/AdminClient');
  };

  const navigateToClient2Management = () => {
    navigate('/ClientMap');
  };

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        유가물 매핑
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
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
                      top: -2,
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
              <Typography variant="body1">
                <strong>거래처 ID:</strong> {selectedClient.clientId}
              </Typography>
              <Typography variant="body1">
                <strong>거래처 명칭:</strong> {selectedClient.clientName}
              </Typography>
            </>
          ) : (
            <Typography variant="body1" color="error">매핑된 거래처가 없습니다.</Typography>
          )}
        </DialogContent>
        <DialogActions style={{ justifyContent: 'space-between' }}>
          <Button onClick={navigateToClientManagement} color="primary" variant="contained">
            거래처 관리
          </Button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              onClick={() => {
                setClientModalOpen(false); // 현재 모달 닫기
                setClientMappingModalOpen(true); // 매핑 모달 열기
              }}
              color="primary"
              variant="contained"
            >
              수정
            </Button>
            <Button onClick={handleCloseClientModal} color="secondary" variant="outlined">
              닫기
            </Button>
          </div>
        </DialogActions>
      </Dialog>

      <Dialog open={clientMappingModalOpen} onClose={handleCloseClientMappingModal} maxWidth="sm" fullWidth>
        <DialogTitle>거래처 매핑</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>거래처 선택</Typography>
          <Autocomplete
            options={clients}
            getOptionLabel={(option) => option.clientName}
            renderInput={(params) => <TextField {...params} label="거래처 선택" variant="outlined" />}
            value={selectedClient}
            onChange={(event, newValue) => {
              setSelectedClient(newValue || null);
            }}
            isOptionEqualToValue={(option, value) => option.clientId === value.clientId}
            style={{ marginBottom: '16px' }}
          />
        </DialogContent>
        <DialogActions style={{ justifyContent: 'space-between' }}>
          <Button onClick={navigateToClientManagement} color="primary" variant="contained">거래처 관리</Button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              onClick={handleConfirmClientMapping}
              color="primary"
              variant="contained"
            >
              확정
            </Button>
            <Button onClick={handleCloseClientMappingModal} color="secondary" variant="outlined">닫기</Button>
          </div>
        </DialogActions>
      </Dialog>

      <Dialog open={carModalOpen} onClose={handleCloseCarModal} maxWidth="sm" fullWidth>
        <DialogTitle>차량 매핑 확인</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>차량 정보</Typography>
          {selectedCar ? (
            <>
              <Typography variant="body1"><strong>차량 ID:</strong> {selectedCar.carId}</Typography>
              <Typography variant="body1"><strong>차량번호:</strong> {selectedCar.carNo}</Typography>
              <Typography variant="body1"><strong>차량규격:</strong> {selectedCar.spec}</Typography>
            </>
          ) : (
            <Typography variant="body1" color="error">차량 정보를 불러오는 중입니다...</Typography>
          )}
        </DialogContent>
        <DialogActions style={{ justifyContent: 'space-between' }}>
          <Button onClick={navigateToCarsManagement} color="primary" variant="contained">
            차량 관리
          </Button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              onClick={() => {
                setCarModalOpen(false);
                setCarMappingModalOpen(true); // 차량 매핑 모달로 이동
              }}
              color="primary"
              variant="contained"
            >
              수정
            </Button>
            <Button onClick={handleCloseCarModal} color="secondary" variant="outlined">
              닫기
            </Button>
          </div>
        </DialogActions>
      </Dialog>

      <Dialog open={carMappingModalOpen} onClose={handleCloseCarMappingModal} maxWidth="sm" fullWidth>
        <DialogTitle>차량 매핑</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>차량 선택</Typography>
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
        </DialogContent>
        <DialogActions style={{ justifyContent: 'space-between' }}>
          <Button onClick={navigateToCarsManagement} color="primary" variant="contained">
            차량 관리
          </Button>
          <div style={{ display: 'flex', gap: '8px' }}>
            
            <Button
              onClick={handleConfirmCarMapping}
              color="primary"
              variant="contained"
              disabled={!selectedCar || !selectedRowId}
            >
              확정
            </Button>
            <Button onClick={handleCloseCarMappingModal} color="secondary" variant="outlined">
              닫기
            </Button>
          </div>
        </DialogActions>
      </Dialog>

      <Dialog open={itemModalOpen} onClose={handleCloseItemModal} maxWidth="sm" fullWidth>
        <DialogTitle>유가물 매핑 확인</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>유가물 정보</Typography>
          {selectedRowId !== null && data.length > 0 ? (
            (() => {
              const selectedItem = data.find((item) => item.id === selectedRowId)?.reccValuableItem;
              if (selectedItem) {
                return (
                  <Typography variant="body1">
                    <strong>LCI 항목:</strong> {selectedItem.lciItemTitle || 'N/A'}
                  </Typography>
                );
              } else {
                return (
                  <Typography variant="body1" color="error">
                    유가물 매핑이 없습니다.
                  </Typography>
                );
              }
            })()
          ) : (
            <Typography variant="body1" color="error">
              데이터를 불러오는 중입니다...
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditMapping} color="primary" variant="contained">
            수정
          </Button>
          <Button onClick={handleCloseItemModal} color="secondary" variant="outlined">
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={itemMappingModalOpen} onClose={handleCloseItemMappingModal} maxWidth="sm" fullWidth>
        <DialogTitle>유가물 매핑</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>유가물 선택</Typography>
          <FormControl fullWidth style={{ marginBottom: '16px' }}>
            <InputLabel id="mapping-year-select-label">연도</InputLabel>
            <Select
              labelId="mapping-year-select-label"
              label="연도"
              value={mappingYear}
              onChange={handleMappingYearChange}
              style={{ width: '100%' }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 120,
                  },
                },
              }}
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                <MenuItem key={year} value={year.toString()}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth style={{ marginBottom: '16px' }}>
            <InputLabel id="lci-item-select-label">LCI 항목 선택</InputLabel>
            <Select
              labelId="lci-item-select-label"
              label="LCI 항목 선택"
              value={selectedLciItem !== null ? String(selectedLciItem) : ''} // 값이 null일 경우 빈 문자열
              onChange={(event) => {
                const selectedId = parseInt(event.target.value, 10); // 문자열을 숫자로 변환
                setSelectedLciItem(selectedId); // 상태 업데이트
              }}
              style={{ width: '100%' }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 200,
                  },
                },
              }}
            >
              {lciItems.map((item) => (
                <MenuItem key={item.id} value={String(item.id)}> {/* value를 문자열로 변환 */}
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmItemMapping} color="primary" variant="contained">
            확정
          </Button>
          <Button onClick={handleCloseItemMappingModal} color="secondary" variant="outlined">
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={client2ndModalOpen} onClose={handleCloseClient2ndModal} maxWidth="sm" fullWidth>
        <DialogTitle>2차 거래처 매핑 확인</DialogTitle>
        <DialogContent dividers>
          {selectedClient2nd && selectedClient2nd.clientId !== 0 ? (
            <>
              <Typography variant="h6" gutterBottom>2차 거래처 정보</Typography>
              <Typography variant="body1">
                <strong>2차 거래처 ID:</strong> {selectedClient2nd.clientId}
              </Typography>
              <Typography variant="body1">
                <strong>2차 거래처 명칭:</strong> {selectedClient2nd.clientName}
              </Typography>
            </>
          ) : (
            <Typography variant="body1" color="error">매핑된 2차 거래처가 없습니다.</Typography>
          )}
        </DialogContent>
        <DialogActions style={{ justifyContent: 'space-between' }}>
          <Button onClick={navigateToClient2Management} color="primary" variant="contained">
            2차 거래처 관리
          </Button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              onClick={() => {
                setClient2ndModalOpen(false); // 현재 모달 닫기
                setClient2ndMappingModalOpen(true); // 매핑 모달 열기
              }}
              color="primary"
              variant="contained"
            >
              수정
            </Button>
            <Button onClick={handleCloseClient2ndModal} color="secondary" variant="outlined">
              닫기
            </Button>
          </div>
        </DialogActions>
      </Dialog>

      <Dialog open={client2ndMappingModalOpen} onClose={handleCloseClient2ndMappingModal} maxWidth="sm" fullWidth>
        <DialogTitle>2차 거래처 매핑</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>2차 거래처 선택</Typography>
          <Autocomplete
            options={clients2nd} // 수정된 데이터 사용
            getOptionLabel={(option) => option.clientName || ''} // clientName 필드로 드롭다운 표시
            renderInput={(params) => (
              <TextField {...params} label="2차 거래처 선택" variant="outlined" />
            )}
            value={selectedClient2nd}
            onChange={(event, newValue) => {
              setSelectedClient2nd(newValue || null); // 선택된 값을 상태에 반영
            }}
            isOptionEqualToValue={(option, value) => option.id === value?.id} // ID로 선택 비교
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClient2ndMapping} color="primary" variant="contained">확정</Button>
          <Button onClick={handleCloseClient2ndMappingModal} color="secondary" variant="outlined">닫기</Button>
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