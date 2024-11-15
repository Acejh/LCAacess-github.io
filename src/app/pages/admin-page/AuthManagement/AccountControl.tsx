import React, { useState, useEffect , useCallback} from 'react';
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
  TextField,
  Modal,
  Box,
  Grid,
  CircularProgress,
} from '@mui/material';

type User = {
  id: number;
  name: string;
  role: string;
  companyCode: string;
  companyName: string;
  userName: string;
  password?: string; 
  phoneNumber: string;
  email: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
};

const columns: ColumnDef<User>[] = [
  { accessorKey: 'companyCode', header: '사업회원', },
  { accessorKey: 'name', header: '사용자명', },
  { accessorKey: 'role', header: '역할', },
  { accessorKey: 'userName', header: '사용자 ID', },
  { accessorKey: 'phoneNumber', header: () => <div style={{ textAlign: 'center' }}>전화번호</div> },
  { accessorKey: 'email', header: '이메일', },
  { accessorKey: 'createdAt', header: () => <div style={{ textAlign: 'center' }}>생성일</div>},
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

export function UserControl() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteMemberName, setDeleteMemberName] = useState<string>('');
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchParams, setSearchParams] = useState<{
    company: Company | null;
  }>({
    company: null,
  });
  const [newAccount, setNewAccount] = useState<{
    companyCode: string;
    userName: string;
    password: string;
    name: string;
    role: string;
    phoneNumber: string;
    email: string;
  }>({
    companyCode: '',
    userName: '',
    password: '',
    name: '',
    role: '',
    phoneNumber: '',
    email: ''
  });
  const [editAccount, setEditAccount] = useState<{
    id: number;
    name: string;
    role: string;
    phoneNumber: string;
    email: string;
  }>({
    id: 0,
    name: '',
    role: '',
    phoneNumber: '',
    email: ''
  });
  
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const fetchData = useCallback(async (pageIndex: number, pageSize: number) => {
    setLoading(true);
    try {
      let url = `https://lcaapi.acess.co.kr/Users?&page=${pageIndex + 1}&pageSize=${pageSize}`;
      if (searchParams.company) {
        url += `&companyCode=${searchParams.company.code}`;
      }
  
      const response = await axios.get(url);
      const { list, totalCount } = response.data;
  
      // 데이터 변환
      const transformedData = list.map((user: User) => {
        const company = companies.find(c => c.code === user.companyCode);
        return {
          ...user,
          companyCode: company ? company.name : user.companyCode,
          createdAt: new Date(user.createdAt).toLocaleDateString(), 
        };
      });
  
      setData(transformedData);
      setTotalCount(totalCount);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [searchParams, companies]);

  useEffect(() => {
    fetchData(pageIndex, pageSize);
  }, [pageIndex, pageSize, fetchData, searchParams]);

  const totalPages = Math.ceil(totalCount / pageSize);

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

  //데이터 추가
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewAccount(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditAccount(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const newAccountData = {
      ...newAccount,
    };  
  
  
    axios.post('https://lcaapi.acess.co.kr/Users', newAccountData)
      .then(() => {
        fetchData(pageIndex, pageSize);
      })
      .catch(error => {
        console.error('Error posting data:', error.response ? error.response.data : error.message);
      });
  
    handleClose();
  };

  //데이터 검사
  useEffect(() => {
    const isValid = !!newAccount.companyCode && !!newAccount.userName && !!newAccount.password && !!newAccount.name && !!newAccount.role && !!newAccount.phoneNumber && !!newAccount.email;
    setIsFormValid(isValid);
  }, [newAccount]);

  //데이터 수정 
  const handleEditOpen = (index: number) => {
    const row = table.getRowModel().rows[index];
    const member = row.original;
  
    setEditAccount({
      id: member.id,
      name: member.name,
      role: member.role,
      phoneNumber: member.phoneNumber,
      email: member.email
    });
    setEditIndex(index);
    setEditOpen(true);
  };

  const handleEditClose = () => setEditOpen(false);

  const handleEditSubmit = () => {
    if (editIndex !== null) {
      const updatedAccountData = {
        ...editAccount
      };
  
      const url = `https://lcaapi.acess.co.kr/Users/${editAccount.id}`;
  
      axios.put(url, updatedAccountData)
        .then(() => {
          fetchData(pageIndex, pageSize);  
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
      const url = `https://lcaapi.acess.co.kr/Users/${deleteIndex}`;
  
      axios.delete(url)
        .then(() => {
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
    });
    setPageIndex(0);  
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

  const table = useReactTable<User>({
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
        계정 관리
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <UseCompany onCompanyChange={setSelectedCompany} onCompanyListChange={setCompanies} />
        <Button 
          variant="contained" 
          color="primary" 
          style={{ width: '30px', height: '35px', marginLeft: '10px', fontSize: '12px' }}
          onClick={handleSearch}
        >
          조회
        </Button>
        <Button variant="contained" color="secondary" style={{ height: '35px', marginLeft: '50px', fontSize: '12px' }} onClick={handleOpen}>
          계정 등록
        </Button>
      </div>
      <TableContainer
        component={Paper}
        style={{ maxHeight: 545, overflowY: 'auto' }}
        className="custom-scrollbar custom-table"
      >
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
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row, index) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell
                          key={cell.id}
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textAlign: ['phoneNumber', 'createdAt'].includes(cell.column.id) ? 'right' : 'left',
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
            계정 등록
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <UseCompany 
                onCompanyChange={(company) => setNewAccount(prev => ({ ...prev, companyCode: company ? company.code : '' }))}
                sx={{ width: '530px', marginRight: '10px' }}
                selectSx={{ height: '51px', }}
                showAllOption={false}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="userName"
                label="사용자 ID"
                variant="outlined"
                fullWidth
                value={newAccount.userName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="password"
                label="비밀번호"
                type="password"
                variant="outlined"
                fullWidth
                value={newAccount.password}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="사용자명"
                variant="outlined"
                fullWidth
                value={newAccount.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Select
                name="role"
                variant="outlined"
                fullWidth
                value={newAccount.role}
                onChange={(e) => setNewAccount(prev => ({ ...prev, role: e.target.value }))}
                displayEmpty
              >
                <MenuItem value="">
                  <em>역할 선택</em>
                </MenuItem>
                <MenuItem value="Admin">관리자</MenuItem>
                <MenuItem value="User">사용자</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phoneNumber"
                label="전화번호"
                variant="outlined"
                fullWidth
                value={newAccount.phoneNumber}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="이메일"
                variant="outlined"
                fullWidth
                value={newAccount.email}
                onChange={handleChange}
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
            계정 수정
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="사용자명"
                variant="outlined"
                fullWidth
                value={editAccount.name}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Select
                name="role"
                variant="outlined"
                fullWidth
                value={editAccount.role}
                onChange={(e) => setEditAccount(prev => ({ ...prev, role: e.target.value }))}
                displayEmpty
              >
                <MenuItem value="">
                  <em>역할 선택</em>
                </MenuItem>
                <MenuItem value="Admin">관리자</MenuItem>
                <MenuItem value="User">사용자</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phoneNumber"
                label="전화번호"
                variant="outlined"
                fullWidth
                value={editAccount.phoneNumber}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="이메일"
                variant="outlined"
                fullWidth
                value={editAccount.email}
                onChange={handleEditChange}
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
            계정 명: {deleteMemberName}
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