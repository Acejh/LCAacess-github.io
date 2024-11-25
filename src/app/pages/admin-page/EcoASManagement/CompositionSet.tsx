import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import numeral from 'numeral';
import { CellContext } from '@tanstack/react-table';
import { SelectChangeEvent } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import '../../CSS/SCbar.css';
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
  Grid,
  Chip,
} from '@mui/material';

type Company = {
  id: number;
  code: string;
  name: string;
};

type ApiResponse = {
  list: {
    id: number;
    code: string;
    name: string;
  }[];
};
type CompositionData = {
  componentType: string; 
  componentName: string;
  [key: string]: number | string; 
};

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const cellmodalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1200,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

export function CompositionSet() {
  const [data, setData] = useState<CompositionData[]>([]);
  const [year, setYear] = useState('');         
  const [selectedYear, setSelectedYear] = useState(''); 
  const [uploadModalOpen, setUploadModalOpen] = useState(false); // 업로드 모달 상태
  const [uploading, setUploading] = useState(false); // 업로드 진행 상태
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // 선택한 파일
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [selectedYearModal, setSelectedYearModal] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [columns, setColumns] = useState<ColumnDef<CompositionData>[]>([
    { accessorKey: 'componentType', header: '구분' },
    { accessorKey: 'componentName', header: '구성품' },
  ]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
  });

  const item1Ref = useRef<HTMLTableCellElement>(null);
  const item2Ref = useRef<HTMLTableCellElement>(null);

  const [leftOffsets, setLeftOffsets] = useState({
    item2: 0,
  });

  const fetchCompanies = async () => {
    try {
      const response = await axios.get<ApiResponse>('https://lcaapi.acess.co.kr/Companies');
      const fetchedCompanies = response.data.list.map((company) => ({
        id: company.id,
        code: company.code,
        name: company.name,
      }));
      setCompanies(fetchedCompanies);
    } catch (error) {
      console.error('업체 데이터를 가져오는 중 오류 발생:', error);
    }
  };

  const fetchData = useCallback(async () => {
    if (!year) {
      setData([]);
      setLoading(false);
      return;
    }
  
    setLoading(true);
  
    try {
      const url = `https://lcaapi.acess.co.kr/Compositions?Year=${year}`;
      const response = await axios.get(url);
      const { columns: productColumns = [], list = [] } = response.data;
  
      if (!productColumns.length || !list.length) {
        setColumns([
          { accessorKey: 'componentType', header: '구분' },
          { accessorKey: 'componentName', header: '구성품' },
        ]);
        setData([]);
        setLoading(false);
        return;
      }
  
      const dynamicColumns = productColumns.map((product: string) => ({
        accessorKey: product,
        header: () => <div style={{ textAlign: 'center' }}>{product}</div>,
        cell: (info: CellContext<CompositionData, unknown>) =>
          numeral(info.getValue() as number * 100).format('0,0.00000') + '%',
      }));
  
      // 데이터 변환 및 isPlastic 포함
      const transformedData = list.map((item: {
        componentType: string;
        componentName: string;
        isPlastic: boolean;
        compositions: {
          itemName: string;
          percentage: number;
        }[];
      }) => {
        const rowData: { [key: string]: number | string | boolean } = {
          componentType: item.componentType,
          componentName: item.componentName,
          isPlastic: item.isPlastic, // isPlastic 추가
        };
        item.compositions.forEach((composition) => {
          rowData[composition.itemName] = composition.percentage;
        });
        return rowData;
      });
  
      setColumns([
        { accessorKey: 'componentType', header: '구분' },
        { accessorKey: 'componentName', header: '구성품' },
        ...dynamicColumns,
      ]);
      setData(transformedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    if (hasSearched) {
      fetchData();
    }
  }, [hasSearched, fetchData]); 

  useEffect(() => {
    const updateOffsets = () => {
      const item1Width = item1Ref.current?.offsetWidth || 0;
      setLeftOffsets({
        item2: item1Width,
      });
    };
    updateOffsets();
    window.addEventListener('resize', updateOffsets);
    return () => {
      window.removeEventListener('resize', updateOffsets);
    };
  }, [data]);

  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get(`https://lcaapi.acess.co.kr/Compositions/export?year=${year}`, {
        responseType: 'blob', 
      });
  
      // Content-Disposition에서 filename 추출
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download.xlsx'; 
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+?)($|;|\s)/);
        if (filenameMatch?.[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        } else {
          const simpleFilenameMatch = contentDisposition.match(/filename="?(.+?)($|;|\s)"/);
          if (simpleFilenameMatch?.[1]) {
            filename = simpleFilenameMatch[1];
          }
        }
      }
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a'); 
      link.href = url;
    
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
    
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
    }
  };

  // 파일 업로드 처리
  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('uploadFile', selectedFile);

    try {
      await axios.post('https://lcaapi.acess.co.kr/Compositions/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('파일이 성공적으로 업로드되었습니다.');
      setUploadModalOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      alert('파일 업로드에 실패하였습니다.');
    } finally {
      setUploading(false);
    }
  };

  // 엑셀 업로드 모달 열기
  const handleUploadModalOpen = () => {
    setUploadModalOpen(true);
  };

  // 엑셀 업로드 모달 닫기
  const handleUploadModalClose = () => {
    setUploadModalOpen(false);
    setSelectedFile(null);
  };

  const handleCellClick = (componentName: string) => {
    setSelectedComponent(componentName);
    setSelectedYearModal(selectedYear);
    fetchCompanies(); // API 호출하여 업체 목록 가져오기
    setModalOpen(true);
  };

  const handleCompanyToggle = (companyId: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(companyId)
        ? prev.filter((id) => id !== companyId)
        : [...prev, companyId]
    );
  };
  
  const handleRegister = async () => {
    try {
      const payload = {
        year: Number(selectedYearModal), // 연도
        lciItemName: selectedComponent, // 구성품
        companyCodes: companies
          .filter((company) => selectedCompanies.includes(company.id.toString()))
          .map((company) => company.code), // 선택된 회사의 코드
      };
  
      await axios.post('https://lcaapi.acess.co.kr/Compositions/CompanyPlastic', payload);
  
      alert('등록이 완료되었습니다.');
      setModalOpen(false); // 모달 닫기
      setSelectedCompanies([]); // 선택 초기화
    } catch (error) {
      console.error('등록 중 오류 발생:', error);
      alert('등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleSearch = () => {
    setYear(selectedYear);  
    setHasSearched(true);
    setInitialLoad(false);
    fetchData(); 
  };

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setSelectedYear(event.target.value as string);  
  };

  const table = useReactTable<CompositionData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        출고 구성비율 관리
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
          {Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()).map(year => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px'}}
          onClick={handleSearch}
          disabled={!selectedYear}  
        >
          조회
        </Button>
        <Button
          variant="contained"
          color="secondary"
          style={{ height: '35px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleDownloadExcel}
          disabled={!selectedYear}  
        >
          엑셀 다운로드
        </Button>
        <Button
          variant="contained"
          color="primary"
          style={{ height: '35px', marginLeft: '10px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleUploadModalOpen}
        >
          엑셀 업로드
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
                <TableCell colSpan={15} style={{ textAlign: 'center' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            </TableBody>
          ) : (
            <>
              <TableHead>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableCell 
                        key={header.id} 
                        ref={
                          header.column.id === 'componentType'
                            ? item1Ref
                            : header.column.id === 'componentName'
                            ? item2Ref
                            : undefined
                        }
                        style={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          position: 'sticky', 
                          top: -1, 
                          left: 
                            header.column.id === 'componentType'
                              ? 0
                              : header.column.id === 'componentName'
                              ? `${leftOffsets.item2}px` 
                              : undefined,
                          zIndex: ['componentType', 'componentName'].includes(header.column.id) ? 3 : 2,
                          backgroundColor: '#cfcfcf', 
                        }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {!hasSearched && initialLoad ? (
                  <TableRow>
                    <TableCell colSpan={15} style={{ textAlign: 'center', color: 'red' }}>
                      조회하여 주십시오.
                    </TableCell>
                  </TableRow>
                ) : loading ? (
                  <TableRow>
                    <TableCell colSpan={15} style={{ textAlign: 'center' }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      const isPlastic = row.original.isPlastic; // isPlastic 값 가져오기
                      const isComponentNameCell = cell.column.id === 'componentName';
                      return (
                        <TableCell
                          key={cell.id}
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textAlign: isComponentNameCell ? 'left' : 'right',
                            cursor: isPlastic && isComponentNameCell ? 'pointer' : 'default',
                            color: isPlastic && isComponentNameCell ? '#6c9fff' : undefined,
                          }}
                          onClick={() => {
                            if (isPlastic && isComponentNameCell) {
                              handleCellClick(cell.getValue() as string);
                            }
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={15} style={{ textAlign: 'center', color: 'red' }}>
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      </TableContainer>

       {/* 엑셀 업로드 */}
      <Modal
        open={uploadModalOpen}
        onClose={handleUploadModalClose}
        aria-labelledby="upload-modal-title"
        aria-describedby="upload-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="upload-modal-title" variant="h6" component="h2">
            엑셀 파일 업로드
          </Typography>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #ddd',
              padding: '20px',
              textAlign: 'center',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            <input {...getInputProps()} />
            {selectedFile ? (
              <Typography>{selectedFile.name}</Typography>
            ) : (
              <Typography>파일을 드래그하거나 클릭하여 선택하세요.</Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
            <Button onClick={handleUploadModalClose} color="secondary">
              취소
            </Button>
            <Button
              onClick={handleFileUpload}
              variant="contained"
              color="primary"
              style={{ marginLeft: '10px' }}
              disabled={uploading || !selectedFile}
            >
              {uploading ? <CircularProgress size={20} /> : '업로드'}
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={cellmodalStyle}>
          <Typography variant="h6" gutterBottom>
            구성품 정보
          </Typography>
          <Typography>연도: {selectedYearModal}</Typography>
          <Typography>구성품: {selectedComponent}</Typography>

          <Typography sx={{ mt: 2 }}>업체 선택</Typography>
          <Grid container spacing={1}>
            {companies.map((company) => (
              <Grid item key={company.id}>
                <Chip
                  label={`${company.name} (${company.code})`} // Chip에 이름과 코드 표시
                  onClick={() => handleCompanyToggle(company.id.toString())}
                  sx={{
                    backgroundColor: selectedCompanies.includes(company.id.toString()) ? '#1976d2' : '#e0e0e0',
                    color: selectedCompanies.includes(company.id.toString()) ? '#fff' : '#000',
                    cursor: 'pointer',
                  }}
                />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button onClick={() => setModalOpen(false)} color="secondary" sx={{ marginRight: 2 }}>
              취소
            </Button>
            <Button onClick={handleRegister} variant="contained" color="primary">
              등록
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}