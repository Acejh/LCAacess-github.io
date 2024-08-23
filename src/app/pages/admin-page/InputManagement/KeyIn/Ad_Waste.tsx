import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../../ComponentBox/UseCompany';
import UseProduct from '../../../ComponentBox/UseProduct';
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
  Modal,
  Box,
  TextField,
  Grid,
  IconButton,
  Autocomplete,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import * as XLSX from 'xlsx';

type WasteCategory = {
  id: number;
  wasteGroup: string;
  name: string;
};

type Waste = {
  id: number;
  title: string;
};

type WasteItem = {
  categoryCode: string;
  categoryName: string;
  midItemCode: string;
  midItemName: string;
  itemCode: string;
  itemName: string;
  wasteItemPresence: Record<string, boolean>;
};

type TableData = {
  categoryName: string;
  itemName: string;
  [key: string]: string | boolean;
};

const columns: ColumnDef<TableData>[] = [
  { accessorKey: 'categoryName', header: '품목군' },
  { accessorKey: 'itemName', header: '제품명' },
];

const stickyHeaderStyle = () => ({
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden' as const,
  textOverflow: 'ellipsis' as const,
  position: 'sticky' as const,
  top: 0,
  backgroundColor: '#cfcfcf',
  zIndex: 1,
});

const stickyHeaderStyle2 = () => ({
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden' as const,
  textOverflow: 'ellipsis' as const,
  position: 'sticky' as const,
  top: 0,
  backgroundColor: '#c0c0c0',
  zIndex: 1,
});

const modalStyle = {
  position: 'absolute' as const,
  top: '50%' as const,
  left: '50%' as const,
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const modalStyle2 = {
  position: 'absolute' as const,
  top: '50%' as const,
  left: '50%' as const,
  transform: 'translate(-50%, -50%)',
  width: 1400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export function Ad_Waste() {
  const [data, setData] = useState<TableData[]>([]);
  const [wasteCategories, setWasteCategories] = useState<WasteCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [tempSelectedCompany, setTempSelectedCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchDataTrigger, setFetchDataTrigger] = useState(false);
  const [open, setOpen] = useState(false);
  const [wasteModalOpen, setWasteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteWasteId, setDeleteWasteId] = useState<number | null>(null);
  const [newWaste, setNewWaste] = useState({ name: '', wasteGroup: '', companyCode: '', items: [] as string[] });
  const [editWaste, setEditWaste] = useState({ id: '', name: '', wasteGroup: '', companyCode: '', items: [] as string[] });
  const [wastes, setWastes] = useState<Waste[]>([]);
  const [selectedWasteId, setSelectedWasteId] = useState<number | null>(null);

  const fetchWastes = useCallback(async () => {
    try {
      const response = await axios.get('https://lcaapi.acess.co.kr/Wastes/');
      setWastes(response.data);
    } catch (error) {
      console.error('폐기물 목록을 불러오는데 실패했습니다:', error);
    }
  }, []);
  
  useEffect(() => {
    fetchWastes();
  }, [fetchWastes]);

  const fetchData = useCallback(async (companyCode: string) => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await axios.get(`https://lcaapi.acess.co.kr/WasteItems?companyCode=${companyCode}`);
      const wasteCategoriesData = response.data.wasteItems;
      setWasteCategories(wasteCategoriesData);
  
      const tableData = response.data.itemWasteMatrix.map((item: WasteItem) => {
        const row: TableData = {
          categoryName: item.categoryName,
          itemName: item.itemName,
        };
  
        wasteCategoriesData.forEach((wasteCategory: WasteCategory) => {
          row[wasteCategory.name] = item.wasteItemPresence[wasteCategory.id] ? 'O' : 'X';
        });
        return row;
      });
  
      setData(tableData);
  
      if (tableData.length === 0) {
        setError('데이터가 존재하지 않습니다. 데이터를 추가해주시길 바랍니다');
      }
    } catch (error) {
      console.error('데이터를 불러오는데 실패했습니다:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchDataTrigger && tempSelectedCompany) { 
      fetchData(tempSelectedCompany.code);
      setFetchDataTrigger(false); 
    }
  }, [fetchDataTrigger, tempSelectedCompany, fetchData]);

  const handleCompanyChange = (company: Company | null) => {
    setTempSelectedCompany(company);
    setFetchDataTrigger(false); 
  };

  const handleFetchData = () => {
    if (tempSelectedCompany) { 
      setSelectedCompany(tempSelectedCompany); 
      setFetchDataTrigger(true); 
    } else {
      setError('사업회사를 선택해주세요.');
    }
  };

  const handleProductChange = (updatedSelectedProducts: string[]) => {
    setNewWaste(prev => ({ ...prev, items: updatedSelectedProducts }));
  };

  const handleEditProductChange = (updatedSelectedProducts: string[]) => {
    setEditWaste(prev => ({ ...prev, items: updatedSelectedProducts }));
  };

  const handleOpen = () => {
    if (selectedCompany) {
      setNewWaste({ name: '', wasteGroup: '', companyCode: selectedCompany.code, items: [] });
      setOpen(true);
    } else {
      setError('사업회사를 선택해주세요.');
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleWasteModalOpen = () => {
    if (selectedCompany) {
      setWasteModalOpen(true);
    } else {
      setError('사업회사를 선택해주세요.');
    }
  };

  const handleWasteModalClose = () => {
    setWasteModalOpen(false);
  };

  const handleEditModalOpen = async (wasteCategory: WasteCategory) => {
    try {
      const response = await axios.get(`https://lcaapi.acess.co.kr/WasteItems/${wasteCategory.id}`);
      const wasteCategoryData = response.data;
      setEditWaste({
        id: wasteCategory.id.toString(),
        name: wasteCategoryData.name,
        wasteGroup: wasteCategoryData.wasteGroup.toString(),
        companyCode: selectedCompany?.code || '',
        items: wasteCategoryData.items || []
      });
      setSelectedWasteId(wasteCategoryData.id);
      setEditModalOpen(true);
    } catch (error) {
      console.error('폐기물 데이터를 불러오는데 실패했습니다:', error);
    }
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
  };

  const handleDeleteModalOpen = (wasteId: number) => {
    setDeleteWasteId(wasteId);
    setDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewWaste(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditWaste(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        companyCode: selectedCompany?.code,
        wasteId: selectedWasteId,
        name: newWaste.name,
        items: newWaste.items.map((itemCode) => itemCode),
      };
      await axios.post('https://lcaapi.acess.co.kr/WasteItems', payload); 
      setOpen(false);
      if (selectedCompany) {
        fetchData(selectedCompany.code);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('폐기물 등록 중 에러 발생:', error.response ? error.response.data : error.message); 
      } else {
        console.error('폐기물 등록 중 에러 발생:', error);
      }
    }
  };

  const handleEditSubmit = async () => {
    try {
      const payload = {
        wasteId: selectedWasteId,
        name: editWaste.name,
        items: editWaste.items.map((itemCode) => itemCode),
      };
      await axios.put(`https://lcaapi.acess.co.kr/WasteItems/${editWaste.id}`, payload);
      setEditModalOpen(false);
      if (selectedCompany) {
        fetchData(selectedCompany.code);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('폐기물 수정 중 에러 발생:', error.response ? error.response.data : error.message); 
      } else {
        console.error('폐기물 수정 중 에러 발생:', error);
      }
    }
  };
  

  const handleDeleteWaste = async () => {
    if (deleteWasteId !== null) {
      try {
        await axios.delete(`https://lcaapi.acess.co.kr/WasteItems/${deleteWasteId}`);
        setDeleteModalOpen(false);
        if (selectedCompany) {
          fetchData(selectedCompany.code);
        }
      } catch (error) {
        console.error('폐기물 삭제 중 에러 발생:', error);
      }
    }
  };

  // 엑셀 다운로드
  const handleDownloadExcel = () => {
    const tableData = table.getRowModel().rows.map(row => row.original);
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, '폐기물 품목 관리.xlsx');
  };

  // 동적으로 columns 설정
  const dynamicColumns: ColumnDef<TableData>[] = [
    ...columns,
    ...wasteCategories.map(wasteCategory => ({
      accessorKey: wasteCategory.name,
      header: `${wasteCategory.name} (${wasteCategory.wasteGroup})`,
    })),
  ];

  const table = useReactTable({
    data,
    columns: dynamicColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        폐기물 품목 관리
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        style={{ height: '35px', marginBottom: '20px', padding: '0 10px', fontSize: '14px', display: 'none' }}
        onClick={handleDownloadExcel}
      >
        엑셀 다운로드
      </Button>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <UseCompany onCompanyChange={handleCompanyChange} showAllOption={false}/>
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
          style={{ height: '35px', marginLeft: '20px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleWasteModalOpen}
          disabled={!selectedCompany}
        >
          폐기물 관리
        </Button>
      </div>
      {error && (
        <Typography variant="body1" color="error" style={{ marginBottom: '20px' }}>
          {error}
        </Typography>
      )}
      <TableContainer component={Paper} style={{ maxHeight: 545, overflowY: 'auto' }}>
        <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2} style={{ ...stickyHeaderStyle2(), textAlign: 'center' }}>폐기물 그룹 →</TableCell>
            {wasteCategories.map(wasteCategory => (
              <TableCell key={wasteCategory.id} colSpan={1} style={{ ...stickyHeaderStyle2(), textAlign: 'center' }}>{wasteCategory.wasteGroup}</TableCell> 
            ))}
          </TableRow>
          <TableRow>
            <TableCell style={stickyHeaderStyle()}>품목군</TableCell>
            <TableCell style={stickyHeaderStyle()}>제품명</TableCell>
            {wasteCategories.map(wasteCategory => (
              <TableCell key={wasteCategory.id} style={{ ...stickyHeaderStyle(), textAlign: 'center' }}>{wasteCategory.name}</TableCell>
            ))}
          </TableRow>
        </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={wasteCategories.length + 2} style={{ textAlign: 'center' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : selectedCompany ? (
              wasteCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={wasteCategories.length + 2} style={{ textAlign: 'center', color: 'red' }}>
                    데이터가 없습니다.등록하여 주십시오.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        textAlign: ['categoryName' ,'itemName' ].includes(cell.column.id) ? 'left' : 'center',}}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )
            ) : (
              <TableRow>
                <TableCell colSpan={wasteCategories.length + 2} style={{ textAlign: 'center', color: 'red' }}>
                  사업회원을 선택하여 조회하십시오.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal open={wasteModalOpen} onClose={handleWasteModalClose} aria-labelledby="waste-modal-title" aria-describedby="waste-modal-description">
        <Box sx={modalStyle}>
          <Typography id="waste-modal-title" variant="h6" component="h2" style={{ marginBottom: 20 }}>
            폐기물 관리
          </Typography>
          <TableContainer component={Paper} style={{ maxHeight: 400, overflowY: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell style={stickyHeaderStyle()}>폐기물명</TableCell>
                  <TableCell style={stickyHeaderStyle()}>폐기물 그룹</TableCell>
                  <TableCell style={stickyHeaderStyle()}>수정/삭제</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {wasteCategories.map(wasteCategory => (
                  <TableRow key={wasteCategory.id}>
                    <TableCell>{wasteCategory.name}</TableCell>
                    <TableCell>{wasteCategory.wasteGroup}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditModalOpen(wasteCategory)}>
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteModalOpen(wasteCategory.id)}>
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button variant="contained" color="secondary" onClick={handleWasteModalClose} style={{ marginTop: '20px'}}>
            뒤로
          </Button>
          <Button variant="contained" color="primary" onClick={handleOpen} style={{ marginTop: '20px' , marginLeft: '10px'}}>
            폐기물 등록
          </Button>
        </Box>
      </Modal>
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
        <Box sx={modalStyle2}>
          <Typography id="modal-title" variant="h6" component="h2" style={{ marginBottom: 20 }}>
            폐기물 등록
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
                name="name"
                label="폐기물명"
                variant="outlined"
                fullWidth
                value={newWaste.name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={wastes}
                getOptionLabel={(option) => option.title}
                onChange={(event, newValue) => {
                  setSelectedWasteId(newValue ? newValue.id : null);
                }}
                renderInput={(params) => <TextField {...params} label="폐기물 그룹" variant="outlined" />}
              />
            </Grid>
            <Grid item xs={12}>
              <UseProduct
                onProductChange={handleProductChange}
                selectedProducts={newWaste.items}
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
      <Modal open={editModalOpen} onClose={handleEditModalClose} aria-labelledby="edit-modal-title" aria-describedby="edit-modal-description">
        <Box sx={modalStyle2}>
          <Typography id="edit-modal-title" variant="h6" component="h2" style={{ marginBottom: 20 }}>
            폐기물 수정
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
                name="name"
                label="폐기물명"
                variant="outlined"
                fullWidth
                value={editWaste.name}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                options={wastes}
                getOptionLabel={(option) => option.title}
                value={wastes.find((waste) => waste.id === selectedWasteId) || null}
                onChange={(event, newValue) => {
                  setSelectedWasteId(newValue ? newValue.id : null);
                }}
                renderInput={(params) => <TextField {...params} label="폐기물 그룹" variant="outlined" />}
              />
            </Grid>
            <Grid item xs={12}>
              <UseProduct
                onProductChange={handleEditProductChange}
                selectedProducts={editWaste.items}
              />
            </Grid>
          </Grid>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="contained" color="secondary" onClick={handleEditModalClose} style={{ marginRight: '10px' }}>
              취소
            </Button>
            <Button variant="contained" color="primary" onClick={handleEditSubmit}>
              수정
            </Button>
          </div>
        </Box>
      </Modal>
      <Modal open={deleteModalOpen} onClose={handleDeleteModalClose} aria-labelledby="delete-modal-title" aria-describedby="delete-modal-description">
        <Box sx={modalStyle}>
          <Typography id="delete-modal-title" variant="h6" component="h2" style={{ marginBottom: 20 }}>
            정말 삭제하시겠습니까?
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
            <Button variant="contained" color="secondary" onClick={handleDeleteModalClose} style={{ marginRight: '10px' }}>
              아니오
            </Button>
            <Button variant="contained" color="primary" onClick={handleDeleteWaste}>
              예
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}