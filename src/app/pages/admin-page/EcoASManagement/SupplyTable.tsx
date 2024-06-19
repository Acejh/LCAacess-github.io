import React, { useState, useEffect } from 'react';
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
  InputLabel,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';

type Member = {
  id: number;
  RECC_NO: string;
  RECC_DATE: string;
  RECC_COM_RNO: string;
  RECC_COM_NO: string;
  RECC_COM_NM: string;
  RECC_SUPPLY_NO: string;
  SUPPLY_COM_NM: string;
  SUPPLY_ETC: string;
  partner_biz_no: string;
  partner_name: string;
  SUPPLY_ITEM: string;
  WEIGHT: string;
};

const columns: ColumnDef<Member>[] = [
  { accessorKey: 'RECC_NO', header: '관리표 번호' },
  { accessorKey: 'RECC_DATE', header: '일시' },
  { accessorKey: 'RECC_COM_RNO', header: '사업자등록번호' },
  { accessorKey: 'RECC_COM_NO', header: 'EcoAS코드' },
  { accessorKey: 'RECC_COM_NM', header: '사업회원명' },
  { accessorKey: 'RECC_SUPPLY_NO', header: '번호' },
  { accessorKey: 'SUPPLY_COM_NM', header: '거래처명' },
  { accessorKey: 'SUPPLY_ETC', header: '비고' },
  { accessorKey: 'partner_biz_no', header: '거래처 사업자등록번호' },
  { accessorKey: 'partner_name', header: '거래처 명' },
  { accessorKey: 'SUPPLY_ITEM', header: '공급품목' },
  { accessorKey: 'WEIGHT', header: '중량' },
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

export function SupplyTable() {
  const [data, setData] = useState<Member[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [labelShrink, setLabelShrink] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [originalData, setOriginalData] = useState<Member[]>([]);
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');

  useEffect(() => {
    fetch('/supply_management.json')
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        setOriginalData(data); 
      });
  }, []);

  const handleSearch = () => {
    const filteredData = originalData.filter((item) =>
      Object.values(item).some((value) =>
        value !== null && value !== undefined && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setData(filteredData);
    setPageIndex(0); // 검색 시 페이지를 처음으로 초기화
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

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setYear(event.target.value as string);
  };
  
  const handleMonthChange = (event: SelectChangeEvent<string>) => {
    setMonth(event.target.value as string);
  };

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom>
        공급 관리표
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <TextField
          label="Search"
          variant="outlined"
          style={{ width: '250px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
        <Button
          variant="contained"
          color="primary"
          style={{ width: '30px', height: '35px', marginLeft: '10px', fontSize: '12px' }}
          onClick={handleSearch} // 검색 버튼 클릭 시 handleSearch 함수 호출
        >
          검색
        </Button>
        <Button variant="contained" color="secondary" style={{ height: '35px', marginLeft: '10px', fontSize: '12px' }} onClick={handleOpen}>
          관리표 조회
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
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
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
          <Button onClick={() => table.setPageIndex(0)} disabled={pageIndex === 0} variant="contained" color="primary" style={{ marginRight: '10px', minWidth: '30px', padding: '5px', width: 50}}>
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
            연도 및 월 선택
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="year-label">연도</InputLabel>
                <Select
                  labelId="year-label"
                  id="year-select"
                  value={year}
                  label="연도"
                  onChange={handleYearChange}
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="month-label">월</InputLabel>
                <Select
                  labelId="month-label"
                  id="month-select"
                  value={month}
                  label="월"
                  onChange={handleMonthChange}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 170, 
                      },
                    },
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <MenuItem key={month} value={month}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="contained" color="secondary" onClick={handleClose} style={{ marginRight: '10px' }}>
              취소
            </Button>
            <Button variant="contained" color="primary" onClick={() => { /* 연도 및 월 선택 후 처리할 로직 추가 */ handleClose(); }}>
              조회
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}