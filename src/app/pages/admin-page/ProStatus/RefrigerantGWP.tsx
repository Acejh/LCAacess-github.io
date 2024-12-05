import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import numeral from 'numeral';
import { SelectChangeEvent, TextField } from '@mui/material';
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
  Modal,
  Box,
} from '@mui/material';

type DataItem = {
  id: number;
  midItemName: string;
  coefficient: number;
};

type MidItemCodes = {
  [key: string]: string;
};

export function RefrigerantGWP() {
  const [data, setData] = useState<DataItem[]>([]);
  const [year, setYear] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [midItems, setMidItems] = useState<MidItemCodes>({});
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMidItem, setSelectedMidItem] = useState('');
  const [coefficient, setCoefficient] = useState('');
  const [selectedRow, setSelectedRow] = useState<DataItem | null>(null);

  const columns: ColumnDef<DataItem>[] = [
    { accessorKey: 'midItemName', header: '냉매 제품' },
    {
      accessorKey: 'coefficient',
      header: '계수',
      cell: (info) => numeral(info.getValue()).format('0,0.00000'),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => handleEdit(row.original)}
          >
            수정
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => handleDelete(row.original.id)}
          >
            삭제
          </Button>
        </div>
      ),
    },
  ];

  const fetchData = useCallback(async () => {
    if (!year) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const url = `https://lcaapi.acess.co.kr/RefCoefficients?year=${year}`;
      const response = await axios.get(url);
      const list: DataItem[] = response.data.list || [];
      setData(list);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [year]);

  const fetchMidItems = useCallback(async () => {
    try {
      const response = await axios.get('https://lcaapi.acess.co.kr/RefCoefficients/midItems');
      setMidItems(response.data.midItemCodes || {});
    } catch (error) {
      console.error('Error fetching mid items:', error);
    }
  }, []);

  useEffect(() => {
    if (hasSearched) {
      fetchData();
    }
  }, [hasSearched, fetchData]);

  useEffect(() => {
    if (registerModalOpen || editModalOpen) {
      fetchMidItems();
    }
  }, [registerModalOpen, editModalOpen, fetchMidItems]);

  const handleSearch = () => {
    setYear(selectedYear);
    setHasSearched(true);
  };

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setSelectedYear(event.target.value as string);
  };

  const handleRegisterModalOpen = () => {
    setRegisterModalOpen(true);
  };

  const handleRegisterModalClose = () => {
    setRegisterModalOpen(false);
    setSelectedMidItem('');
    setCoefficient('');
  };

  const handleRegister = async () => {
    try {
      const payload = {
        year: Number(year),
        midItemCode: selectedMidItem,
        coefficient: Number(coefficient),
      };

      await axios.post('https://lcaapi.acess.co.kr/RefCoefficients', payload);

      alert('등록되었습니다.');
      handleRegisterModalClose();
      fetchData(); // 데이터 갱신
    } catch (error) {
      console.error('등록 실패:', error);
      alert('등록 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (row: DataItem) => {
    setSelectedRow(row);
    setCoefficient(String(row.coefficient));
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setSelectedRow(null);
    setCoefficient('');
  };

  const handleEditSave = async () => {
    if (!selectedRow) return;

    try {
      const payload = {
        coefficient: Number(coefficient),
      };

      await axios.put(`https://lcaapi.acess.co.kr/RefCoefficients/${selectedRow.id}`, payload);

      alert('수정되었습니다.');
      handleEditModalClose();
      fetchData(); // 데이터 갱신
    } catch (error) {
      console.error('수정 실패:', error);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`https://lcaapi.acess.co.kr/RefCoefficients/${id}`);
      alert('삭제되었습니다.');
      fetchData(); // 데이터 갱신
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const table = useReactTable<DataItem>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        냉매 GWP 관리
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <FormControl style={{ marginRight: '10px' }}>
          <Select
            id="year-select"
            value={selectedYear}
            onChange={handleYearChange}
            displayEmpty
            style={{ width: '100px' }}
            sx={{ height: '45px' }}
          >
            <MenuItem value="" disabled>
              연도
            </MenuItem>
            {Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()).map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleSearch}
          disabled={!selectedYear}
        >
          조회
        </Button>
        <Button
          variant="contained"
          color="secondary"
          style={{ height: '35px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleRegisterModalOpen}
          disabled={!selectedYear}
        >
          등록
        </Button>
      </div>
      <TableContainer
        component={Paper}
        style={{ maxHeight: 600, overflowY: 'auto' }}
        className="custom-scrollbar custom-table"
      >
        <Table>
          {loading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={3} style={{ textAlign: 'center' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <>
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
                          ...(header.column.id === 'actions' && { width: '120px' }),
                        }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textAlign: 'center',
                            ...(cell.column.id === 'actions' && { width: '120px' }),
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} style={{ textAlign: 'center', color: 'red' }}>
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      </TableContainer>

      {/* 등록 모달 */}
      <Modal open={registerModalOpen} onClose={handleRegisterModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            데이터 등록
          </Typography>
          <Typography>연도: {year}</Typography>
          <FormControl fullWidth margin="normal">
            <Select
              value={selectedMidItem}
              onChange={(e) => setSelectedMidItem(e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>
                냉매 제품 선택
              </MenuItem>
              {Object.entries(midItems).map(([key, value]) => (
                <MenuItem key={key} value={key}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="계수"
            value={coefficient}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*\.?\d*$/.test(value)) {
                setCoefficient(value); // 숫자와 소수점만 입력 가능
              }
            }}
            fullWidth
            margin="normal"
            inputProps={{ inputMode: 'decimal', pattern: '[0-9]*' }} // 모바일에서도 숫자 키패드 활성화
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleRegisterModalClose} color="secondary" sx={{ mr: 2 }}>
              취소
            </Button>
            <Button onClick={handleRegister} variant="contained" color="primary">
              등록
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* 수정 모달 */}
      <Modal open={editModalOpen} onClose={handleEditModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" gutterBottom>
            데이터 수정
          </Typography>
          {selectedRow && (
            <>
              <Typography>냉매 제품: {selectedRow.midItemName}</Typography>
              <Typography>연도: {year}</Typography>
              <TextField
                label="계수"
                value={coefficient}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d*$/.test(value)) {
                    setCoefficient(value); // 숫자와 소수점만 입력 가능
                  }
                }}
                fullWidth
                margin="normal"
                inputProps={{ inputMode: 'decimal', pattern: '[0-9]*' }}
              />
            </>
          )}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button onClick={handleEditModalClose} color="secondary" sx={{ mr: 2 }}>
              취소
            </Button>
            <Button onClick={handleEditSave} variant="contained" color="primary">
              수정
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}
