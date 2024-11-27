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
  CellContext,
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
  ids: number | number[]; 
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
  companyCode: string;
  inputType: string;
  lciItemId: number;
  unit: string;
  year: number;
  ids: number[];
  monthlyAmounts: number[];
};

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
  const [amountLabel, setAmountLabel] = useState('투입량');
  const [guideMessage, setGuideMessage] = useState('');
  const years = Array.from(new Array(6), (val, index) => currentYear - index);
  const [items, setItems] = useState<Item[]>([]);
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState<number | string | null>(null);
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

        const response = await axios.get(url);

        if (response.status === 404) {
            const errorMessage = response.data?.title || 'Data not found';
            throw new Error(errorMessage);
        }

        const apiResponse: ApiResponse[] = response.data;

        // API에서 반환된 데이터를 중복 제거하면서 매핑
        const uniqueItems = Array.from(new Set(apiResponse.map((item) => item.inputType)));

        const formattedData: Input[] = uniqueItems.map((uniqueInputType) => {
            const apiItem = apiResponse.find((item) => item.inputType === uniqueInputType);

            if (!apiItem) {
                return {
                    ids: Array(12).fill(0), // 기본 ID 배열
                    inputType: uniqueInputType,
                    unit: '',
                    year: year || '전체',
                    '1월': 0,
                    '2월': 0,
                    '3월': 0,
                    '4월': 0,
                    '5월': 0,
                    '6월': 0,
                    '7월': 0,
                    '8월': 0,
                    '9월': 0,
                    '10월': 0,
                    '11월': 0,
                    '12월': 0,
                };
            }

            return {
                ids: apiItem.ids, // IDs 배열 유지
                inputType: apiItem.inputType,
                unit: apiItem.unit,
                year: apiItem.year,
                '1월': apiItem.monthlyAmounts[0] ?? 0,
                '2월': apiItem.monthlyAmounts[1] ?? 0,
                '3월': apiItem.monthlyAmounts[2] ?? 0,
                '4월': apiItem.monthlyAmounts[3] ?? 0,
                '5월': apiItem.monthlyAmounts[4] ?? 0,
                '6월': apiItem.monthlyAmounts[5] ?? 0,
                '7월': apiItem.monthlyAmounts[6] ?? 0,
                '8월': apiItem.monthlyAmounts[7] ?? 0,
                '9월': apiItem.monthlyAmounts[8] ?? 0,
                '10월': apiItem.monthlyAmounts[9] ?? 0,
                '11월': apiItem.monthlyAmounts[10] ?? 0,
                '12월': apiItem.monthlyAmounts[11] ?? 0,
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
  }, []);

  
  useEffect(() => {
    if (selectedCompany && selectedYear) {
      fetchData(selectedCompany, selectedYear);
    } else {
      setLoading(false);
    }
  }, [selectedCompany, selectedYear, fetchData,]);

  useEffect(() => {
    const fetchAmount = async () => {
      if (newInput.companyCode && newInput.lciItemId && newInput.year && newInput.month) {
        try {
          const response = await axios.get(
            `https://lcaapi.acess.co.kr/Inputs/Exist?lciItemId=${newInput.lciItemId}&companyCode=${newInput.companyCode}&year=${newInput.year}&month=${newInput.month}`
          );
          const { isExist, amount } = response.data;
  
          setIsExist(isExist); 
  
          if (isExist) {
            // 가져온 amount 값을 투입량 필드에 설정
            setNewInput(prevState => ({
              ...prevState,
              amount: amount.toFixed(5), 
            }));
          } else {
            // 데이터를 찾지 못한 경우 투입량을 0으로 초기화
            setNewInput(prevState => ({
              ...prevState,
              amount: '',
            }));
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

  const handleSaveEdit = async (rowId: string, columnId: string) => {
    if (!editingCell || editValue === null) {
      setEditingCell(null);
      return;
    }
  
    const row = table.getRowModel().rows.find((row) => row.id === rowId);
    if (!row) {
      console.error(`Row not found for editing: Row ID = ${rowId}, Column ID = ${columnId}`);
      setEditingCell(null);
      return;
    }
  
    const monthIndex = parseInt(columnId.replace('월', ''), 10) - 1;
    const ids = row.original.ids;
  
    // 해당 월의 id 가져오기
    const id = Array.isArray(ids) ? ids[monthIndex] : 0;
  
    if (id && !isNaN(monthIndex)) {
      try {
  
        await axios.put(`https://lcaapi.acess.co.kr/Inputs/${id}`, {
          month: monthIndex + 1, 
          amount: Number(editValue),
        });
  
        setEditValue(null);
        setEditingCell(null);
  
        if (selectedCompany && selectedYear) {
          fetchData(selectedCompany, selectedYear);
        }
      } catch (error) {
        console.error('Error saving data:', error);
      }
    } else {
      console.error(`Invalid ID or month index: ${id}, Month: ${columnId}`);
    }
  };
  
  const handleCancelEdit = () => {
    setEditValue(null);
    setEditingCell(null);
  };
  
  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>, rowId: string, columnId: string) => {
    if (event.key === 'Enter') {
      handleSaveEdit(rowId, columnId);
    } else if (event.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const renderCellContent = (cell: CellContext<Input, number | undefined>) => {
    const { id: columnId } = cell.column;
    const { id: rowId } = cell.row;
  
    if (editingCell?.rowId === rowId && editingCell?.columnId === columnId) {
      return (
        <TextField
          value={editValue || ''}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCancelEdit} 
          onKeyDown={(e) => handleKeyPress(e, rowId, columnId)} 
          autoFocus
          fullWidth
        />
      );
    }
  
    return (
      <div
        onDoubleClick={() => {
          setEditingCell({ rowId, columnId });
          setEditValue(cell.getValue() ?? '');
        }}
        style={{ cursor: 'pointer' }}
      >
        {numeral(cell.getValue()).format('0,0') ?? ''}
      </div>
    );
  };

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
    // 회사 코드와 연도를 업데이트하고 모달을 엽니다.
    setNewInput(prev => ({ ...prev, companyCode: selectedCompany?.code || '', year: selectedYear || '' }));
  
    // 투입물 등록 버튼을 눌렀을 때 데이터를 가져오는 fetchAmount 함수를 호출합니다.
    const fetchAmount = async () => {
      if (newInput.companyCode && newInput.lciItemId && newInput.year && newInput.month) {
        try {
          const response = await axios.get(
            `https://lcaapi.acess.co.kr/Inputs/Exist?lciItemId=${newInput.lciItemId}&companyCode=${newInput.companyCode}&year=${newInput.year}&month=${newInput.month}`
          );
          const { isExist, amount } = response.data;
  
          setIsExist(isExist); 
  
          if (isExist) {
            // 가져온 amount 값을 투입량 필드에 설정
            setNewInput(prevState => ({
              ...prevState,
              amount: amount.toFixed(5), 
            }));
          } else {
            // 데이터를 찾지 못한 경우 투입량을 0으로 초기화
            setNewInput(prevState => ({
              ...prevState,
              amount: '',
            }));
          }
        } catch (error) {
          console.error('Error fetching amount:', error);
        }
      }
    };
  
    fetchAmount(); 
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
  
    // lciItemId가 변경될 때 해당 항목의 category 값을 찾아서 가이드 메시지 업데이트
    if (key === 'lciItemId') {
      const selectedItem = items.find(item => item.id === Number(e.target.value));
      if (selectedItem) {
        setAmountLabel(`투입량 (${selectedItem.unit})`);
        
        // 카테고리에 따른 가이드 메시지 설정
        switch (selectedItem.category) {
          case 'Electricity':
            setGuideMessage('한전 고지서에 기입된 [kWh] 단위의 사용량을 기재해 주세요.<br />' +
            '재활용 공장동과 사무동이 별도로 관리되고 있다면 공장동만 입력해주세요.'
            );
            break;
          case 'Fuel':
            setGuideMessage(
              '재활용 공정 내 사용되는 연료에 대해 [L] 단위의 사용량을 기재해 주세요.<br />' + 
              '<span style="color: red;">지게차 경유 사용량은 제외해주세요.</span>'
            );
            break;
          case 'Water':
            setGuideMessage(
              '외부에서 투입되는 상수, 공업용수에 대해 [㎥] 단위의 사용량을 기재해 주세요.<br />' +
              '재활용 공정에 사용하는 양만 기입해주세요..<br />' + 
              '따로 외부에서 투입하지 않고 내부에서 순환하여 사용하는 경우에는 기재하지 마세요.<br />' +
              '(예시 : 세탁기 평형수 등)'
            );
            break;
          default:
            setGuideMessage('');
            break;
        }
      }
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewInput(prevState => ({
      ...prevState,
      [name]: value,
    }));
    
  };

  const handleSubmit = async () => {
    try {
      const { companyCode, lciItemId, year, month, amount } = newInput;
  
      if (!companyCode || !lciItemId || !year || !month || amount === '' || amount === null) {
        throw new Error('모든 필드를 입력해 주세요.');
      }
  
      if (isExist) {
        const fetchUrl = `https://lcaapi.acess.co.kr/Inputs?year=${year}&companyCode=${companyCode}`;
  
        try {
          const response = await axios.get<ApiResponse[]>(fetchUrl); 
          const inputData = response.data.find((item: ApiResponse) => item.lciItemId === Number(lciItemId));
  
          if (!inputData) {
            throw new Error('선택한 조건에 맞는 데이터가 없습니다.');
          }
  
          const ids = inputData.ids;
          const id = ids[month - 1];
          if (!id) {
            throw new Error('해당 월에 대한 데이터가 없습니다.');
          }
  
          const putUrl = `https://lcaapi.acess.co.kr/Inputs/${id}`;
          const putPayload = {
            companyCode,
            lciItemId: Number(lciItemId),
            year: Number(year),
            month: Number(month),
            amount: Number(amount), 
          };
  
          await axios.put(putUrl, putPayload);
  
        } catch (fetchError) {
          console.error('데이터를 확인하는 중 오류 발생:', fetchError);
        }
      } else {
        const postUrl = `https://lcaapi.acess.co.kr/Inputs`;
        const postPayload = {
          lciItemId: Number(lciItemId),
          companyCode: companyCode,
          year: Number(year),
          month: Number(month),
          amount: Number(amount),
        };
  
        try {
          await axios.post(postUrl, postPayload);
        } catch (postError) {
          console.error('POST 요청 중 오류 발생:', postError);
        }
      }
  
      fetchData(selectedCompany, selectedYear); 
    } catch (error) {
      console.error('데이터 등록 중 오류 발생:', error);
    }
  };

  const columns: ColumnDef<Input>[] = [
    { accessorKey: 'inputType', header: '항목' },
    { accessorKey: 'unit', header: '단위' },
    { accessorKey: 'year', header: () => <div style={{ textAlign: 'right' }}>연도</div> },
    ...(['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'] as const).map((month) => ({
      accessorKey: month,
      header: () => <div style={{ textAlign: 'right' }}>{month}</div>,
      cell: (info: CellContext<Input, number | undefined>) => renderCellContent(info), 
    })) as ColumnDef<Input>[], 
  ];
  
  const table = useReactTable<Input>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant='h5'gutterBottom style={{  marginBottom: '10px' }}>
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
      {/* Guidelines Section */}
        <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9', marginBottom: '20px' }}>
          <Typography sx={{ fontSize:'20px', fontWeight:'bold'}} gutterBottom>
            투입물 입력 방법
          </Typography>
          <Typography variant="body2" paragraph>
          <strong>● 전력 사용량 </strong><br />
            - 한전 고지서에 기입된 [kWh] 단위의 사용량을 기재해 주세요.<br />
            - 재활용 공장동과 사무동이 별도로 관리되고 있다면 공장동만 입력해주세요.
          </Typography>
          <Typography
            variant="body2"
            paragraph
            dangerouslySetInnerHTML={{
              __html: `
                <strong>● 경유 및 등유</strong> <br />
                - 재활용 공정 내 사용되는 연료에 대해 [L] 단위의 사용량을 기재해 주세요.<br />
                <span style="color: red;">- 지게차 경유 사용량은 제외해주세요.</span>
              `,
            }}
          />
          <Typography variant="body2" paragraph>
          <strong>● 상수 및 공업용수</strong> <br />
            - 외부에서 투입되는 상수, 공업용수에 대해 [㎥] 단위의 사용량을 기재해 주세요.<br />
            - 재활용 공정에 사용하는 양만 기입해주세요.<br />
            - 따로 외부에서 투입하지 않고 내부에서 순환하여 사용하는 경우에는 기재하지 마세요. (예시 : 세탁기 평형수 등)
          </Typography>
        </Box>
      {error && (
        <Typography variant="body1" color="error" style={{ marginBottom: '20px' }}>
          {error}
        </Typography>
      )}
      <TableContainer
        component={Paper}
        style={{ maxHeight: 545, overflowY: 'auto' }}
        className="custom-scrollbar custom-table"
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
                  조회하여 주십시오.
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
        <Typography
          id="modal-modal-title"
          variant="h5"
          component="h2"
          sx={{ marginBottom: 2, fontWeight: 'bold' }}
        >
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
                {/* 가이드 메시지 추가 */}
                <Typography
                  variant="body2"
                  color="textSecondary"
                  style={{ marginTop: '10px', marginLeft: '5px', color: 'black'}}
                  dangerouslySetInnerHTML={{ __html: guideMessage }}
                />
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
                label={amountLabel} 
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
              뒤로
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