import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../ComponentBox/UseCompany';
import numeral from 'numeral';
import '../../CSS/SCbar.css';
import { CellContext } from '@tanstack/react-table';
import { SelectChangeEvent } from '@mui/material';
import {
  useReactTable,
  getCoreRowModel,
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
  FormControl,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';

// API에서 받아올 데이터 구조에 맞는 타입 정의
type ValuableDeductionData = {
  id: number;
  companyCode: string;
  year: number;
  lciItemId: number;
  lciItemName: string;
  amount: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
};

type ComponentData = {
  id: number;
  name: string;
};

export function ValuableDeduction() {
  const [data, setData] = useState<ValuableDeductionData[]>([]);
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyMap, setCompanyMap] = useState<Record<string, string>>({});
  const [components, setComponents] = useState<ComponentData[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState('');
  const [deductionAmount, setDeductionAmount] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<ValuableDeductionData | null>(null);

  // 모달 열기 및 닫기
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedComponent('');
    setDeductionAmount('');
  };

  const handleEditOpen = (row: ValuableDeductionData) => {
    setCurrentRow(row);
    setDeductionAmount(row.amount.toString());
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setDeductionAmount('');
    setCurrentRow(null);
  };

  const handleDeleteOpen = (row: ValuableDeductionData) => {
    setCurrentRow(row);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setCurrentRow(null);
  };

  // 회사 데이터 가져오기
  const fetchCompanyData = useCallback(async () => {
    try {
      const response = await axios.get('https://lcaapi.acess.co.kr/Companies');
      const companies = response.data.list;
      const map: Record<string, string> = {};
      companies.forEach((company: { code: string; name: string }) => {
        map[company.code] = company.name;
      });
      setCompanyMap(map);
    } catch (error) {
      console.error('회사 데이터를 가져오는 중 오류 발생:', error);
    }
  }, []);

  // 컴포넌트 데이터 가져오기
  const fetchComponentData = useCallback(async () => {
    try {
      const response = await axios.get<{ components: ComponentData[] }>('https://lcaapi.acess.co.kr/Components');
      setComponents(response.data.components);
    } catch (error) {
      console.error('컴포넌트 데이터를 가져오는 중 오류 발생:', error);
    }
  }, []);

  useEffect(() => {
    fetchCompanyData();
    fetchComponentData();
  }, [fetchCompanyData, fetchComponentData]);

  // 테이블 컬럼 정의
  const columns: ColumnDef<ValuableDeductionData>[] = [
    { 
      id: 'id', 
      accessorKey: 'id', 
      header: 'ID',
      cell: (info: CellContext<ValuableDeductionData, unknown>) => (
        <div style={{ textAlign: 'center' }}>
          {info.getValue() as React.ReactNode}
        </div>
      ),
    },
    { 
      id: 'companyCode', 
      accessorKey: 'companyCode', 
      header: '사업회원',
      cell: (info: CellContext<ValuableDeductionData, unknown>) => (
        <div style={{ textAlign: 'center' }}>
          {companyMap[info.getValue() as string] || '알 수 없음'}
        </div>
      )
    },
    { 
      id: 'year', 
      accessorKey: 'year', 
      header: '년도',
      cell: (info: CellContext<ValuableDeductionData, unknown>) => <div style={{ textAlign: 'center' }}>{info.getValue() as React.ReactNode}</div>
    },
    { 
      id: 'lciItemName', 
      accessorKey: 'lciItemName', 
      header: 'LCI 항목명',
      cell: (info: CellContext<ValuableDeductionData, unknown>) => <div style={{ textAlign: 'center' }}>{info.getValue() as React.ReactNode}</div>
    },
    { 
      id: 'amount', 
      accessorKey: 'amount', 
      header: '차감량', 
      cell: (info: CellContext<ValuableDeductionData, unknown>) => <div style={{ textAlign: 'center' }}>{numeral(info.getValue()).format('0,0')}</div>
    },
    {
      id: 'actions',
      header: '액션',
      cell: (info: CellContext<ValuableDeductionData, unknown>) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button onClick={() => handleEditOpen(info.row.original)} color="primary">수정</Button>
          <Button onClick={() => handleDeleteOpen(info.row.original)} color="secondary">삭제</Button>
        </div>
      ),
    },
  ];

  // 데이터 가져오는 함수
  const fetchData = useCallback(async () => {
    if (!selectedCompany || !year) return;

    setLoading(true);
    try {
      const url = `https://lcaapi.acess.co.kr/ValuableDeductions?companyCode=${selectedCompany.code}&year=${year}`;
      const response = await axios.get<ValuableDeductionData[]>(url);
      
      setData(response.data);
    } catch (error) {
      console.error('데이터를 가져오는 중 오류 발생:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCompany, year]);

  // 등록 버튼 클릭 핸들러
  const handleRegister = async () => {
    try {
      // 차감량 포맷 적용: 콤마 제거 후 소수점 다섯 자리까지 맞춤
      const formattedAmount = parseFloat(deductionAmount.replace(/,/g, '')).toFixed(5);

      await axios.post('https://lcaapi.acess.co.kr/ValuableDeductions', {
        companyCode: selectedCompany?.code,
        year: parseInt(year),
        lciItemId: parseInt(selectedComponent),
        amount: formattedAmount,
      });

      handleClose();
      fetchData(); // 데이터 새로고침
    } catch (error) {
      console.error('등록 중 오류 발생:', error);
    }
  };

  // 차감량 수정 버튼 클릭 핸들러
  const handleEdit = async () => {
    if (!currentRow) return;

    try {
      const formattedAmount = parseFloat(deductionAmount.replace(/,/g, '')).toFixed(5);

      await axios.put(`https://lcaapi.acess.co.kr/ValuableDeductions/${currentRow.id}`, {
        amount: formattedAmount,
      });

      handleEditClose();
      fetchData(); // 데이터 새로고침
    } catch (error) {
      console.error('수정 중 오류 발생:', error);
    }
  };

  // 삭제 버튼 클릭 핸들러
  const handleDelete = async () => {
    if (!currentRow) return;

    try {
      await axios.delete(`https://lcaapi.acess.co.kr/ValuableDeductions/${currentRow.id}`);

      handleDeleteClose();
      fetchData(); // 데이터 새로고침
    } catch (error) {
      console.error('삭제 중 오류 발생:', error);
    }
  };

  // 차감량 입력 핸들러: 숫자와 소수점만 허용
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // 숫자와 소수점만 허용하는 정규식
    if (/^[0-9]*\.?[0-9]*$/.test(value)) {
      setDeductionAmount(value);
    }
  };

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setYear(event.target.value as string);
  };

  const handleSearch = () => {
    fetchData();
  };

  const table = useReactTable<ValuableDeductionData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        유가물 차감량 관리
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <UseCompany onCompanyChange={setSelectedCompany} showAllOption={false} />
        <FormControl style={{ marginRight: '10px' }}>
          <Select
            id="year-select"
            value={year}
            onChange={handleYearChange}
            displayEmpty
            style={{ width: '100px' }}
            sx={{ height: '45px' }}
          >
            <MenuItem value="" disabled>연도</MenuItem>
            {Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()).map(year => (
              <MenuItem key={year} value={year}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={handleSearch} disabled={!selectedCompany || !year}>
          조회
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleOpen}
          style={{ marginLeft: '10px' }}
          disabled={!selectedCompany || !year} 
        >
          차감량 등록
        </Button>
      </div>

      <TableContainer component={Paper} style={{ maxHeight: 600, overflowY: 'auto', overflowX: 'auto' }} className="custom-scrollbar custom-table">
        <Table stickyHeader>
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
                      textAlign: 'center',
                      backgroundColor: '#cfcfcf',
                      fontWeight: 'bold',
                      position: 'sticky',
                      top: 0,
                      zIndex: 5,
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
                        textAlign: 'right',
                        backgroundColor: '#fff',
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

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>차감량 등록</DialogTitle>
        <DialogContent>
          <FormControl fullWidth style={{ marginBottom: '10px' }}>
            <Typography>사업회원: {companyMap[selectedCompany?.code || '']}</Typography>
          </FormControl>
          <FormControl fullWidth style={{ marginBottom: '10px' }}>
            <Typography>년도: {year}</Typography>
          </FormControl>
          <FormControl fullWidth style={{ marginBottom: '10px' }}>
            <Select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>LCI 항목 선택</MenuItem>
              {components.map((component) => (
                <MenuItem key={component.id} value={component.id.toString()}>{component.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="차감량"
            value={deductionAmount}
            onChange={handleAmountChange}
            fullWidth
            inputProps={{ inputMode: 'decimal' }} // 모바일에서 숫자 패드 표시
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">취소</Button>
          <Button onClick={handleRegister} color="primary">등록</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>차감량 수정</DialogTitle>
        <DialogContent>
          <Typography style={{ marginBottom: '10px' }}>
            사업회원: {companyMap[currentRow?.companyCode || '']}
          </Typography>
          <Typography style={{ marginBottom: '10px' }}>
            년도: {currentRow?.year}
          </Typography>
          <Typography style={{ marginBottom: '10px' }}>
            LCI 항목명: {currentRow?.lciItemName}
          </Typography>
          <TextField
            label="차감량"
            value={deductionAmount}
            onChange={handleAmountChange}
            fullWidth
            inputProps={{ inputMode: 'decimal' }}
            style={{ marginBottom: '10px' }} // 각 요소 간 간격 추가
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} color="secondary">취소</Button>
          <Button onClick={handleEdit} color="primary">수정</Button>
        </DialogActions>
      </Dialog>

      {/* 삭제 확인 모달 */}
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>삭제 확인</DialogTitle>
        <DialogContent>
          정말 삭제하시겠습니까?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose} color="secondary">취소</Button>
          <Button onClick={handleDelete} color="primary">삭제</Button>
        </DialogActions>
      </Dialog>

    </div>
  );
}
