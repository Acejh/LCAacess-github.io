import React, { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
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
} from '@mui/material';

type Member = {
  id: number;
  userName: string;
  passwordHash: string;
  name: string;
  email: string;
  phoneNumber: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
};

const data: Member[] = [
  { id: 1, userName: 'jhjh6836', passwordHash: '12345678910', name: '최재호', email: 'jhjh6836@acess.co.kr', phoneNumber: '010-5197-2588', createdBy: '2024-6-13', createdAt: '2024-06-14', updatedBy: '2024-06-15', updatedAt: '2024-06-16' },
  { id: 2, userName: '나', passwordHash: '2', name: '나', email: 'b', phoneNumber: '1', createdBy: '2024-6-13', createdAt: '2024-06-14', updatedBy: '2024-06-15', updatedAt: '2024-06-16' },
  { id: 3, userName: '다', passwordHash: '3', name: '다', email: 'c', phoneNumber: '1', createdBy: '2024-6-13', createdAt: '2024-06-14', updatedBy: '2024-06-15', updatedAt: '2024-06-16' },
  { id: 4, userName: '라', passwordHash: '4', name: '라', email: 'd', phoneNumber: '1', createdBy: '2024-6-13', createdAt: '2024-06-14', updatedBy: '2024-06-15', updatedAt: '2024-06-16' },
  { id: 5, userName: '마', passwordHash: '5', name: '마', email: 'e', phoneNumber: '1', createdBy: '2024-6-13', createdAt: '2024-06-14', updatedBy: '2024-06-15', updatedAt: '2024-06-16' },
  { id: 6, userName: '바', passwordHash: '6', name: '바', email: 'f', phoneNumber: '1', createdBy: '2024-6-13', createdAt: '2024-06-14', updatedBy: '2024-06-15', updatedAt: '2024-06-16' },
  { id: 7, userName: '사', passwordHash: '7', name: '사', email: 'g', phoneNumber: '1', createdBy: '2024-6-13', createdAt: '2024-06-14', updatedBy: '2024-06-15', updatedAt: '2024-06-16' },
  { id: 8, userName: '아', passwordHash: '8', name: '아', email: 'h', phoneNumber: '1', createdBy: '2024-6-13', createdAt: '2024-06-14', updatedBy: '2024-06-15', updatedAt: '2024-06-16' },
  { id: 9, userName: '자', passwordHash: '9', name: '자', email: 'i', phoneNumber: '1', createdBy: '2024-6-13', createdAt: '2024-06-14', updatedBy: '2024-06-15', updatedAt: '2024-06-16' },
  { id: 10, userName: '차', passwordHash: '10', name: '차', email: 'j', phoneNumber: '1', createdBy: '2024-6-13', createdAt: '2024-06-14', updatedBy: '2024-06-15', updatedAt: '2024-06-16' },
];

const columns: ColumnDef<Member>[] = [
  {
    accessorKey: 'userName',
    header: '아이디',
  },
  {
    accessorKey: 'passwordHash',
    header: '비밀번호',
  },
  {
    accessorKey: 'name',
    header: '이름',
  },
  {
    accessorKey: 'email',
    header: '이메일',
  },
  {
    accessorKey: 'phoneNumber',
    header: '연락처',
  },
  {
    accessorKey: 'createdBy',
    header: '등록id',
  },
  {
    accessorKey: 'createdAt',
    header: '등록 일시',
  },
  {
    accessorKey: 'updatedBy',
    header: '수정id',
  },
  {
    accessorKey: 'updatedAt',
    header: '수정일시',
  },
];

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export function UserControl() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [labelShrink, setLabelShrink] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newMember, setNewMember] = useState<Omit<Member, 'id' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>>({
    userName: '',
    passwordHash: '',
    name: '',
    email: '',
    phoneNumber: '',
  });
  const [editMember, setEditMember] = useState<Omit<Member, 'id' | 'createdBy' | 'createdAt' | 'updatedBy' | 'updatedAt'>>({
    userName: '',
    passwordHash: '',
    name: '',
    email: '',
    phoneNumber: '',
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  //수정 
  const handleEditOpen = (index: number) => {
    const member = data[index];
    setEditMember({
      userName: member.userName,
      passwordHash: member.passwordHash,
      name: member.name,
      email: member.email,
      phoneNumber: member.phoneNumber,
    });
    setEditIndex(index);
    setEditOpen(true);
  };

  const handleEditClose = () => setEditOpen(false);
  //삭제
  const handleDeleteOpen = (index: number) => {
    setDeleteIndex(index);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => setDeleteOpen(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({
      ...prev,
      [name]: value,
    }));
    setEditMember(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  //추가
  const handleSubmit = () => {
    const existingData = JSON.parse(localStorage.getItem('AccountCT') || '[]');
    const updatedData = [...existingData, newMember];
    localStorage.setItem('AccountCT', JSON.stringify(updatedData));
    
    handleClose();
  };
  //수정
  const handleEditSubmit = () => {
    if (editIndex !== null) {
      const existingData = JSON.parse(localStorage.getItem('AccountCT') || '[]');
      existingData[editIndex] = { ...existingData[editIndex], ...editMember };
      localStorage.setItem('AccountCT', JSON.stringify(existingData));
      setEditOpen(false);
    }
  };
  //삭제
  const handleDeleteSubmit = () => {
    if (deleteIndex !== null) {
      const existingData = JSON.parse(localStorage.getItem('AccountCT') || '[]');
      existingData.splice(deleteIndex, 1);
      localStorage.setItem('AccountCT', JSON.stringify(existingData));
      setDeleteOpen(false);
    }
  };

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(data.length / pageSize),
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({ pageIndex, pageSize });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      } else {
        const { pageIndex, pageSize } = updater;
        setPageIndex(pageIndex);
        setPageSize(pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // 페이지네이션
  const renderPageNumbers = () => {
    const totalPages = table.getPageCount();
    const startPage = Math.floor(pageIndex / 5) * 5;
    const endPage = Math.min(startPage + 5, totalPages);

    return Array.from({ length: endPage - startPage }, (_, i) => startPage + i).map((number) => (
      <Button
        key={number}
        variant={table.getState().pagination.pageIndex === number ? 'contained' : 'outlined'}
        color="primary"
        style={{ marginRight: '5px', minWidth: '30px', padding: '5px' }}
        onClick={() => setPageIndex(number)}
      >
        {number + 1}
      </Button>
    ));
  };

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom>
        계정 관리
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <TextField
          label="Search"
          variant="outlined"
          style={{ width: '250px' }}
          InputProps={{ style: { height: '40px', padding: '0 14px' } }}
          InputLabelProps={{
            shrink: labelShrink,
            style: {
              transform: labelShrink ? 'translate(14px, -9px) scale(0.75)' : 'translate(14px, 12px) scale(1)',
              transition: 'transform 0.2s ease-in-out',
            },
          }}
          onFocus={() => setLabelShrink(true)}
          onBlur={(e) => setLabelShrink(e.target.value !== '')}
        />
        <Button variant="contained" color="primary" style={{ width: '30px', height: '35px', marginLeft: '10px', fontSize: '12px' }}>
          검색
        </Button>
        <Button
          variant="contained"
          color="secondary"
          style={{ height: '35px', marginLeft: '50px', fontSize: '12px' }}
          onClick={handleOpen}
        >
          계정 등록
        </Button>
      </div>
      <TableContainer component={Paper} style={{ maxHeight: 545, overflowY: 'auto' }}>
        <Table>
          <TableHead>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
                <TableCell>수정</TableCell>
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row, index) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleEditOpen(index)}>
                    수정
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => handleDeleteOpen(index)} style={{ marginLeft: '10px' }}>
                    삭제
                  </Button>
                </TableCell>
              </TableRow>
            ))}
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
          <Button onClick={() => table.setPageIndex(0)} disabled={pageIndex === 0} variant="contained" color="primary" style={{ marginRight: '5px', minWidth: '30px', padding: '5px' }}>
            처음
          </Button>
          <Button onClick={() => table.setPageIndex(Math.max(0, pageIndex - 5))} disabled={pageIndex < 5} variant="contained" color="warning" style={{ marginRight: '5px', minWidth: '30px', padding: '5px' }}>
            이전
          </Button>
          {renderPageNumbers()}
          <Button onClick={() => table.setPageIndex(Math.min(table.getPageCount() - 1, pageIndex + 5))} disabled={pageIndex >= table.getPageCount() - 5} variant="contained" color="warning" style={{ marginLeft: '5px', minWidth: '30px', padding: '5px' }}>
            다음
          </Button>
          <Button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={pageIndex === table.getPageCount() - 1} variant="contained" color="primary" style={{ marginLeft: '5px', minWidth: '30px', padding: '5px' }}>
            맨끝
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
            {[10, 20, 30, 40, 50].map(pageSize => (
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
          <Typography id="modal-title" variant="h6" component="h2">
            계정 등록
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="userName"
                label="아이디"
                variant="outlined"
                fullWidth
                value={newMember.userName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="passwordHash"
                label="비밀번호"
                variant="outlined"
                fullWidth
                type="password"
                value={newMember.passwordHash}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="이름"
                variant="outlined"
                fullWidth
                value={newMember.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="이메일"
                variant="outlined"
                fullWidth
                value={newMember.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phoneNumber"
                label="연락처"
                variant="outlined"
                fullWidth
                value={newMember.phoneNumber}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="contained" color="secondary" onClick={handleClose} style={{ marginRight: '10px' }}>
              취소
            </Button>
            <Button variant="contained" color="primary" onClick={handleSubmit}>
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
          <Typography id="edit-modal-title" variant="h6" component="h2">
            계정 수정
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="userName"
                label="아이디"
                variant="outlined"
                fullWidth
                value={editMember.userName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="passwordHash"
                label="비밀번호"
                variant="outlined"
                fullWidth
                type="password"
                value={editMember.passwordHash}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="이름"
                variant="outlined"
                fullWidth
                value={editMember.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="이메일"
                variant="outlined"
                fullWidth
                value={editMember.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phoneNumber"
                label="연락처"
                variant="outlined"
                fullWidth
                value={editMember.phoneNumber}
                onChange={handleChange}
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
          <Typography id="delete-modal-description" style={{ fontSize: 12}}>
            되돌릴 수 없습니다.
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