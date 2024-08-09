import React, { useState, useEffect , useCallback} from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../ComponentBox/UseCompany';
import ClientType from '../../ComponentBox/ClientType';
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
  TextField,
  Modal,
  Box,
  Grid,
  CircularProgress,
} from '@mui/material';

type DaumPostcodeData = {
  roadAddress: string;
  jibunAddress: string;
  zonecode: string;
  bname: string;
  buildingName: string;
  apartment: string;
  autoRoadAddress?: string;
  autoJibunAddress?: string;
};

declare global {
  interface Window {
    daum: {
      Postcode: new (options: { oncomplete: (data: DaumPostcodeData) => void }) => Postcode;
    };
  }
}

interface Postcode {
  open: () => void;
}

type Client = {
  id: number;
  companyCode: string;
  inOutType: string;
  type: string;
  name: string;
  bizNo: string;
  address: string;
  distance: string;
};

type ClientType = {
  code: string;
  title: string;
};

const columns: ColumnDef<Client>[] = [
  { accessorKey: 'companyCode', header: '사업회원', },
  { accessorKey: 'inOutType', header: '입출고 구분', },
  { accessorKey: 'type', header: '거래처 구분', },
  { accessorKey: 'name', header: '거래처명', },
  { accessorKey: 'bizNo', header: '거래처 사업자번호', },
  { accessorKey: 'address', header: '주소', },
  { accessorKey: 'distance', header: () => <div style={{ textAlign: 'center' }}>거리(km)</div>, cell: info => numeral(info.getValue()).format('0.0') },
];

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export function AdminClient() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteMemberName, setDeleteMemberName] = useState<string>('');
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedTypeInOut, setSelectedTypeInOut] = useState<string>(''); 
  const [searchName, setSearchName] = useState<string>('');
  const [searchBizNo, setSearchBizNo] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState<{
    company: Company | null;
    type: string;
    inOutType: 'IN' | 'OUT' | '';
    name: string;
    bizNo: string;
  }>({
    company: null,
    type: '',
    inOutType: '',
    name: '',
    bizNo: '',
  });
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [newMember, setNewMember] = useState<Omit<Client, 'id' >>({
    companyCode:'',
    inOutType: '',
    type: '',
    name: '',
    bizNo: '',
    address: '',
    distance: '',
  });
  const [editMember, setEditMember] = useState<Client>({
    id: 0,
    companyCode: '',
    inOutType:'',
    type: '',
    name: '',
    bizNo: '',
    address: '',
    distance: '',
  });
  
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const fetchData = useCallback(async (pageIndex: number, pageSize: number) => {
    if (!searchParams.company) {
      setData([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }
  
    setLoading(true);
    try {
      let url = `https://lcaapi.acess.co.kr/Clients?&page=${pageIndex + 1}&pageSize=${pageSize}`;
      if (searchParams.company) {
        url += `&companyCode=${searchParams.company.code}`;
      }
      if (searchParams.type) {
        url += `&type=${searchParams.type}`;
      }
      if (searchParams.inOutType) {
        url += `&inOutType=${searchParams.inOutType}`;
      }
      if (searchParams.name) {
        url += `&name=${searchParams.name}`;
      }
      if (searchParams.bizNo) {
        url += `&bizNo=${searchParams.bizNo}`;
      }
  
      // console.log('Fetching data with URL:', url);
  
      const response = await axios.get(url);
      const { list, totalCount } = response.data;
      // console.log('Response data:', response.data);
  
      // 데이터 변환
      const transformedData = list.map((client: Client) => {
        const clientType = clientTypes.find(type => type.code === client.type);
        const company = companies.find(c => c.code === client.companyCode);
        return {
          ...client,
          type: clientType ? clientType.title : client.type,
          companyCode: company ? company.name : client.companyCode,
          inOutType: client.inOutType === 'IN' ? '입고' : client.inOutType === 'OUT' ? '출고' : '',
        };
      });
  
      setData(transformedData);
      setTotalCount(totalCount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [searchParams, clientTypes, companies]);

  useEffect(() => {
    fetchData(pageIndex, pageSize);
  }, [pageIndex, pageSize, fetchData, searchParams]);

  const totalPages = Math.ceil(totalCount / pageSize);
  //거래처 구분 데이터 변환
  useEffect(() => {
    const fetchClientTypes = async () => {
      try {
        const response = await axios.get<ClientType[]>('https://lcaapi.acess.co.kr/Clients/types');
        setClientTypes(response.data);
      } catch (error) {
        console.error('Error fetching client types:', error);
      }
    };
  
    fetchClientTypes();
  }, []);
  //사업회원 데이터 변환
  useEffect(() => {
    axios.get('https://lcaapi.acess.co.kr/Companies')
      .then(response => {
        const sortedCompanies = response.data.list.sort((a: Company, b: Company) =>
          a.name.localeCompare(b.name)
        );
        setCompanies(sortedCompanies);
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  }, []);

  //주소검색
  const handleDaumPostCode = () => {
    const postcode = new window.daum.Postcode({
      oncomplete: function(data: DaumPostcodeData) {
        // console.log(data);
        const roadAddr = data.roadAddress;
        let extraRoadAddr = '';
  
        if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
          extraRoadAddr += data.bname;
        }
        if (data.buildingName !== '' && data.apartment === 'Y') {
          extraRoadAddr += (extraRoadAddr !== '' ? ', ' + data.buildingName : data.buildingName);
        }
        if (extraRoadAddr !== '') {
          extraRoadAddr = ' (' + extraRoadAddr + ')';
        }
  
        setNewMember(prev => ({
          ...prev,
          address: roadAddr + extraRoadAddr,
        }));
  
        setEditMember(prev => ({
          ...prev,
          address: roadAddr + extraRoadAddr,
        }));
      }
    });
    postcode.open();
  };
  //데이터 추가
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditMember(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const newMemberData = {
      ...newMember,
    };  
  
    // console.log("등록할 정보:", newMemberData); 
  
    axios.post('https://lcaapi.acess.co.kr/Clients', newMemberData)
    .then(() => {
      // console.log('Data posted successfully:', response.data);
      fetchData(pageIndex, pageSize);
    })
    .catch(error => {
      console.error('Error posting data:', error.response ? error.response.data : error.message);
    });
  
    handleClose();
  };

  //데이터 검사
  useEffect(() => {
    const isValid = !!newMember.companyCode && !!newMember.type && !!newMember.name && !!newMember.bizNo && !!newMember.address;
    setIsFormValid(isValid);
  }, [newMember]);

  //데이터 수정 
  const handleEditOpen = (index: number) => {
    const row = table.getRowModel().rows[index];
    const member = row.original;
  
    setEditMember({
      id: member.id,
      companyCode: member.companyCode,
      inOutType: member.inOutType,
      type: member.type,
      name: member.name,
      bizNo: member.bizNo,
      address: member.address,
      distance: member.distance,
    });
    setEditIndex(index);
    setEditOpen(true);
  };

  const handleEditClose = () => setEditOpen(false);

  const handleEditSubmit = () => {
    if (editIndex !== null) {
      const updatedMemberData = {
        ...editMember,
        // 추가 데이터 필드 변환 또는 정리
      };
  
      const url = `https://lcaapi.acess.co.kr/Clients/${editMember.id}`;
      // console.log("PUT URL:", url); 
  
      axios.put(url, updatedMemberData)
        .then(() => {
          // console.log('Data updated successfully:', response.data);
          fetchData(pageIndex, pageSize);  // 데이터 갱신
        })
        .catch(error => {
          console.error('Error updating data:', error);
        });
  
      setEditOpen(false);
    }
  };

  //데이터 삭제
  const handleDeleteOpen = (index: number) => {
    const row = table.getRowModel().rows[index];
    const memberToDelete = row.original;
  
    if (memberToDelete) {
      setDeleteIndex(memberToDelete.id);
      setDeleteMemberName(memberToDelete.name);
      setDeleteOpen(true);
    } else {
      console.error(`No member found to delete at index: ${index}`);
    }
  };
  
  const handleDeleteClose = () => setDeleteOpen(false);
  
  const handleDeleteSubmit = () => {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
    if (deleteIndex !== null) {
      const url = `https://lcaapi.acess.co.kr/Clients/${deleteIndex}`;
      // console.log("DELETE URL:", url); 
  
      axios.delete(url)
        .then(() => {
          // console.log('Data deleted successfully:', response.data);
          fetchData(pageIndex, pageSize); 
        })
        .catch(error => {
          console.error('Error deleting data:', error);
        });
  
      handleDeleteClose();
    }
  };

  const handleSearch = () => {
    setSearchParams({
      company: selectedCompany,
      type: selectedType,
      inOutType: selectedTypeInOut as 'IN' | 'OUT' | '',
      name: searchName,
      bizNo: searchBizNo,
    });
    setPageIndex(0);
    setHasSearched(true);
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

  const table = useReactTable<Client>({
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

  // 페이지네이션
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

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{marginBottom: '20px'}}>
        거래처 관리
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <UseCompany onCompanyChange={setSelectedCompany} onCompanyListChange={setCompanies} />
        <ClientType
          selectedCode={selectedType}
          onChangeCode={setSelectedType}
          selectedInOutType={selectedTypeInOut}
          onInOutTypeChange={setSelectedTypeInOut}  
          formControlProps={{ sx: { width: '150px'} }}
          selectSx={{ height: '45px' }}
        />
        <TextField
          id="search-name-input"
          label="거래처명"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{ width: '200px', marginLeft: '10px', marginRight: '10px' }}
          sx={{ '& .MuiInputBase-root': { height: '45px' } }}
        />
        <TextField
          id="search-bizNo-input"
          label="거래처 사업자번호"
          value={searchBizNo}
          onChange={(e) => setSearchBizNo(e.target.value)}
          style={{ width: '200px', marginRight: '10px' }}
          sx={{ '& .MuiInputBase-root': { height: '45px' } }}
        />
        <Button 
          variant="contained" 
          color="primary" 
          style={{ width: '30px', height: '35px', marginLeft: '10px', fontSize: '12px' }}
          onClick={handleSearch}
        >
          조회
        </Button>
        <Button variant="contained" color="secondary" style={{ height: '35px', marginLeft: '50px', fontSize: '12px' }} onClick={handleOpen}>
          거래처 등록
        </Button>
      </div>
      <TableContainer component={Paper} style={{ maxHeight: 545, overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell key={header.id} style={{ backgroundColor: '#cfcfcf' }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
                <TableCell style={{ backgroundColor: '#cfcfcf' }}>수정</TableCell>
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={12} style={{ textAlign: 'center' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              <>
                {!hasSearched ? (
                  <TableRow>
                    <TableCell colSpan={12} style={{ textAlign: 'center', color: 'red' }}>
                      사업회원을 선택하여 조회하십시오.
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell
                          key={cell.id}
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textAlign: ['distance'].includes(cell.column.id) ? 'right' : 'left',
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button variant="contained" color="primary" onClick={() => handleEditOpen(index)} style={{ padding: '2px' }}>
                          수정
                        </Button>
                        <Button variant="contained" color="secondary" onClick={() => handleDeleteOpen(index)} style={{ marginLeft: '10px', padding: '2px' }}>
                          삭제
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} style={{ textAlign: 'center' }}>
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
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
            페이지 {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </Typography>
          <Select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
          >
            {[1, 5 ,10, 20, 30, 40, 50].map(pageSize => (
              <MenuItem key={pageSize} value={pageSize}>
                Show {pageSize}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-title" variant="h5" component="h2" style={{ marginBottom: 20}}>
            거래처 등록
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <UseCompany 
                onCompanyChange={(company) => setNewMember(prev => ({ ...prev, companyCode: company ? company.code : '' }))}
                sx={{ width: '530px', marginRight: '10px' }}
                selectSx={{ height: '51px', }}
                showAllOption={false}
              />
            </Grid>
            <Grid item xs={12}>
              <ClientType
                selectedCode={newMember.type}
                onChangeCode={(code) => setNewMember(prev => ({ ...prev, type: code }))}
                selectedInOutType={newMember.inOutType} 
                onInOutTypeChange={(type) => setNewMember(prev => ({ ...prev, inOutType: type }))}
                formControlProps={{ sx: { width: '350px', } }}
                showAllOption={false}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="거래처명"
                variant="outlined"
                fullWidth
                value={newMember.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="bizNo"
                label="사업자번호"
                variant="outlined"
                fullWidth
                value={newMember.bizNo}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                name="address"
                label="주소"
                variant="outlined"
                fullWidth
                value={newMember.address}
                InputProps={{ 
                  readOnly: true, 
                  style: { 
                    backgroundColor: '#f0f0f0', 
                    pointerEvents: 'none',
                    textDecoration: 'none',
                  }
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <Button variant="contained" color="primary" onClick={handleDaumPostCode} style={{ height: '100%', fontSize: '12px' }}>
                주소 검색
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="distance"
                label="거리"
                variant="outlined"
                fullWidth
                value={newMember.distance}
                onChange={handleChange}
                InputProps={{ 
                  readOnly: true, 
                  style: { 
                    backgroundColor: '#f0f0f0', 
                    pointerEvents: 'none',
                    textDecoration: 'none',
                  }
                }}
              />
            </Grid>
          </Grid>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="contained" color="secondary" onClick={handleClose} style={{ marginRight: '10px' }}>
              취소
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!isFormValid}>
              등록
            </Button>
          </div>
        </Box>
      </Modal>
      <Modal
        open={editOpen}
        onClose={handleEditClose}
        aria-labelledby="edit-modal-title"
        aria-describedby="edit-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="edit-modal-title" variant="h5" component="h2" style={{ marginBottom: 20}}>
            거래처 수정
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="companyCode"
                label="사업회원"
                variant="outlined"
                fullWidth
                value={editMember.companyCode}
                InputProps={{
                  readOnly: true,
                  style: {
                    backgroundColor: '#f0f0f0',
                    pointerEvents: 'none',
                    textDecoration: 'none',
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="inOutType"
                label="입출고 구분"
                variant="outlined"
                fullWidth
                value={editMember.inOutType}
                InputProps={{
                  readOnly: true,
                  style: {
                    backgroundColor: '#f0f0f0',
                    pointerEvents: 'none',
                    textDecoration: 'none',
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="type"
                label="거래처 구분"
                variant="outlined"
                fullWidth
                value={editMember.type}
                InputProps={{
                  readOnly: true,
                  style: {
                    backgroundColor: '#f0f0f0',
                    pointerEvents: 'none',
                    textDecoration: 'none',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="거래처명"
                variant="outlined"
                fullWidth
                value={editMember.name}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="bizNo"
                label="사업자번호"
                variant="outlined"
                fullWidth
                value={editMember.bizNo}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={8}>
              <TextField
                name="address"
                label="주소"
                variant="outlined"
                fullWidth
                value={editMember.address}
                InputProps={{ 
                  readOnly: true, 
                  style: { 
                    backgroundColor: '#f0f0f0', 
                    pointerEvents: 'none',
                    textDecoration: 'none',
                  }
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <Button variant="contained" color="primary" onClick={handleDaumPostCode} style={{ height: '100%', fontSize: '12px' }}>
                주소 검색
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="distance"
                label="거리"
                variant="outlined"
                fullWidth
                value={editMember.distance}
                onChange={handleEditChange}
                InputProps={{ 
                  readOnly: true, 
                  style: { 
                    backgroundColor: '#f0f0f0', 
                    pointerEvents: 'none',
                    textDecoration: 'none',
                  }
                }}
              />
            </Grid>
          </Grid>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="contained" color="secondary" onClick={handleEditClose} style={{ marginRight: '10px' }}>
              취소
            </Button>
            <Button variant="contained" color="primary" onClick={handleEditSubmit}>
              수정
            </Button>
          </div>
        </Box>
      </Modal>
      <Modal
        open={deleteOpen}
        onClose={handleDeleteClose}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="delete-modal-title" variant="h6" component="h2">
            정말 삭제하시겠습니까?
          </Typography>
          <Typography id="delete-modal-title" variant="h6" component="h2" style={{ fontSize: 12 }}>
            거래처 명: {deleteMemberName}
          </Typography>
          <Typography id="delete-modal-title" variant="h6" component="h2" style={{ fontSize: 12 }}>
            되돌릴수 없습니다.
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="contained" color="secondary" onClick={handleDeleteClose} style={{ marginRight: '10px' }}>
              아니오
            </Button>
            <Button variant="contained" color="primary" onClick={handleDeleteSubmit}>
              예
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}