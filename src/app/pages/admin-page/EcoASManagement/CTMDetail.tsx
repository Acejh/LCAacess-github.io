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
  InputLabel,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';

type Member = {
  id: number;
  TRANS_NO: string;
  GIVE_COM_RNO: string;
  give_com_no: string;
  GIVE_COM_NM: string;
  GIVE_CAR_NO: number;
  GIVE_DATE: string;
  partner_biz_no: string;
  partner_name: string;
  TAKE_COM_RNO: string;
  take_com_no: string;
  TAKE_COM_NM: string;
  TAKE_CAR_NO: string;
  TAKE_DATE: string;
  received_date: string;
  GOODS_CD: string;
  GOODS_NM: string;
  GOODS_CNT: string;
  MEAN_WEIGHT: string;
  TOTAL_WEIGHT: string;
  Received_Date: string;
};

const data: Member[] = [
  { id: 1, TRANS_NO: '1498411', GIVE_COM_RNO: '주식회사 에이서스', give_com_no: '6888600804', GIVE_COM_NM: '1598878', GIVE_CAR_NO: 11628, GIVE_DATE: '경기도 하남시 미사대로 540', partner_biz_no: 'A동 511호', partner_name: '최재호', TAKE_COM_RNO: '010-5197-2588', take_com_no: '010-5197-2588', TAKE_COM_NM: '010-5197-2588', TAKE_CAR_NO: '010-5197-2588', TAKE_DATE: '010-5197-2588', received_date: '1', GOODS_CD: '1', GOODS_NM: '1', GOODS_CNT: '1', MEAN_WEIGHT: '1', TOTAL_WEIGHT: '1', Received_Date: '1', },
  { id: 2, TRANS_NO: '1498411', GIVE_COM_RNO: '주식회사 에이서스', give_com_no: '6888600804', GIVE_COM_NM: '1598878', GIVE_CAR_NO: 11628, GIVE_DATE: '경기도 하남시 미사대로 540', partner_biz_no: 'A동 511호', partner_name: '최재호', TAKE_COM_RNO: '010-5197-2588', take_com_no: '010-5197-2588', TAKE_COM_NM: '010-5197-2588', TAKE_CAR_NO: '010-5197-2588', TAKE_DATE: '010-5197-2588', received_date: '1', GOODS_CD: '1', GOODS_NM: '1', GOODS_CNT: '1', MEAN_WEIGHT: '1', TOTAL_WEIGHT: '1', Received_Date: '1', },
  { id: 3, TRANS_NO: '1498411', GIVE_COM_RNO: '주식회사 에이서스', give_com_no: '6888600804', GIVE_COM_NM: '1598878', GIVE_CAR_NO: 11628, GIVE_DATE: '경기도 하남시 미사대로 540', partner_biz_no: 'A동 511호', partner_name: '최재호', TAKE_COM_RNO: '010-5197-2588', take_com_no: '010-5197-2588', TAKE_COM_NM: '010-5197-2588', TAKE_CAR_NO: '010-5197-2588', TAKE_DATE: '010-5197-2588', received_date: '1', GOODS_CD: '1', GOODS_NM: '1', GOODS_CNT: '1', MEAN_WEIGHT: '1', TOTAL_WEIGHT: '1', Received_Date: '1', },
  { id: 4, TRANS_NO: '1498411', GIVE_COM_RNO: '주식회사 에이서스', give_com_no: '6888600804', GIVE_COM_NM: '1598878', GIVE_CAR_NO: 11628, GIVE_DATE: '경기도 하남시 미사대로 540', partner_biz_no: 'A동 511호', partner_name: '최재호', TAKE_COM_RNO: '010-5197-2588', take_com_no: '010-5197-2588', TAKE_COM_NM: '010-5197-2588', TAKE_CAR_NO: '010-5197-2588', TAKE_DATE: '010-5197-2588', received_date: '1', GOODS_CD: '1', GOODS_NM: '1', GOODS_CNT: '1', MEAN_WEIGHT: '1', TOTAL_WEIGHT: '1', Received_Date: '1', },
  { id: 5, TRANS_NO: '1498411', GIVE_COM_RNO: '주식회사 에이서스', give_com_no: '6888600804', GIVE_COM_NM: '1598878', GIVE_CAR_NO: 11628, GIVE_DATE: '경기도 하남시 미사대로 540', partner_biz_no: 'A동 511호', partner_name: '최재호', TAKE_COM_RNO: '010-5197-2588', take_com_no: '010-5197-2588', TAKE_COM_NM: '010-5197-2588', TAKE_CAR_NO: '010-5197-2588', TAKE_DATE: '010-5197-2588', received_date: '1', GOODS_CD: '1', GOODS_NM: '1', GOODS_CNT: '1', MEAN_WEIGHT: '1', TOTAL_WEIGHT: '1', Received_Date: '1', },
  { id: 6, TRANS_NO: '1498411', GIVE_COM_RNO: '주식회사 에이서스', give_com_no: '6888600804', GIVE_COM_NM: '1598878', GIVE_CAR_NO: 11628, GIVE_DATE: '경기도 하남시 미사대로 540', partner_biz_no: 'A동 511호', partner_name: '최재호', TAKE_COM_RNO: '010-5197-2588', take_com_no: '010-5197-2588', TAKE_COM_NM: '010-5197-2588', TAKE_CAR_NO: '010-5197-2588', TAKE_DATE: '010-5197-2588', received_date: '1', GOODS_CD: '1', GOODS_NM: '1', GOODS_CNT: '1', MEAN_WEIGHT: '1', TOTAL_WEIGHT: '1', Received_Date: '1', },
  { id: 7, TRANS_NO: '1498411', GIVE_COM_RNO: '주식회사 에이서스', give_com_no: '6888600804', GIVE_COM_NM: '1598878', GIVE_CAR_NO: 11628, GIVE_DATE: '경기도 하남시 미사대로 540', partner_biz_no: 'A동 511호', partner_name: '최재호', TAKE_COM_RNO: '010-5197-2588', take_com_no: '010-5197-2588', TAKE_COM_NM: '010-5197-2588', TAKE_CAR_NO: '010-5197-2588', TAKE_DATE: '010-5197-2588', received_date: '1', GOODS_CD: '1', GOODS_NM: '1', GOODS_CNT: '1', MEAN_WEIGHT: '1', TOTAL_WEIGHT: '1', Received_Date: '1', },
  { id: 8, TRANS_NO: '1498411', GIVE_COM_RNO: '주식회사 에이서스', give_com_no: '6888600804', GIVE_COM_NM: '1598878', GIVE_CAR_NO: 11628, GIVE_DATE: '경기도 하남시 미사대로 540', partner_biz_no: 'A동 511호', partner_name: '최재호', TAKE_COM_RNO: '010-5197-2588', take_com_no: '010-5197-2588', TAKE_COM_NM: '010-5197-2588', TAKE_CAR_NO: '010-5197-2588', TAKE_DATE: '010-5197-2588', received_date: '1', GOODS_CD: '1', GOODS_NM: '1', GOODS_CNT: '1', MEAN_WEIGHT: '1', TOTAL_WEIGHT: '1', Received_Date: '1', },
  { id: 9, TRANS_NO: '1498411', GIVE_COM_RNO: '주식회사 에이서스', give_com_no: '6888600804', GIVE_COM_NM: '1598878', GIVE_CAR_NO: 11628, GIVE_DATE: '경기도 하남시 미사대로 540', partner_biz_no: 'A동 511호', partner_name: '최재호', TAKE_COM_RNO: '010-5197-2588', take_com_no: '010-5197-2588', TAKE_COM_NM: '010-5197-2588', TAKE_CAR_NO: '010-5197-2588', TAKE_DATE: '010-5197-2588', received_date: '1', GOODS_CD: '1', GOODS_NM: '1', GOODS_CNT: '1', MEAN_WEIGHT: '1', TOTAL_WEIGHT: '1', Received_Date: '1', },
  { id: 10, TRANS_NO: '1498411', GIVE_COM_RNO: '주식회사 에이서스', give_com_no: '6888600804', GIVE_COM_NM: '1598878', GIVE_CAR_NO: 11628, GIVE_DATE: '경기도 하남시 미사대로 540', partner_biz_no: 'A동 511호', partner_name: '최재호', TAKE_COM_RNO: '010-5197-2588', take_com_no: '010-5197-2588', TAKE_COM_NM: '010-5197-2588', TAKE_CAR_NO: '010-5197-2588', TAKE_DATE: '010-5197-2588', received_date: '1', GOODS_CD: '1', GOODS_NM: '1', GOODS_CNT: '1', MEAN_WEIGHT: '1', TOTAL_WEIGHT: '1', Received_Date: '1', },
];

const columns: ColumnDef<Member>[] = [
  {
    accessorKey: 'TRANS_NO',
    header: '관리표 번호',
  },
  {
    accessorKey: 'GIVE_COM_RNO',
    header: '사업자등록번호',
  },
  {
    accessorKey: 'give_com_no',
    header: 'EcoAS코드',
  },
  {
    accessorKey: 'GIVE_COM_NM',
    header: '업체명',
  },
  {
    accessorKey: 'GIVE_CAR_NO',
    header: '차량번호',
  },
  {
    accessorKey: 'GIVE_DATE',
    header: '인계일',
  },
  {
    accessorKey: 'partner_biz_no',
    header: '사업자등록번호',
  },
  {
    accessorKey: 'partner_name',
    header: '업체명',
  },
  {
    accessorKey: 'TAKE_COM_RNO',
    header: '사업자등록번호',
  },
  {
    accessorKey: 'take_com_no',
    header: 'EcoAS코드',
  },
  {
    accessorKey: 'TAKE_COM_NM',
    header: '업체명',
  },
  {
    accessorKey: 'TAKE_CAR_NO',
    header: '차량번호',
  },
  {
    accessorKey: 'TAKE_DATE',
    header: '인수일',
  },
  {
    accessorKey: 'received_date',
    header: '수신일',
  },
  {
    accessorKey: 'GOODS_CD',
    header: '품목코드',
  },
  {
    accessorKey: 'GOODS_NM',
    header: '품목명',
  },
  {
    accessorKey: 'GOODS_CNT',
    header: '수량',
  },
  {
    accessorKey: 'MEAN_WEIGHT',
    header: '평균중량',
  },
  {
    accessorKey: 'TOTAL_WEIGHT',
    header: '총중량',
  },
  {
    accessorKey: 'Received_Date',
    header: '수신일시',
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

export function CTMDetail() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [labelShrink, setLabelShrink] = useState(false);
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');

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

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setYear(event.target.value as string);
  };
  
  const handleMonthChange = (event: SelectChangeEvent<string>) => {
    setMonth(event.target.value as string);
  };
  

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
        수집운반 관리표 상세
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
        <Button variant="contained" color="secondary" style={{ height: '35px', marginLeft: '10px', fontSize: '12px' }} onClick={handleOpen}>
          관리표 조회
        </Button>
      </div>
      <TableContainer component={Paper} style={{ maxHeight: 545, overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={1} style={{ textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #e0e0e0' }}>
                구분
              </TableCell>
              <TableCell colSpan={5} style={{ textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #e0e0e0' }}>
                인계 업체
              </TableCell>
              <TableCell colSpan={2} style={{ textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #e0e0e0' }}>
                거래처
              </TableCell>
              <TableCell colSpan={5} style={{ textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #e0e0e0' }}>
                인수업체
              </TableCell>
              <TableCell colSpan={7} style={{ textAlign: 'center', fontWeight: 'bold', borderRight: '1px solid #e0e0e0' }}>
                상세
              </TableCell>
            </TableRow>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableCell key={header.id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                  <TableCell key={cell.id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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