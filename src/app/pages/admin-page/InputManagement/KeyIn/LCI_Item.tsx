import React, { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';  // AxiosError 타입 import
import '../../../CSS/SCbar.css';
import { SelectChangeEvent } from '@mui/material';
import { useDropzone } from 'react-dropzone';
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
  TextField,
  Box,
  InputLabel,
} from '@mui/material';

type LciItem = {
  id: number;
  year: number;
  type: string;
  category: string;
  name: string;
  unit: string;
  gwp: number;
  gwpAlt: number;
};

type LciType = {
  key: string;
  value: string;
};

type LciCategory = {
  [type: string]: {
    key: string;
    value: string;
  }[];
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

export function LCI_Item() {
  const [data, setData] = useState<LciItem[]>([]);
  const [filteredData, setFilteredData] = useState<LciItem[]>([]);
  const [lciTypes, setLciTypes] = useState<{ [key: string]: string }>({});
  const [lciCategories, setLciCategories] = useState<LciCategory>({});
  const [year, setYear] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const [downloading, setDownloading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false); // 업로드 모달 상태
  const [uploading, setUploading] = useState(false); // 업로드 진행 상태
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // 선택한 파일

  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [tempSelectedType, setTempSelectedType] = useState('');
  const [tempSelectedCategory, setTempSelectedCategory] = useState('');

  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // 수정 및 등록 모달 관리
  const [openModal, setOpenModal] = useState(false);
  const [editItem, setEditItem] = useState<LciItem | null>(null);
  const [isEditing, setIsEditing] = useState(false); 

  // 삭제 모달 관리
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);

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

  const fetchLciTypes = async () => {
    try {
      const response = await axios.get<LciType[]>(
        'https://lcaapi.acess.co.kr/LciItems/LciTypes'
      );
      const typesMapping = response.data.reduce((acc, type) => {
        acc[type.key] = type.value;
        return acc;
      }, {} as { [key: string]: string });
      setLciTypes(typesMapping);
    } catch (error) {
      console.error('LCI 타입 데이터 가져오기 오류:', error);
    }
  };

  const fetchLciCategories = async () => {
    try {
      const response = await axios.get<{ lciCategories: LciCategory }>(
        'https://lcaapi.acess.co.kr/LciItems/LciCategories'
      );
      setLciCategories(response.data.lciCategories);
    } catch (error) {
      console.error('LCI 카테고리 데이터 가져오기 오류:', error);
    }
  };

  const fetchData = useCallback(async () => {
    if (!year) return;

    setLoading(true);

    try {
      const url = `https://lcaapi.acess.co.kr/LciItems?year=${year}`;
      const response = await axios.get<LciItem[]>(url);

      setData(response.data);
      setFilteredData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('데이터 가져오기 오류:', error);
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchLciTypes();
    fetchLciCategories();
  }, []);

  useEffect(() => {
    if (hasSearched) {
      fetchData();
    }
  }, [hasSearched, fetchData]);

  useEffect(() => {
    let filtered = data;

    if (selectedType) {
      filtered = filtered.filter(item => item.type === selectedType);
    }

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredData(filtered);
  }, [selectedType, selectedCategory, data]);

  const handleSearch = () => {
    setSelectedType(tempSelectedType);
    setSelectedCategory(tempSelectedCategory);
    setYear(selectedYear);
    setHasSearched(true);
    setInitialLoad(false);
  };

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setSelectedYear(event.target.value as string);
  };

  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    setTempSelectedType(event.target.value as string);
    setTempSelectedCategory('');
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setTempSelectedCategory(event.target.value as string);
  };

  const getCategoryValue = (type: string, categoryKey: string) => {
    const categoryList = lciCategories[type] || [];
    const category = categoryList.find((cat) => cat.key === categoryKey);
    return category ? category.value : categoryKey;
  };

  // 수정 모달을 열고 해당 row 데이터를 불러옴
  const handleEdit = (item: LciItem) => {
    setEditItem(item);
    setIsEditing(true);
    setOpenModal(true);
  };

  // 등록 모달을 열기 위한 함수
  const handleRegister = () => {
    setEditItem({
      id: 0,
      year: new Date().getFullYear(),
      type: '',
      category: '',
      name: '',
      unit: '',
      gwp: 0,
      gwpAlt: 0,
    });
    setIsEditing(false);
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setEditItem(null);
  };

  // PUT 요청을 보내는 함수 (수정)
  const handleSave = async () => {
    if (editItem && isEditing) {
      try {
        const postData = {
          year: editItem.year,
          type: editItem.type,
          category: editItem.category,
          name: editItem.name,
          unit: editItem.unit,
          gwp: editItem.gwp,
          gwpAlt: editItem.gwpAlt,
        };

        await axios.put(`https://lcaapi.acess.co.kr/LciItems/${editItem.id}`, postData);

        // 데이터 업데이트
        await fetchData();
        setOpenModal(false);
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error('수정 실패:', error.response ? error.response.data : error.message);
        } else {
          console.error('수정 실패 (기타 에러):', error);
        }
      }
    }
  };

  // POST 요청을 보내는 함수 (등록)
  const handleRegisterSave = async () => {
    if (editItem && !isEditing) {
      try {
        const postData = {
          year: editItem.year,
          type: editItem.type,
          category: editItem.category,
          name: editItem.name,
          unit: editItem.unit,
          gwp: editItem.gwp,
          gwpAlt: editItem.gwpAlt,
        };

        await axios.post('https://lcaapi.acess.co.kr/LciItems', postData);

        // 데이터 업데이트
        await fetchData();
        setOpenModal(false);
      } catch (error) {
        if (error instanceof AxiosError) {
          console.error('등록 실패 (AxiosError):', error.response ? error.response.data : error.message);
        } else {
          console.error('등록 실패 (기타 에러):', error);
        }
      }
    }
  };

  // 삭제 버튼 클릭 시 처리
  const handleDelete = (id: number) => {
    setDeleteItemId(id);
    setOpenDeleteModal(true);
  };

  // DELETE 요청을 보내는 함수 (삭제)
  const handleDeleteConfirm = async () => {
    if (deleteItemId) {
      try {
        await axios.delete(`https://lcaapi.acess.co.kr/LciItems/${deleteItemId}`);

        // 데이터 업데이트
        await fetchData();
        setOpenDeleteModal(false);
        setDeleteItemId(null);
      } catch (error) {
        console.error('삭제 실패:', error);
      }
    }
  };

  // 삭제 취소
  const handleDeleteCancel = () => {
    setOpenDeleteModal(false);
    setDeleteItemId(null);
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

  // 파일 업로드 처리
  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('uploadFile', selectedFile);

    try {
      await axios.post('https://lcaapi.acess.co.kr/LciItems/import', formData, {
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

  const handleDownloadExcel = async () => {
    if (!year) {
      console.error('회사 또는 연도를 선택해 주세요.');
      return;
    }
  
    setDownloading(true); // 다운로드 시작
  
    try {
      const url = `https://lcaapi.acess.co.kr/LciItems/Export?Year=${year}`;
      
      const response = await axios.get(url, {
        responseType: 'blob',
        timeout: 180000, // 3분 타임아웃 설정
      });
  
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'GTG_결과.xlsx'; // 기본 파일 이름
  
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?UTF-8['"]?''(.+?)['"]?(;|$)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        } else {
          const simpleFilenameMatch = contentDisposition.match(/filename="?(.+?)['"]?(;|$)/);
          if (simpleFilenameMatch && simpleFilenameMatch[1]) {
            filename = simpleFilenameMatch[1];
          }
        }
      }
  
      const blob = new Blob([response.data]);
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('엑셀 파일 다운로드 중 오류 발생:', error);
    } finally {
      setDownloading(false); // 다운로드 완료
    }
  };

  const columns: ColumnDef<LciItem>[] = [
    {
      header: '유형',
      accessorFn: (row) => row.type,
      id: 'type',
      cell: (info) => lciTypes[info.getValue() as string] || info.getValue(),
    },
    {
      header: '연도',
      accessorFn: (row) => row.year,
      id: 'year',
      cell: (info) => lciTypes[info.getValue() as string] || info.getValue(),
    },
    {
      header: '종류',
      accessorFn: (row) => row.category,
      id: 'category',
      cell: (info) => getCategoryValue(info.row.original.type, info.getValue() as string),
    },
    {
      header: '명칭',
      accessorFn: (row) => row.name,
      id: 'name',
    },
    {
      header: '단위',
      accessorFn: (row) => row.unit,
      id: 'unit',
    },
    {
      header: 'GWP\n 재활용 처리',
      accessorFn: (row) => row.gwp,
      id: 'gwp',
    },
    {
      header: 'GWP\n 유가물 재활용 및\n 에너지 회수',
      accessorFn: (row) => row.gwpAlt,
      id: 'gwpAlt',
    },
    // 수정/삭제 컬럼 추가
    {
      header: '수정/삭제',
      id: 'actions',
      cell: ({ row }) => (
        <>
          <Button
            variant="contained"
            color="primary"
            style={{ marginRight: '8px' }}
            onClick={() => handleEdit(row.original)}
          >
            수정
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleDelete(row.original.id)}
          >
            삭제
          </Button>
        </>
      ),
    },
  ];

  const handleInputChange = useCallback((field: keyof LciItem, value: string | number) => {
    setEditItem(prev => prev ? { ...prev, [field]: value } : prev);
  }, []);

  const table = useReactTable<LciItem>({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        LCI 항목 및 GWP 관리
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

        <FormControl style={{ marginRight: '10px' }}>
          <Select
            id="type-select"
            value={tempSelectedType}
            onChange={handleTypeChange}
            displayEmpty
            style={{ width: '150px' }}
            sx={{ height: '45px' }}
          >
            <MenuItem value="">유형(전체)</MenuItem>
            {Object.entries(lciTypes).map(([key, value]) => (
              <MenuItem key={key} value={key}>
                {value}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl style={{ marginRight: '10px' }}>
          <Select
            id="category-select"
            value={tempSelectedCategory}
            onChange={handleCategoryChange}
            displayEmpty
            style={{ width: '150px' }}
            sx={{ height: '45px' }}
            disabled={!tempSelectedType}
          >
            <MenuItem value="">종류(전체)</MenuItem>
            {tempSelectedType &&
              (lciCategories[tempSelectedType] || []).map((category) => (
                <MenuItem key={category.key} value={category.key}>
                  {category.value}
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

        {/* 등록 버튼 */}
        <Button
          variant="contained"
          color="success"
          style={{ height: '35px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleRegister}
          disabled={!hasSearched}
        >
          등록
        </Button>
        {/* 엑셀 다운로드 */}
        <Button
          variant="contained"
          color="secondary"
          style={{ height: '35px', marginLeft: '10px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleDownloadExcel}
          disabled={!year || downloading}  
        >
          {downloading ? '다운로드 중...' : '엑셀 다운로드'}
        </Button>
          {/* 엑셀 업로드 */}
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
        style={{ maxHeight: 545, overflowY: 'auto'}}
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
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell
                        key={header.id}
                        style={{
                          whiteSpace: 'pre-wrap', 
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textAlign: 'center', 
                          backgroundColor: '#cfcfcf',
                          position: 'sticky',
                          top: 0,
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
                {!hasSearched && initialLoad ? (
                  <TableRow>
                    <TableCell colSpan={15} style={{ textAlign: 'center', color: 'red' }}>
                      조회하여 주십시오.
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
                            textAlign: cell.column.id === 'year' ? 'left' : typeof cell.getValue() === 'number' ? 'right' : 'left',
                          }}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
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

      {/* 수정/등록 모달 UI */}
      <Modal
        open={openModal}
        onClose={handleModalClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {isEditing ? '항목 수정' : '항목 등록'}
          </Typography>
          {editItem && (
            <>
              {/* 연도 선택 드롭다운 */}
                <FormControl fullWidth margin="normal">
                  <InputLabel id="year-select-label">연도 선택</InputLabel>
                  <Select
                    labelId="year-select-label"
                    value={editItem.year.toString()}  
                    onChange={(e) => setEditItem({ ...editItem, year: parseInt(e.target.value) })}  
                  >
                    {/* 현재 연도 기준으로 5년간의 연도 목록 생성 */}
                    {Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i)).map((year) => (
                      <MenuItem key={year} value={year.toString()}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

              {/* 유형 선택 드롭다운 */}
              <FormControl fullWidth margin="normal">
                <Select
                  value={editItem.type}
                  onChange={(e) => setEditItem({ ...editItem, type: e.target.value })}
                >
                  {Object.entries(lciTypes).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 종류 선택 드롭다운 */}
              <FormControl fullWidth margin="normal" disabled={!editItem.type}>
                <Select
                  value={editItem.category}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                >
                  {(lciCategories[editItem.type] || []).map((category) => (
                    <MenuItem key={category.key} value={category.key}>
                      {category.value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 명칭, 단위, GWP, 유가물 대체효과 수정 */}
              <TextField
                fullWidth
                margin="normal"
                label="명칭"
                value={editItem.name}
                onChange={(e) => handleInputChange('name', e.target.value)}  
              />
              <TextField
                fullWidth
                margin="normal"
                label="단위"
                value={editItem.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}  
              />
              <TextField
                fullWidth
                margin="normal"
                label="GWP"
                type="number"
                value={editItem.gwp}
                onChange={(e) => handleInputChange('gwp', parseFloat(e.target.value))}  
              />
              <TextField
                fullWidth
                margin="normal"
                label="GWP 유가물 대체효과"
                type="number"
                value={editItem.gwpAlt}
                onChange={(e) => handleInputChange('gwpAlt', parseFloat(e.target.value))}  
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
                <Button onClick={handleModalClose} color="secondary">
                  취소
                </Button>
                <Button
                  onClick={isEditing ? handleSave : handleRegisterSave}
                  variant="contained"
                  color="primary"
                  style={{ marginLeft: '10px' }}
                >
                  {isEditing ? '수정' : '등록'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* 삭제 경고 모달 UI */}
      <Modal
        open={openDeleteModal}
        onClose={handleDeleteCancel}
        aria-labelledby="modal-delete-title"
        aria-describedby="modal-delete-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-delete-title" variant="h6" component="h2">
            삭제하시겠습니까?
          </Typography>
          <Typography sx={{ mt: 2 }}>되돌릴 수 없습니다.</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 2 }}>
            <Button onClick={handleDeleteCancel} color="secondary">
              취소
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              color="error"
              style={{ marginLeft: '10px' }}
            >
              삭제
            </Button>
          </Box>
        </Box>
      </Modal>
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
    </div>
  );
}
