import React, { useState, useEffect, useCallback, } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../../ComponentBox/UseCompany';
import numeral from 'numeral';
import '../../../CSS/SCbar.css';
import { getApiUrl } from '../../../../../main';
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
import * as XLSX from 'xlsx';

type Input = {
  ids: number[]; // 배열로 수정
  inputType: string;
  unit: string;
  year: string | number;
  "1월": number;
  "2월": number;
  "3월": number;
  "4월": number;
  "5월": number;
  "6월": number;
  "7월": number;
  "8월": number;
  "9월": number;
  "10월": number;
  "11월": number;
  "12월": number;
};

type OutputResponse = {
  companyCode: string;
  inputType: string;
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

export function Ad_Effluent() {
  const [data, setData] = useState<Input[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(6), (val, index) => currentYear - index);
  const [tempSelectedCompany, setTempSelectedCompany] = useState<Company | null>(null); 
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [tempSelectedYear, setTempSelectedYear] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editValue, setEditValue] = useState<number | string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [newInput, setNewInput] = useState({
    companyCode: '',
    lciItemId: '',
    year: '2023',
    month: 1,
    amount: '',
  });

  useEffect(() => {
    const fetchAmount = async () => {
      if (!newInput.companyCode || !newInput.year || !newInput.month) {
        // 필수 값이 없으면 초기화
        setNewInput(prevState => ({
          ...prevState,
          amount: '',
        }));
        return;
      }
  
      try {
        const response = await axios.get(
          `${getApiUrl}/Outputs/Water/Exist`,
          {
            params: {
              CompanyCode: newInput.companyCode,
              Year: newInput.year,
              month: newInput.month,
            },
          }
        );
  
        const { isExist, amount } = response.data;
  
        if (isExist) {
          // 값이 존재하면 업데이트
          setNewInput(prevState => ({
            ...prevState,
            amount: amount.toString(),
          }));
        } else {
          // 값이 없으면 0으로 설정
          setNewInput(prevState => ({
            ...prevState,
            amount: '0',
          }));
        }
      } catch (error) {
        console.error('Error fetching amount:', error);
        setNewInput(prevState => ({
          ...prevState,
          amount: '',
        }));
      }
    };
  
    fetchAmount();
  }, [newInput.companyCode, newInput.year, newInput.month]);

  const fetchData = useCallback(async (company: Company | null, year: string) => {
    if (!company) {
      setData([]);
      setLoading(false);
      return;
    }
  
    if (!year) {
      setError("연도를 선택해 주세요.");
      setLoading(false);
      return;
    }
  
    setError(null);
    setLoading(true);
  
    try {
      let url = `${getApiUrl}/Outputs/Water?CompanyCode=${company.code}`;
      if (year) {
        url += `&Year=${year}`;
      }
  
      const response = await axios.get(url);
  
      if (response.status === 404) {
        const errorMessage = response.data?.title || "Data not found";
        throw new Error(errorMessage);
      }
  
      const apiResponse: OutputResponse[] = response.data.outputs;
  
      // 데이터 형식화
      const formattedData: Input[] = apiResponse.map((output: OutputResponse) => ({
        ids: output.ids, // ids 배열 전체 저장
        inputType: "수계배출물",
        unit: output.unit,
        year: output.year,
        "1월": output.monthlyAmounts[0],
        "2월": output.monthlyAmounts[1],
        "3월": output.monthlyAmounts[2],
        "4월": output.monthlyAmounts[3],
        "5월": output.monthlyAmounts[4],
        "6월": output.monthlyAmounts[5],
        "7월": output.monthlyAmounts[6],
        "8월": output.monthlyAmounts[7],
        "9월": output.monthlyAmounts[8],
        "10월": output.monthlyAmounts[9],
        "11월": output.monthlyAmounts[10],
        "12월": output.monthlyAmounts[11],
      }));
  
      setData(formattedData);
    } catch (error: unknown) {
      console.error("Error fetching data:", error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setError("데이터가 존재하지 않습니다. 데이터를 추가해주시길 바랍니다.");
      } else if (error instanceof Error) {
        setError(`데이터를 불러오는데 실패했습니다: ${error.message}`);
      } else {
        setError("데이터를 불러오는데 실패했습니다.");
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

  const handleSaveEdit = async (rowId: string, columnId: string) => {
    if (!editingCell || editValue === null) {
      setEditingCell(null);
      return; // 저장할 데이터가 없으면 종료
    }
  
    const row = table.getRowModel().rows.find((row) => row.id === rowId);
    if (!row) {
      console.error("Row not found for editing:", { rowId, columnId });
      setEditingCell(null);
      return; // 행을 찾지 못하면 종료
    }
  
    const ids = row.original.ids; // 해당 행의 ids 가져오기
    if (!Array.isArray(ids) || ids.length === 0) {
      console.error("No valid ids found for this row:", { rowId, columnId, ids });
      setEditingCell(null);
      return; // 유효한 ids가 없으면 종료
    }
  
    // `columnId`에서 월 번호 추출 (예: "month-1" → 0-based 인덱스)
    const monthIndex = parseInt(columnId.replace("month-", ""), 10) - 1;
  
    const id = ids[monthIndex]; // 해당 월의 ID 가져오기
    if (!id) {
      console.error("No valid ID found for this month:", { rowId, columnId, monthIndex, ids });
      setEditingCell(null);
      return; // ID를 찾지 못하면 종료
    }
  
    try {
      console.log("Editing Cell:", { rowId, columnId });
      console.log("Row Data:", row.original);
      console.log("Selected Month Index:", monthIndex);
      console.log("Selected ID:", id);
      console.log("New Value:", editValue);
  
      // API 요청으로 데이터 업데이트
      await axios.put(`${getApiUrl}/Outputs/Water/${id}`, {
        amount: Number(editValue), // 수정된 값
        month: monthIndex + 1, // 월 정보 (1-based index)
      });
  
      console.log("Data updated successfully");
  
      setEditValue(null);
      setEditingCell(null);
  
      // 데이터 갱신
      if (selectedCompany && selectedYear) {
        fetchData(selectedCompany, selectedYear);
      }
    } catch (error) {
      console.error("Error saving data:", {
        ids,
        columnId,
        amount: Number(editValue),
        error: error instanceof Error ? error.message : error,
      });
    }
  };
  
  const handleCancelEdit = () => {
    setEditValue(null);
    setEditingCell(null); // 수정 모드 취소
  };
  
  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>, rowId: string, columnId: string) => {
    if (event.key === "Enter") {
      handleSaveEdit(rowId, columnId); // Enter 키로 저장
    } else if (event.key === "Escape") {
      handleCancelEdit(); // ESC 키로 취소
    }
  };
  
  const renderCellContent = (cell: CellContext<Input, number | undefined>) => {
    const { id: columnId } = cell.column;
    const { id: rowId } = cell.row;
  
    if (editingCell?.rowId === rowId && editingCell?.columnId === columnId) {
      return (
        <TextField
          value={editValue || ""}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleCancelEdit} // 포커스를 잃으면 취소
          onKeyDown={(e) => handleKeyPress(e, rowId, columnId)} // Enter로 저장, ESC로 취소
          autoFocus
          fullWidth
        />
      );
    }
  
    // 포맷팅된 값을 렌더링
    const formattedValue = cell.getValue() !== undefined ? numeral(cell.getValue()).format("0,0.00") : "";
  
    return (
      <div
        onDoubleClick={() => {
          setEditingCell({ rowId, columnId });
          setEditValue(cell.getValue() ?? ""); // 현재 값을 수정 모드로 설정
        }}
        style={{ cursor: "pointer" }}
      >
        {formattedValue}
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
    setNewInput(prev => ({ ...prev, companyCode: selectedCompany?.code || '', year: selectedYear || '' })); 
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewInput(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<number>, key: string) => {
    setNewInput(prevState => ({
      ...prevState,
      [key]: e.target.value as number,
    }));
  };

  const handleSubmit = async () => {
    try {
      const { companyCode, year, month, amount } = newInput;
      if (!companyCode || !year || !month || !amount) {
        throw new Error("모든 필드를 입력해 주세요.");
      }
  
      // Check if the record exists
      const checkUrl = `${getApiUrl}/Outputs/Water/Exist?companyCode=${companyCode}&year=${year}&month=${month}`;
      const checkResponse = await axios.get(checkUrl);
      const exists = checkResponse.data.isExist;
  
      if (exists) {
        // If the data exists, update it
        const idsUrl = `${getApiUrl}/Outputs/Water?CompanyCode=${companyCode}&Year=${year}`;
        const idsResponse = await axios.get(idsUrl);
        const ids: number[] = idsResponse.data.outputs[0]?.ids || [];
  
        if (ids.length > 0) {
          const id = ids[month - 1]; // Map the month to the correct ID
          if (id) {
            const updateUrl = `${getApiUrl}/Outputs/Water/${id}`;
            await axios.put(updateUrl, {
              companyCode,
              year: Number(year),
              month: Number(month),
              amount: Number(amount),
            });
          } else {
            throw new Error("해당 월의 ID를 찾을 수 없습니다.");
          }
        } else {
          throw new Error("IDs를 가져오는 데 실패했습니다.");
        }
      } else {
        // If the data does not exist, create a new record
        const createUrl = `${getApiUrl}/Outputs/Water`;
        await axios.post(createUrl, {
          companyCode,
          year: Number(year),
          month: Number(month),
          amount: Number(amount),
        });
      }
  
      handleClose();
      fetchData(selectedCompany, selectedYear);
    } catch (error) {
      console.error("데이터 등록 중 오류 발생:", error);
    }
  };

  // 엑셀 다운로드
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, '배출물 정보.xlsx');
  };

  const columns: ColumnDef<Input, unknown>[] = [
    { accessorKey: "inputType", header: "항목", id: "inputType" },
    { accessorKey: "unit", header: "단위", id: "unit" },
    { accessorKey: "year", header: () => <div style={{ textAlign: "right" }}>연도</div>, id: "year" },
    ...(["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"] as const).map((month, index) => ({
      accessorKey: month,
      header: () => <div style={{ textAlign: "right" }}>{month}</div>,
      id: `month-${index + 1}`, 
      cell: (info) => renderCellContent(info as CellContext<Input, number | undefined>), // 타입 캐스팅
    })) as ColumnDef<Input, unknown>[], // 전체 결과 타입 캐스팅
  ];

  const table = useReactTable<Input>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant='h5'gutterBottom style={{ marginBottom: '10px' }}>
        수계배출물 관리
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        style={{ height: '35px', marginBottom: '20px', padding: '0 10px', fontSize: '14px', marginRight: '10px', display: 'none' }}
        onClick={handleDownloadExcel}
      >
        엑셀 다운로드
      </Button>
      
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
          수계배출물 등록/수정
        </Button>
      </div>
      {/* Guidelines Section */}
      <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: '5px', backgroundColor: '#f9f9f9', marginBottom: '20px' }}>
        <Typography sx={{ fontSize:'20px', fontWeight:'bold'}} gutterBottom>
          수계배출물 입력방법
        </Typography>
        <Typography variant="body2" paragraph>
        - 수계배출물을 외부로 배출하는 경우, [㎥] 단위 기반의 월별 배출량을 기재해 주세요.<br/>
        - 외부로 배출하는 경우는 외주처리(차량운송), 하수종말처리장 또는 폐수종말처리장(파이프라인) 등이 있습니다.
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
          <Typography id="modal-modal-title" variant="h5" component="h2" style={{ marginBottom: 20 }}>
            배출물 등록
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
              <TextField
                name="inputType"
                label="항목"
                variant="outlined"
                fullWidth
                value="수계배출물"
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
                label="배출량 (m3)"
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