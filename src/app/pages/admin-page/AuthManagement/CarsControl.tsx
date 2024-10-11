import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../ComponentBox/UseCompany';
import ClientType from '../../ComponentBox/ClientType'; 
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
  FormControl,
  InputLabel,
  TextField,
  Modal,
  Box,
  Grid,
  CircularProgress,
} from '@mui/material';
import * as XLSX from 'xlsx';

type Car = {
  id: number;
  companyCode: string;
  inOutType: string; 
  carNo: string;
  spec: string;
  year: number; 
};

const columns: ColumnDef<Car>[] = [
  { accessorKey: 'companyCode', header: '사업회원' },
  { accessorKey: 'year', header: '연도' },
  { accessorKey: 'inOutType', header: '입출고 구분', cell: info => info.getValue() === 'IN' ? '입고' : info.getValue() === 'OUT' ? '출고' : ''},
  { accessorKey: 'carNo', header: '차량번호' },
  { accessorKey: 'spec', header: () => <div style={{ textAlign: 'center' }}>차량 규격 (ton)</div> },
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

export function CarsControl() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [deleteCarNo, setDeleteCarNo] = useState<string>('');
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedTypeInOut, setSelectedTypeInOut] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<number | null>(null); 
  const [companies, setCompanies] = useState<Company[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchCarNo, setSearchCarNo] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [selectedSpecFilter, setSelectedSpecFilter] = useState<'All' | 'Spec' | 'NoSpec'>('All');  
  const [searchParams, setSearchParams] = useState<{
    company: Company | null;
    inOutType: 'IN' | 'OUT' | '';
    carNo: string;
    year: number | null;
    state: 'All' | 'Spec' | 'NoSpec'; 
  }>({
    company: null,
    inOutType: '',
    carNo: '',
    year: null,
    state: 'All',  
  });
  const [newCar, setNewCar] = useState<Omit<Car, 'id'>>({
    companyCode: '',
    inOutType: '', 
    carNo: '',
    spec: '',
    year: new Date().getFullYear(),  
  });
  const [editCar, setEditCar] = useState<Car>({
    id: 0,
    companyCode: '',
    inOutType: '', 
    carNo: '',
    spec: '',
    year: new Date().getFullYear(),  
  });

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

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
      let url = `https://lcaapi.acess.co.kr/Cars?page=${pageIndex + 1}&pageSize=${pageSize}`;
      
      if (searchParams.company) {
        url += `&companyCode=${searchParams.company.code}`;
      }
      if (searchParams.inOutType) {
        url += `&inOutType=${searchParams.inOutType}`;
      }
      if (searchParams.carNo) {
        url += `&carNo=${searchParams.carNo}`;
      }
      if (searchParams.year) {
        url += `&year=${searchParams.year}`;
      }
      
      // state 필터 적용
      if (searchParams.state) {
        url += `&state=${searchParams.state}`;
      }
  
      // 데이터 가져오기
      const response = await axios.get(url);
      const { list, totalCount } = response.data;
  
      // 데이터 변환
      const transformedData = list.map((car: Car) => {
        const company = companies.find(c => c.code === car.companyCode);
        return {
          ...car,
          inOutType: car.inOutType,
          companyCode: company ? company.name : car.companyCode,
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

  // 사업회원 데이터 변환
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

  useEffect(() => {
    const userInfoString = localStorage.getItem('kt-auth-react-v');
    
    if (userInfoString) {
      try {
        const parsedData = JSON.parse(userInfoString);
        const userInfo = parsedData?.userInfo;  
        if (userInfo) {
          // console.log('Parsed Role:', userInfo.role);  // role 값 확인
          setUserRole(userInfo.role);
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    } else {
      console.error('No user info found in localStorage');
    }
  }, []);

  // 엑셀 다운로드
  const handleDownloadExcel = () => {
    const tableData = table.getRowModel().rows.map(row => row.original);
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, '차량관리.xlsx');
  };

  // 데이터 추가
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCar(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditCar(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const newCarData = {
      ...newCar,
    };

    // console.log("등록할 정보:", newCarData);

    axios.post('https://lcaapi.acess.co.kr/Cars', newCarData)
      .then(() => {
        // console.log('Data posted successfully:', response.data);
        fetchData(pageIndex, pageSize);
      })
      .catch(error => {
        console.error('Error posting data:', error.response ? error.response.data : error.message);
      });

    handleClose();
  };

  // 데이터 검사
  useEffect(() => {
    const isValid = !!newCar.companyCode && !!newCar.carNo && !!newCar.spec;
    setIsFormValid(isValid);
  }, [newCar]);

  // 데이터 수정 
  const handleEditOpen = (index: number) => {
    const row = table.getRowModel().rows[index];
    const car = row.original;
  
    setEditCar({
      id: car.id,
      companyCode: car.companyCode,
      inOutType: car.inOutType === 'IN' ? '입고' : car.inOutType === 'OUT' ? '출고' : '',
      carNo: car.carNo,
      spec: car.spec,
      year: car.year,
    });
    setEditIndex(index);
    setEditOpen(true);
  };

  const handleEditClose = () => setEditOpen(false);

  const handleEditSubmit = () => {
    if (editIndex !== null) {
      if (!editCar.carNo) {
        console.error('차량 번호는 필수입니다.');
        return;  
      }
  
      const updatedCarData = {
        year: editCar.year,
        inOutType: editCar.inOutType === '입고' ? 'IN' : 'OUT', 
        carNo: editCar.carNo,
        spec: editCar.spec,
      };
  
      axios.put(`https://lcaapi.acess.co.kr/Cars/${editCar.id}`, updatedCarData)
        .then(() => {
          console.log('Data updated successfully');
          fetchData(pageIndex, pageSize); 
        })
        .catch(error => {
          console.error('Error updating data:', error.response ? error.response.data : error.message);
        });
  
      setEditOpen(false);
    }
  };

  // 데이터 삭제
  const handleDeleteOpen = (index: number) => {
    const row = table.getRowModel().rows[index];
    const carToDelete = row.original;

    if (carToDelete) {
      setDeleteIndex(carToDelete.id);
      setDeleteCarNo(carToDelete.carNo);
      setDeleteOpen(true);
    } else {
      console.error(`No car found to delete at index: ${index}`);
    }
  };

  const handleDeleteClose = () => setDeleteOpen(false);

  const handleDeleteSubmit = () => {
    if (deleteIndex !== null) {
      const url = `https://lcaapi.acess.co.kr/Cars/${deleteIndex}`;
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

  const handleSearchCarNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchCarNo(e.target.value);
  };

  const handleSearch = () => {
    setSearchParams({
      company: selectedCompany,
      inOutType: selectedTypeInOut as 'IN' | 'OUT' | '',
      carNo: searchCarNo,
      year: selectedYear,
      state: selectedSpecFilter,  
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

  const table = useReactTable<Car>({
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
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        차량 관리
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
        <UseCompany onCompanyChange={setSelectedCompany} onCompanyListChange={setCompanies} />
        <FormControl style={{ marginRight: '10px', display: 'none' }}>
          <InputLabel id="year-select-label">연도</InputLabel>
          <Select
            labelId="year-select-label"
            value={selectedYear ?? ''}  
            onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
            style={{ height: '45px' , width: '100px' }}
          >
            <MenuItem value="">전체</MenuItem> 
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <ClientType
          selectedInOutType={selectedTypeInOut}
          onInOutTypeChange={setSelectedTypeInOut}
          formControlProps={{ sx: { width: '150px' } }}
          selectSx={{ height: '45px' }}
          showClientType={false}
        />
        <FormControl style={{ marginLeft: '10px' }}>
          <TextField
            id="search-carNo-input"
            label="차량번호 검색"
            value={searchCarNo}
            onChange={handleSearchCarNoChange}
            style={{ width: '200px' }}
            sx={{ '& .MuiInputBase-root': { height: '45px' } }}
          />
        </FormControl>
        <Select
          value={selectedSpecFilter}
          onChange={(e) => setSelectedSpecFilter(e.target.value as 'All' | 'Spec' | 'NoSpec')}
          style={{ height: '45px', marginLeft: '10px' }}
        >
          <MenuItem value="All">규격여부(전체)</MenuItem>
          <MenuItem value="Spec">규격 있음</MenuItem>
          <MenuItem value="NoSpec">규격 없음</MenuItem>
        </Select>
        <Button
          variant="contained"
          color="primary"
          style={{ width: '30px', height: '35px', marginLeft: '10px', fontSize: '12px' }}
          onClick={handleSearch}
        >
          조회
        </Button>
        <Button variant="contained" color="secondary" style={{ height: '35px', marginLeft: '50px', fontSize: '12px' }} onClick={handleOpen}>
          차량 등록
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
                  table.getRowModel().rows.map((row, index) => {
                    // 차량 규격(spec)이 0인지 확인
                    const isSpecZero = parseFloat(row.original.spec) === 0;

                    return (
                      <TableRow
                        key={row.id}
                        style={{
                          backgroundColor: isSpecZero ? '#f5c6cb' : 'white', 
                        }}
                      >
                        {row.getVisibleCells().map(cell => (
                          <TableCell
                            key={cell.id}
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              textAlign: ['spec'].includes(cell.column.id) ? 'right' : 'left',
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button variant="contained" color="primary" onClick={() => handleEditOpen(index)} style={{ padding: '2px' }}>
                            수정
                          </Button>
                          {userRole === 'Admin' && (
                            <Button
                              variant="contained"
                              color="secondary"
                              onClick={() => handleDeleteOpen(index)}
                              style={{ marginLeft: '10px', padding: '2px' }}
                            >
                              삭제
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
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
            {[1, 5, 10, 20, 30, 40, 50].map(pageSize => (
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
          <Typography id="modal-title" variant="h5" component="h2" style={{ marginBottom: 20 }}>
            차량 등록
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <UseCompany
                onCompanyChange={(company) => setNewCar(prev => ({ ...prev, companyCode: company ? company.code : '' }))}
                sx={{ width: '260px', marginRight: '10px' }}
                selectSx={{ height: '51px', }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="new-inout-type-label">입출고 구분</InputLabel>
                <Select
                  label="입출고 구분"
                  labelId="new-inout-type-label"
                  value={newCar.inOutType}
                  onChange={(e) => setNewCar(prev => ({ ...prev, inOutType: e.target.value }))}
                >
                  <MenuItem value="" disabled>입출고 구분</MenuItem>
                  <MenuItem value="IN">입고</MenuItem>
                  <MenuItem value="OUT">출고</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="new-year-label">연도</InputLabel>
                <Select
                  labelId="new-year-label"
                  value={newCar.year}
                  onChange={(e) => setNewCar(prev => ({ ...prev, year: Number(e.target.value) }))}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="carNo"
                label="차량번호"
                variant="outlined"
                fullWidth
                value={newCar.carNo}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="spec"
                label="차량규격"
                variant="outlined"
                fullWidth
                value={newCar.spec}
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
          <Typography id="edit-modal-title" variant="h5" component="h2" style={{ marginBottom: 20 }}>
            차량 수정
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                name="companyCode"
                label="사업회원"
                variant="outlined"
                fullWidth
                value={editCar.companyCode}
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
                value={editCar.inOutType}
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
              <FormControl fullWidth>
                <InputLabel id="edit-year-label">연도</InputLabel>
                <Select
                  labelId="edit-year-label"
                  value={editCar.year}
                  onChange={(e) => setEditCar(prev => ({ ...prev, year: Number(e.target.value) }))}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="carNo"
                label="차량번호"
                variant="outlined"
                fullWidth
                value={editCar.carNo}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="spec"
                label="차량규격"
                variant="outlined"
                fullWidth
                value={editCar.spec}
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
            차량 번호: {deleteCarNo}
          </Typography>
          <Typography id="delete-modal-title" variant="h6" component="h2" style={{ fontSize: 12 }}>
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