import React, { useState, useEffect, useCallback, } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../../ComponentBox/UseCompany';
import numeral from 'numeral';
import '../../../CSS/SCbar.css';
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
  Typography,
  CircularProgress,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Modal,
  Box,
  Grid
} from '@mui/material';

type Item = {
  id: number;
  year: number;
  type: string;
  category: string;
  name: string;
  unit: string;
  gwp: number;
  gwpAlt: number;
};

type Input = {
  ids: number;
  inputType: string;
  unit: string;
  year: string | number;
  '1월': number;
  '2월': number;
  '3월': number;
  '4월': number;
  '5월': number;
  '6월': number;
  '7월': number;
  '8월': number;
  '9월': number;
  '10월': number;
  '11월': number;
  '12월': number;
};

type ApiResponse = {
  inputType: string;
  unit: string;
  year: number;
  ids: number[];
  monthlyAmounts: number[];
};

const columns: ColumnDef<Input>[] = [
  { accessorKey: 'inputType', header: '항목' },
  { accessorKey: 'unit', header: '단위' },
  { accessorKey: 'year', header: () => <div style={{ textAlign: 'right' }}>연도</div>},
  { accessorKey: '1월', header: () => <div style={{ textAlign: 'right' }}>1월 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0') },
  { accessorKey: '2월', header: () => <div style={{ textAlign: 'right' }}>2월 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0') },
  { accessorKey: '3월', header: () => <div style={{ textAlign: 'right' }}>3월 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0') },
  { accessorKey: '4월', header: () => <div style={{ textAlign: 'right' }}>4월 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0') },
  { accessorKey: '5월', header: () => <div style={{ textAlign: 'right' }}>5월 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0') },
  { accessorKey: '6월', header: () => <div style={{ textAlign: 'right' }}>6월 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0') },
  { accessorKey: '7월', header: () => <div style={{ textAlign: 'right' }}>7월 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0') },
  { accessorKey: '8월', header: () => <div style={{ textAlign: 'right' }}>8월 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0') },
  { accessorKey: '9월', header: () => <div style={{ textAlign: 'right' }}>9월 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0') },
  { accessorKey: '10월', header: () => <div style={{ textAlign: 'right' }}>10월 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0') },
  { accessorKey: '11월', header: () => <div style={{ textAlign: 'right' }}>11월 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0') },
  { accessorKey: '12월', header: () => <div style={{ textAlign: 'right' }}>12월 (kg)</div>, cell: info => numeral(info.getValue()).format('0,0') },
];

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
};

export function Ad_Input() {
  const [data, setData] = useState<Input[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(6), (val, index) => currentYear - index);
  const [items, setItems] = useState<Item[]>([]);
  const [tempSelectedCompany, setTempSelectedCompany] = useState<Company | null>(null); 
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [tempSelectedYear, setTempSelectedYear] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isExist, setIsExist] = useState(false);
  const [newInput, setNewInput] = useState({
    companyCode: '',
    lciItemId: '',
    year: '2023',
    month: 1,
    amount: '',
  });

  const fetchItems = useCallback(async () => {
    try {
      const response = await axios.get('https://lcaapi.acess.co.kr/Inputs/items');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }, []);

  const fetchData = useCallback(async (company: Company | null, year: string) => {
    if (!company) {
      setData([]);
      setLoading(false);
      return;
    }
  
    setError(null);
    setLoading(true); 
    try {
      let url = `https://lcaapi.acess.co.kr/Inputs?companyCode=${company.code}`;
      if (year) {
        url += `&year=${year}`;
      }
      // console.log(`API 호출 경로: ${url}`);
      // console.log(`회사 코드: ${company.code}`);
      // console.log(`연도: ${year}`);
  
      const response = await axios.get(url);
  
      if (response.status === 404) {
        const errorMessage = response.data?.title || 'Data not found';
        throw new Error(errorMessage);
      }
  
      const apiResponse: ApiResponse[] = response.data;
  
      const formattedData: Input[] = items.map((item) => {
        const apiItem = apiResponse.find(apiItem => apiItem.inputType === item.name) || {
          ids: Array(12).fill(0),
          monthlyAmounts: Array(12).fill(0),
          year: year || '전체',
        };
        return {
          ids: apiItem.ids[0],
          inputType: item.name,
          unit: item.unit,
          year: apiItem.year,
          '1월': apiItem.monthlyAmounts[0],
          '2월': apiItem.monthlyAmounts[1],
          '3월': apiItem.monthlyAmounts[2],
          '4월': apiItem.monthlyAmounts[3],
          '5월': apiItem.monthlyAmounts[4],
          '6월': apiItem.monthlyAmounts[5],
          '7월': apiItem.monthlyAmounts[6],
          '8월': apiItem.monthlyAmounts[7],
          '9월': apiItem.monthlyAmounts[8],
          '10월': apiItem.monthlyAmounts[9],
          '11월': apiItem.monthlyAmounts[10],
          '12월': apiItem.monthlyAmounts[11],
        };
      });
  
      setData(formattedData);
    } catch (error: unknown) {
      console.error('Error fetching data:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setError('데이터가 존재하지 않습니다. 데이터를 추가해주시길 바랍니다');
      } else if (error instanceof Error) {
        setError(`데이터를 불러오는데 실패했습니다: ${error.message}`);
      } else {
        setError('데이터를 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false); 
    }
  }, [items]);
  
  useEffect(() => {
    if (selectedCompany && selectedYear) {
      fetchData(selectedCompany, selectedYear);
    } else {
      setLoading(false);
    }
  }, [selectedCompany, selectedYear, fetchData,]);

  useEffect(() => {
    const fetchAmount = async () => {
      console.log('현재 선택된 값:', {
        companyCode: newInput.companyCode,
        lciItemId: newInput.lciItemId,
        year: newInput.year,
        month: newInput.month,
      });
  
      if (newInput.companyCode && newInput.lciItemId && newInput.year && newInput.month) {
        try {
          const response = await axios.get(
            `https://lcaapi.acess.co.kr/Inputs/Exist?lciItemId=${newInput.lciItemId}&companyCode=${newInput.companyCode}&year=${newInput.year}&month=${newInput.month}`
          );
          const { isExist, amount } = response.data;
  
          console.log('API 응답:', response.data);
  
          setIsExist(isExist); // isExist 상태 업데이트
  
          if (isExist) {
            // 가져온 amount 값을 투입량 필드에 설정
            setNewInput(prevState => ({
              ...prevState,
              amount: amount.toFixed(5), // 소수점 5자리까지
            }));
            console.log('투입량 업데이트:', amount.toFixed(5));
          } else {
            // 데이터를 찾지 못한 경우 투입량을 0으로 초기화
            setNewInput(prevState => ({
              ...prevState,
              amount: '',
            }));
            console.log('데이터가 존재하지 않음. 투입량 초기화.');
          }
        } catch (error) {
          console.error('Error fetching amount:', error);
        }
      }
    };
  
    // newInput 값이 변경될 때마다 호출
    fetchAmount();
  }, [newInput.companyCode, newInput.lciItemId, newInput.year, newInput.month]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleFetchData = () => {
    setData([]);
    setLoading(true);
    setSelectedCompany(tempSelectedCompany);
    setSelectedYear(tempSelectedYear === '전체' ? '' : tempSelectedYear);
    fetchData(tempSelectedCompany, tempSelectedYear === '전체' ? '' : tempSelectedYear);
  };
  
  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setTempSelectedYear(event.target.value);
  };
  
  const handleCompanyChange = (company: Company | null) => {
    setTempSelectedCompany(company);
  };

  const handleOpen = () => {
    setNewInput(prev => ({ ...prev, companyCode: selectedCompany?.code || '', year: selectedYear || '' })); 
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSelectChange = (e: SelectChangeEvent<number>, key: string) => {
    setNewInput(prevState => ({
      ...prevState,
      [key]: e.target.value as number,
    }));
    
    console.log(`선택된 ${key}:`, e.target.value);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewInput(prevState => ({
      ...prevState,
      [name]: value,
    }));
    
    console.log(`입력된 ${name}:`, value);
  };

  const handleSubmit = async () => {
    try {
      const { companyCode, lciItemId, year, month, amount } = newInput;
  
      if (!companyCode || !lciItemId || !year || !month || !amount) {
        throw new Error('모든 필드를 입력해 주세요.');
      }
  
      if (isExist) {
        // isExist가 true일 때, PUT 요청을 실행
        const inputType = items.find(item => item.id === Number(lciItemId))?.name; // 선택된 항목의 이름을 찾아냄
        if (!inputType) {
          throw new Error('선택된 항목이 올바르지 않습니다.');
        }
  
        // 선택한 항목, 연도, 회사코드를 기반으로 GET 요청을 보내 ids 값을 찾아야 함
        const fetchUrl = `https://lcaapi.acess.co.kr/Inputs?inputType=${inputType}&year=${year}&companyCode=${companyCode}`;
        console.log('데이터 확인 API 호출 경로:', fetchUrl);
  
        try {
          const response = await axios.get(fetchUrl);
          const inputData = response.data[0]; // 데이터는 배열 형태로 들어옴
          if (!inputData || !inputData.ids || inputData.ids.length === 0) {
            throw new Error('선택한 조건에 맞는 데이터가 없습니다.');
          }
  
          const ids = inputData.ids;
          const id = ids[month - 1]; // month에 맞는 id를 찾아냄 (1월이 index 0)
          if (!id) {
            throw new Error('해당 월에 대한 데이터가 없습니다.');
          }
  
          // PUT 요청을 위한 경로
          const putUrl = `https://lcaapi.acess.co.kr/Inputs/${id}`;
          const putPayload = {
            companyCode,
            lciItemId: Number(lciItemId),
            year: Number(year),
            month: Number(month),
            amount: Number(amount),
          };
  
          // PUT 요청 실행
          console.log('PUT 요청 URL:', putUrl);
          console.log('PUT 요청 데이터:', putPayload);
  
          const putResponse = await axios.put(putUrl, putPayload);
          console.log('PUT 응답:', putResponse.data);
  
        } catch (fetchError) {
          console.error('데이터를 확인하는 중 오류 발생:', fetchError);
        }
      } else {
        // isExist가 false일 때, POST 요청을 실행
        const postUrl = `https://lcaapi.acess.co.kr/Inputs`;
        const postPayload = {
          lciItemId: Number(lciItemId),
          companyCode: companyCode,
          year: Number(year),
          month: Number(month),
          amount: Number(amount),
        };
  
        console.log('POST 요청 URL:', postUrl);
        console.log('POST 요청 데이터:', postPayload);
  
        try {
          const postResponse = await axios.post(postUrl, postPayload);
          console.log('POST 응답:', postResponse.data);
        } catch (postError) {
          console.error('POST 요청 중 오류 발생:', postError);
        }
      }
  
      handleClose();
      fetchData(selectedCompany, selectedYear); // 새로 데이터를 불러옴
    } catch (error) {
      console.error('데이터 등록 중 오류 발생:', error);
    }
  };
  
  const table = useReactTable<Input>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        투입물 관리
      </Typography>
      
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <UseCompany onCompanyChange={handleCompanyChange} showAllOption={false}/>
        <FormControl style={{ marginRight: '10px' }}>
          <InputLabel id="year-label">연도</InputLabel>
          <Select
            labelId="year-label"
            id="year-select"
            value={tempSelectedYear}
            label="연도"
            onChange={handleYearChange}
            style={{ width: '100px' }}
            sx={{ height: '45px' }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 120,
                },
              },
            }}
          >
            <MenuItem value="전체">전체</MenuItem>
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          style={{ height: '35px', padding: '0 10px', fontSize: '14px', marginRight: '10px' }}
          onClick={handleFetchData}
        >
          조회
        </Button>
        <Button
          variant="contained"
          color="primary"
          style={{ height: '35px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleOpen}
          disabled={!selectedCompany}
        >
          투입물 등록/수정
        </Button>
      </div>
      {error && (
        <Typography variant="body1" color="error" style={{ marginBottom: '20px' }}>
          {error}
        </Typography>
      )}
      <TableContainer
        component={Paper}
        style={{ maxHeight: 545, overflowY: 'auto' }}
        className="custom-scrollbar"
      >
        <Table>
          {loading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length} style={{ textAlign: 'center' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : selectedCompany ? (
            <>
              <TableHead>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableCell 
                        key={header.id} 
                        style={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          position: 'sticky', 
                          top: 0, 
                          backgroundColor: '#cfcfcf', 
                          zIndex: 1 
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
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell
                          key={cell.id}
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            color: cell.column.id === 'year' && cell.getValue() === '등록 필요' ? 'red' : 'inherit',
                            textAlign: ['year' , '1월' , '2월' , '3월' , '4월' , '5월' , '6월' , '7월' , '8월' ,'9월' , '10월' , '11월' , '12월'].includes(cell.column.id) ? 'right' : 'left',
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
            </>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell colSpan={columns.length} style={{ textAlign: 'center', color: 'red' }}>
                  사업회원 및 연도를 선택하여 십시오.
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h5" component="h2" style={{ marginBottom: 20 }}>
            투입물 등록
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="companyCode"
                label="사업회원"
                variant="outlined"
                fullWidth
                value={selectedCompany?.name || ''}
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
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>항목</InputLabel>
                <Select
                  value={newInput.lciItemId}
                  onChange={(e) => handleSelectChange(e as SelectChangeEvent<number>, 'lciItemId')}
                  label="항목"
                >
                  {items.map((item) => (
                    <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                  ))}
              </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl style={{ marginRight: '10px' }}>
                <InputLabel id="year-label">연도</InputLabel>
                <Select
                  labelId="year-label"
                  id="year-select"
                  value={tempSelectedYear}
                  label="연도"
                  onChange={handleYearChange}
                  style={{ width: '532px' }}
                  sx={{ height: '45px' }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 120,
                      },
                    },
                  }}
                >
                  <MenuItem value="전체">선택안함</MenuItem>
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>월</InputLabel>
                <Select
                  value={newInput.month}
                  onChange={(e) => handleSelectChange(e as SelectChangeEvent<number>, 'month')}
                  label="월"
                  MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }} 
                >
                  {[...Array(12)].map((_, index) => (
                    <MenuItem key={index} value={index + 1}>{index + 1}월</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="amount"
                label="투입량 (kg)"
                variant="outlined"
                type="number"
                fullWidth
                value={newInput.amount}
                onChange={handleInputChange}
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
    </div>
  );
}