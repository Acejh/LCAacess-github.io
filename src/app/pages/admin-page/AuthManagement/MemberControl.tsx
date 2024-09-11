import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../CSS/SCbar.css';
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
  FormControl,
  MenuItem,
  Typography,
  TextField,
  Modal,
  Box,
  Grid,
  CircularProgress,
} from '@mui/material';
import * as XLSX from 'xlsx';

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

type Member = {
  id: number;
  code: number;
  name: string;
  bizNo: string;
  ecoasCode: string;
  zipCode: string;
  address: string;
  addressDetail: string;
  managerName: string;
  tel: string;
};

const columns: ColumnDef<Member>[] = [
  { accessorKey: 'code', header: '사업회원 코드', },
  { accessorKey: 'name', header: '사업회원 명', },
  { accessorKey: 'bizNo', header: '사업자등록번호'},
  { accessorKey: 'ecoasCode', header: () => <div style={{ textAlign: 'center' }}>EcoAS코드</div>},
  { accessorKey: 'zipCode', header: () => <div style={{ textAlign: 'center' }}>우편번호</div>},
  { accessorKey: 'address', header: '주소', },
  { accessorKey: 'addressDetail', header: '상세 주소', },
  { accessorKey: 'managerName', header: '담당자 명', },
  { accessorKey: 'tel', header: () => <div style={{ textAlign: 'center' }}>연락처</div>},
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
  const [data, setData] = useState<Member[]>([]);
  const [filteredData, setFilteredData] = useState<Member[]>([]); 
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); 
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteMemberName, setDeleteMemberName] = useState<string>('');
  const [newMember, setNewMember] = useState<Omit<Member, 'id' | 'code' >>({
    name: '',
    bizNo: '',
    ecoasCode: '',
    zipCode: '',
    address: '',
    addressDetail: '',
    managerName: '',
    tel: '',
  });
  const [editMember, setEditMember] = useState<Member>({
    id: 0,
    code: 0,
    name: '',
    bizNo: '',
    ecoasCode: '',
    zipCode: '',
    address: '',
    addressDetail: '',
    managerName: '',
    tel: '',
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  //데이터 쿼리
  useEffect(() => {
    axios.get('https://lcaapi.acess.co.kr/Companies')
      .then(response => {
        setData(response.data.list);
        setFilteredData(response.data.list); 
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  // 엑셀 다운로드
  const handleDownloadExcel = () => {
    const tableData = table.getRowModel().rows.map(row => row.original);
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, '사업회원관리.xlsx');
  };

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
          zipCode: data.zonecode,
          address: roadAddr + extraRoadAddr,
        }));
  
        setEditMember(prev => ({
          ...prev,
          zipCode: data.zonecode,
          address: roadAddr + extraRoadAddr,
        }));
      }
    });
    postcode.open();
  };

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
    const newMemberData = {
      ...newMember,
    };

    axios.post('https://lcaapi.acess.co.kr/Companies', newMemberData)
      .then(() => {
        axios.get('https://lcaapi.acess.co.kr/Companies')
          .then(response => {
            setData(response.data.list);
            setFilteredData(response.data.list); 
            setLoading(false);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
            setLoading(false);
          });
      })
      .catch(error => {
        console.error('Error posting data:', error);
      });

    handleClose();
  };

  //데이터 수정 
  const handleEditOpen = (index: number) => {
    const row = table.getRowModel().rows[index];
    const member = row.original;
  
    setEditMember({
      id: member.id,
      code: member.code,
      name: member.name,
      bizNo: member.bizNo,
      ecoasCode: member.ecoasCode,
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
      const updatedMemberData = {
        ...editMember,
      };

      const url = `https://lcaapi.acess.co.kr/Companies/${editMember.code}`;
      // console.log("PUT URL:", url);

      axios.put(url, updatedMemberData)
        .then(() => {
          axios.get('https://lcaapi.acess.co.kr/Companies')
            .then(response => {
              setData(response.data.list);
              setFilteredData(response.data.list); 
              setLoading(false);
            })
            .catch(error => {
              console.error('Error fetching data:', error);
              setLoading(false);
            });
        })
        .catch(error => {
          console.error('Error updating data:', error);
        });

      setEditOpen(false);
    }
  };

  //데이터 삭제
  const handleDeleteOpen = (index: number) => {
    const globalIndex = pageIndex * pageSize + index; 
    const memberToDelete = data[globalIndex];
    setDeleteIndex(globalIndex);
    setDeleteMemberName(memberToDelete.name); 
    setDeleteOpen(true);
  };
  
  const handleDeleteClose = () => setDeleteOpen(false);
  
  const handleDeleteSubmit = () => {
    if (deleteIndex !== null) {
      const memberToDelete = data[deleteIndex];
      const url = `https://lcaapi.acess.co.kr/Companies/${memberToDelete.code}`;
      // console.log("DELETE URL:", url);

      axios.delete(url)
        .then(() => {
          axios.get('https://lcaapi.acess.co.kr/Companies')
            .then(response => {
              setData(response.data.list);
              setFilteredData(response.data.list);
              setLoading(false);
            })
            .catch(error => {
              console.error('Error fetching data:', error);
              setLoading(false);
            });
        })
        .catch(error => {
          console.error('Error deleting data:', error);
        });

      handleDeleteClose();
    }
  };

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    const filtered = data.filter(member => 
      (member.name && member.name.includes(searchQuery)) ||
      (member.bizNo && member.bizNo.includes(searchQuery)) ||
      (member.ecoasCode && member.ecoasCode.includes(searchQuery)) ||
      (member.zipCode && member.zipCode.includes(searchQuery)) ||
      (member.address && member.address.includes(searchQuery)) ||
      (member.addressDetail && member.addressDetail.includes(searchQuery)) ||
      (member.managerName && member.managerName.includes(searchQuery)) ||
      (member.tel && member.tel.includes(searchQuery))
    );
    setFilteredData(filtered);
    setPageIndex(0); // 검색 후 페이지를 첫 페이지로 초기화
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    pageCount: Math.ceil(filteredData.length / pageSize),
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
      <Typography variant="h5" gutterBottom style={{marginBottom: '20px'}}>
        사업회원관리
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
        <FormControl style={{ marginRight: '10px' }}>
          <TextField
            id="search-query-input"
            label="검색"
            value={searchQuery}
            onChange={handleSearchQueryChange}
            style={{ width: '200px' }}
            sx={{ '& .MuiInputBase-root': { height: '45px' } }}
          />
        </FormControl>
        <Button 
          variant="contained" 
          color="primary" 
          style={{ width: '30px', height: '35px', marginLeft: '10px', fontSize: '12px' }}
          onClick={handleSearch}
        >
          조회
        </Button>
        <Button variant="contained" color="secondary" style={{ height: '35px', marginLeft: '50px', fontSize: '12px' }} onClick={handleOpen}>
          사업회원 등록
        </Button>
      </div>
      <TableContainer
        component={Paper}
        style={{ maxHeight: 545, overflowY: 'auto' }}
        className="custom-scrollbar"
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
                <TableCell style={{ backgroundColor: '#cfcfcf' }} >수정</TableCell>
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
                            textAlign: ['ecoasCode', 'zipCode', 'tel'].includes(cell.column.id) ? 'right' : 'left',
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
            {[5 ,10, 20, 30, 40, 50].map(pageSize => (
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
                name="ecoasCode"
                label="EcoAS코드"
                variant="outlined"
                fullWidth
                value={newMember.ecoasCode}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={8}>
            <TextField
              name="zipCode"
              label="우편번호"
              variant="outlined"
              fullWidth
              value={newMember.zipCode}
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
            <Grid item xs={12}>
              <TextField
                name="addressDetail"
                label="상세 주소"
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
                name="ecoasCode"
                label="EcoAS코드"
                variant="outlined"
                fullWidth
                value={editMember.ecoasCode}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={8}>
            <TextField
              name="zipCode"
              label="우편번호"
              variant="outlined"
              fullWidth
              value={newMember.zipCode}
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
              <Button variant="contained" color="primary" onClick={handleDaumPostCode} style={{ height: '100%' }}>
                주소 검색
              </Button>
            </Grid>
            <Grid item xs={12}>
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
            <Grid item xs={12}>
              <TextField
                name="addressDetail"
                label="상세 주소"
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
          <Typography id="delete-modal-title" variant="h6" component="h2" style={{ fontSize: 12 }}>
            사업회원 명: {deleteMemberName}
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