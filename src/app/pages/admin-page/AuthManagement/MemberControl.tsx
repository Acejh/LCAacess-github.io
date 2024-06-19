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
  cord: string;
  name: string;
  bizNo: string;
  ecoasCode: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  managerName: string;
  tel: string;
};

const data: Member[] = [
  { id: 1, cord: '1498411', name: '주식회사 에이서스', bizNo: '6888600804', ecoasCode: '1598878', zipCode: '11628', address: '경기도 하남시 미사대로 540', addressDetail: 'A동 511호', managerName: '최재호', tel: '010-5197-2588' },
  { id: 2, cord: '2', name: '나', bizNo: '2', ecoasCode: '2', zipCode: '1', address: '하남시', addressDetail: '미사대로', managerName: '나', tel: '1' },
  { id: 3, cord: '3', name: '다', bizNo: '3', ecoasCode: '3', zipCode: '1', address: '하남시', addressDetail: '미사대로', managerName: '다', tel: '1' },
  { id: 4, cord: '4', name: '라', bizNo: '4', ecoasCode: '4', zipCode: '1', address: '하남시', addressDetail: '미사대로', managerName: '라', tel: '1' },
  { id: 5, cord: '5', name: '마', bizNo: '5', ecoasCode: '5', zipCode: '1', address: '하남시', addressDetail: '미사대로', managerName: '마', tel: '1' },
  { id: 6, cord: '6', name: '바', bizNo: '6', ecoasCode: '6', zipCode: '1', address: '하남시', addressDetail: '미사대로', managerName: '바', tel: '1' },
  { id: 7, cord: '7', name: '사', bizNo: '7', ecoasCode: '7', zipCode: '1', address: '하남시', addressDetail: '미사대로', managerName: '사', tel: '1' },
  { id: 8, cord: '8', name: '아', bizNo: '8', ecoasCode: '8', zipCode: '1', address: '하남시', addressDetail: '미사대로', managerName: '아', tel: '1' },
  { id: 9, cord: '9', name: '아', bizNo: '8', ecoasCode: '8', zipCode: '1', address: '하남시', addressDetail: '미사대로', managerName: '아', tel: '1' },
  { id: 10, cord: '10', name: '아', bizNo: '8', ecoasCode: '8', zipCode: '1', address: '하남시', addressDetail: '미사대로', managerName: '아', tel: '1' },
];

const columns: ColumnDef<Member>[] = [
  {
    accessorKey: 'cord',
    header: '사업회원 코드',
  },
  {
    accessorKey: 'name',
    header: '사업회원 명',
  },
  {
    accessorKey: 'bizNo',
    header: '사업자등록번호',
  },
  {
    accessorKey: 'ecoasCode',
    header: 'EcoAS코드',
  },
  {
    accessorKey: 'zipCode',
    header: '우편번호',
  },
  {
    accessorKey: 'address',
    header: '주소',
  },
  {
    accessorKey: 'addressDetail',
    header: '주소 상세',
  },
  {
    accessorKey: 'managerName',
    header: '담당자 명',
  },
  {
    accessorKey: 'tel',
    header: '연락처',
  },
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

export function MemberControl() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [labelShrink, setLabelShrink] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [newMember, setNewMember] = useState<Omit<Member, 'id' | 'cord' | 'ecoasCode'>>({
    name: '',
    bizNo: '',
    zipCode: '',
    address: '',
    addressDetail: '',
    managerName: '',
    tel: '',
  });
  const [editMember, setEditMember] = useState<Omit<Member, 'id' | 'cord' | 'ecoasCode'>>({
    name: '',
    bizNo: '',
    zipCode: '',
    address: '',
    addressDetail: '',
    managerName: '',
    tel: '',
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // DB 연계
  // useEffect(() => {
  //   axios.get('/api/members')
  //     .then(response => {
  //       setData(response.data);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching data:', error);
  //     });
  // }, []);
  
  //데이터 추가
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

  const handleSubmit = () => {
    const existingData = JSON.parse(localStorage.getItem('MemberCT') || '[]');
    const updatedData = [...existingData, newMember];
    localStorage.setItem('MemberCT', JSON.stringify(updatedData));
    
    handleClose();
  };

  //데이터 수정 
  const handleEditOpen = (index: number) => {
    const member = data[index];
    setEditMember({
      name: member.name,
      bizNo: member.bizNo,
      zipCode: member.zipCode,
      address: member.address,
      addressDetail: member.addressDetail,
      managerName: member.managerName,
      tel: member.tel,
    });
    setEditIndex(index);
    setEditOpen(true);
  };
  const handleEditClose = () => setEditOpen(false);

  const handleEditSubmit = () => {
    if (editIndex !== null) {
      const existingData = JSON.parse(localStorage.getItem('MemberCT') || '[]');
      existingData[editIndex] = { ...existingData[editIndex], ...editMember };
      localStorage.setItem('MemberCT', JSON.stringify(existingData));
    }
    setEditOpen(false);
  };

  //데이터 삭제
  const handleDeleteOpen = (index: number) => {
    setDeleteIndex(index);
    setDeleteOpen(true);
  };
  
  const handleDeleteClose = () => setDeleteOpen(false);
  
  const handleDeleteSubmit = () => {
    if (deleteIndex !== null) {
      const existingData = JSON.parse(localStorage.getItem('MemberCT') || '[]');
      existingData.splice(deleteIndex, 1); 
      localStorage.setItem('MemberCT', JSON.stringify(existingData));
      handleDeleteClose();
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
        사업회원관리
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <TextField
          label="Search"
          variant="outlined"
          style={{ width: '250px' }}
          InputProps={{
            style: { height: '40px', padding: '0 14px' },
          }}
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
        <Button variant="contained" color="secondary" style={{ height: '35px', marginLeft: '50px', fontSize: '12px' }} onClick={handleOpen}>
          사업회원 등록
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
          <Typography id="modal-title" variant="h5" component="h2" style={{ marginBottom: 20}}>
            사업회원 등록
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                name="name"
                label="사업회원 명"
                variant="outlined"
                fullWidth
                value={newMember.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="bizNo"
                label="사업자등록번호"
                variant="outlined"
                fullWidth
                value={newMember.bizNo}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
            <TextField
              name="zipCode"
              label="우편번호"
              variant="outlined"
              fullWidth
              value={newMember.zipCode}
              onChange={handleChange}
              InputProps={{ inputProps: { style: { MozAppearance: 'textfield' } }, style: { WebkitAppearance: 'none', margin: 0 } }}
            />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="주소"
                variant="outlined"
                fullWidth
                value={newMember.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="addressDetail"
                label="주소 상세"
                variant="outlined"
                fullWidth
                value={newMember.addressDetail}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="managerName"
                label="담당자 명"
                variant="outlined"
                fullWidth
                value={newMember.managerName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="tel"
                label="연락처"
                variant="outlined"
                fullWidth
                value={newMember.tel}
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
          <Typography id="edit-modal-title" variant="h5" component="h2" style={{ marginBottom: 20}}>
            사업회원 수정
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                name="name"
                label="사업회원 명"
                variant="outlined"
                fullWidth
                value={editMember.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="bizNo"
                label="사업자등록번호"
                variant="outlined"
                fullWidth
                value={editMember.bizNo}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="zipCode"
                label="우편번호"
                variant="outlined"
                fullWidth
                value={editMember.zipCode}
                onChange={handleChange}
                InputProps={{ inputProps: { style: { MozAppearance: 'textfield' } }, style: { WebkitAppearance: 'none', margin: 0 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="주소"
                variant="outlined"
                fullWidth
                value={editMember.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="addressDetail"
                label="주소 상세"
                variant="outlined"
                fullWidth
                value={editMember.addressDetail}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="managerName"
                label="담당자 명"
                variant="outlined"
                fullWidth
                value={editMember.managerName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                name="tel"
                label="연락처"
                variant="outlined"
                fullWidth
                value={editMember.tel}
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
          <Typography id="delete-modal-title" variant="h6" component="h2" style={{ fontSize: 12}}>
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