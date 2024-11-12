import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../../ComponentBox/UseCompany';
import EditableCell from '../../../ComponentBox/EditableCell';
// import numeral from 'numeral';
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
  Modal,
  Box,
  TextField,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import * as XLSX from 'xlsx';

type FacilityOpTime = {
  companyCode: string;
  facilityId: number;
  facilityName: string;
  year: number;
  ids: number[];
  monthlyOpTime: number[];
};

type Facility = {
  id: number;
  name: string;
  capacity: number;
};

type Input = {
  facilityId: number;
  facilityName: string;
  capacity: number;
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

const style = {
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

export function Ad_UseFacility() {
  const [data, setData] = useState<Input[]>([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(6), (val, index) => currentYear - index);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [tempSelectedYear, setTempSelectedYear] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [tempSelectedCompany, setTempSelectedCompany] = useState<Company | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [newInput, setNewInput] = useState({
    facilityId: '',
    year: '',
    month: 1,
    opTime: '',
  });

  const fetchFacilities = async (companyCode: string): Promise<Facility[]> => {
    const response = await axios.get(`https://lcaapi.acess.co.kr/Facilities?companyCode=${companyCode}`);
    return response.data.facilities;
  };
  
  const fetchData = useCallback(async (company: Company | null, year: string) => {
    if (!company) {
      setData([]);
      setLoading(false);
      return;
    }

    if (!year) {
      setError('연도를 선택해 주세요.');
      setLoading(false);
      return;
    }
  
    setError(null);
    setLoading(true);
    try {
      const facilities = await fetchFacilities(company.code);
      setFacilities(facilities); 
  
      let url = `https://lcaapi.acess.co.kr/FacilityOpTimes?companyCode=${company.code}`;
      if (year) {
        url += `&year=${year}`;
      }
  
      const response = await axios.get(url);
      const apiResponse: FacilityOpTime[] = response.data;
  
      const formattedData: Input[] = apiResponse.map((item) => {
        const facility = facilities.find((f) => f.id === item.facilityId);
        return {
          facilityId: item.facilityId,
          facilityName: `${item.facilityId}_${item.facilityName}`,  // 수정된 부분
          capacity: facility ? facility.capacity : 0,
          year: item.year,
          '1월': item.monthlyOpTime[0],
          '2월': item.monthlyOpTime[1],
          '3월': item.monthlyOpTime[2],
          '4월': item.monthlyOpTime[3],
          '5월': item.monthlyOpTime[4],
          '6월': item.monthlyOpTime[5],
          '7월': item.monthlyOpTime[6],
          '8월': item.monthlyOpTime[7],
          '9월': item.monthlyOpTime[8],
          '10월': item.monthlyOpTime[9],
          '11월': item.monthlyOpTime[10],
          '12월': item.monthlyOpTime[11],
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
  }, [selectedCompany, selectedYear, fetchData]);

  const handleFetchData = () => {
    setData([]);
    setLoading(true);
    setSelectedCompany(tempSelectedCompany);
    setSelectedYear(tempSelectedYear);
    fetchData(tempSelectedCompany, tempSelectedYear);
  };

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setTempSelectedYear(event.target.value);
  };

  const handleCompanyChange = (company: Company | null) => {
    setTempSelectedCompany(company);
  };

  const handleOpen = () => {
    setNewInput(prev => ({ ...prev, facilityId: '', year: selectedYear, month: 1, opTime: '' }));
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

  const handleSave = async (facilityId: number, year: number, month: string, newValue: number) => {
    try {
      const monthIndex = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'].indexOf(month) + 1;
      await axios.put(`https://lcaapi.acess.co.kr/FacilityOpTimes/${facilityId}`, {
        year,
        month: monthIndex,
        opTime: newValue,
      });
      if (selectedCompany && selectedYear) {
        fetchData(selectedCompany, selectedYear); 
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const { facilityId, year, month, opTime } = newInput;
  
      const checkUrl = `https://lcaapi.acess.co.kr/FacilityOpTimes/Exist?facilityId=${facilityId}&year=${year}&month=${month}`;
  
      const checkResponse = await axios.get(checkUrl);
      const exists = checkResponse.data.isExist;
  
      if (exists) {
        // If the data exists, update it
        const updateUrl = `https://lcaapi.acess.co.kr/FacilityOpTimes/${checkResponse.data.facilityOpTime.id}`;
        const updatePayload = {
          opTime: Number(opTime),
        };
  
        await axios.put(updateUrl, updatePayload);
      } else {
        // If the data does not exist, create a new record
        const createUrl = 'https://lcaapi.acess.co.kr/FacilityOpTimes';
        const createPayload = {
          facilityId: Number(facilityId),
          year: Number(year),
          month: Number(month),
          opTime: Number(opTime),
        };
  
        await axios.post(createUrl, createPayload);
      }
  
      // Closing modal after successful operation
      handleClose();
  
      // Re-fetch data to update the UI
      if (selectedCompany && selectedYear) {
        fetchData(selectedCompany, selectedYear);
      }
    } catch (error) {
      console.error('Error occurred during submission:', error);
  
      // Check if the error is an Axios error for more detailed logging
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error('General error details:', error.message);
      }
    }
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, '설비가동시간.xlsx');
  };

  const columns: ColumnDef<Input>[] = [
    { accessorKey: 'facilityName', header: '설비명' },
    { accessorKey: 'capacity', header: () => <div style={{ textAlign: 'center' }}>용량(KW)</div> },
    { accessorKey: 'year', header: () => <div style={{ textAlign: 'center' }}>연도</div> },
    ...['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'].map((month) => ({
      accessorKey: month,
      header: () => <div style={{ textAlign: 'center' }}>{`${month} (시간/월)`}</div>,  
      cell: (info: CellContext<Input, number>) => (
        <EditableCell
          value={info.getValue() as number}
          facilityId={info.row.original.facilityId}
          month={month}
          year={info.row.original.year as number}
          onSave={(newValue) => handleSave(info.row.original.facilityId, info.row.original.year as number, month, newValue)}
        />
      ),
    })),
  ];

  const table = useReactTable<Input>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        설비 가동시간 관리
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
          disabled={!tempSelectedYear}
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
          가동시간 등록/수정
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
                          zIndex: 1,
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
                            textAlign: ['capacity' , 'year' , '1월' , '2월' , '3월' , '4월' , '5월' , '6월' , '7월' , '8월' ,'9월' , '10월' , '11월' , '12월'].includes(cell.column.id) ? 'right' : 'left',
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
            설비 가동시간 등록
          </Typography>
          <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel>설비</InputLabel>
              <Select
                value={newInput.facilityId}
                onChange={(e) => handleSelectChange(e as SelectChangeEvent<number>, 'facilityId')}
                label="설비"
              >
                {facilities.map((facility) => (
                  <MenuItem key={facility.id} value={facility.id}>
                    {`${facility.id}_${facility.name}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" margin="normal">
                <InputLabel>연도</InputLabel>
                <Select
                  value={newInput.year}
                  onChange={(e) => handleSelectChange(e as SelectChangeEvent<number>, 'year')}
                  label="연도"
                  MenuProps={{ PaperProps: { style: { maxHeight: 200 } } }}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
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
              name="opTime"
              label="가동시간"
              variant="outlined"
              type="number"
              fullWidth
              value={newInput.opTime}
              onChange={handleInputChange}
              InputProps={{
                inputProps: { 
                  style: { MozAppearance: 'textfield' }, 
                },
                sx: {
                  '& input[type=number]': {
                    MozAppearance: 'textfield', 
                  },
                  '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                    WebkitAppearance: 'none', 
                    margin: 0,
                  },
                },
              }}
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