import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../../ComponentBox/UseCompany';
import UseProduct from '../../../ComponentBox/UseProduct';
import numeral from 'numeral';
import { v4 as uuidv4 } from 'uuid';
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
  Modal,
  Box,
  TextField,
  Grid,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import * as XLSX from 'xlsx';

type Facl = {
  id: number;
  name: string;
  capacity: number;
};

type ItemFacility = {
  categoryCode: string;
  categoryName: string;
  midItemCode: string;
  midItemName: string;
  itemCode: string;
  itemName: string;
  facilityPresence: Record<string, boolean>;
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

export function Ad_Facility() {
  const [data, setData] = useState<TableData[]>([]);
  const [facilities, setFacilities] = useState<Facl[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [tempSelectedCompany, setTempSelectedCompany] = useState<Company | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchDataTrigger, setFetchDataTrigger] = useState(false);
  const [open, setOpen] = useState(false);
  const [facilityModalOpen, setFacilityModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteFacilityId, setDeleteFacilityId] = useState<number | null>(null);
  const [categoryFilters, setCategoryFilters] = useState<Record<string, boolean>>({});
  const [newFacility, setNewFacility] = useState({ name: '', capacity: '', companyCode: '', items: [] as string[] });
  const [editFacility, setEditFacility] = useState({ id: '', name: '', capacity: '', companyCode: '', items: [] as string[] });
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchData = useCallback(async (companyCode: string) => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await axios.get(`https://lcaapi.acess.co.kr/Facilities?companyCode=${companyCode}`);
      const facilitiesData = response.data.facilities;
      setFacilities(facilitiesData);
  
      const tableData = response.data.itemFacilityMatrix.map((item: ItemFacility) => {
        const row: TableData = {
          categoryName: item.categoryName,
          itemName: item.itemName,
        };
  
        facilitiesData.forEach((facility: Facl) => {
          const cleanName = `${facility.id}_${facility.name}`.replace(/\./g, '_');
          row[cleanName] = item.facilityPresence[facility.id] ? 'V' : '-';
        });
  
        return row;
      });
  
      setData(tableData);
  
      const categories = Array.from(new Set(tableData.map((item: TableData) => item.categoryName))) as string[];
        setCategoryFilters(
          categories.reduce<Record<string, boolean>>((acc, category) => {
            acc[category] = true;
            return acc;
          }, {})
        );
    } catch (error) {
      console.error('데이터를 불러오는데 실패했습니다:', error);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFetchData = useCallback(() => {
    if (tempSelectedCompany) {
      setSelectedCompany(tempSelectedCompany);
      setFetchDataTrigger(true);
    } else {
      setError('사업회사를 선택해주세요.');
    }
  }, [tempSelectedCompany, setSelectedCompany, setFetchDataTrigger, setError]);

  const handleCategoryFilterChange = (category: string) => {
    setCategoryFilters((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  //권한 가져오는 useEffect
  useEffect(() => {
    const userInfoString = localStorage.getItem('kt-auth-react-v');
    if (userInfoString) {
      try {
        const parsedData = JSON.parse(userInfoString);
        const userInfo = parsedData?.userInfo; 
        if (userInfo) {
          setUserRole(userInfo.role); 
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const categories = Array.from(new Set(data.map((item: TableData) => item.categoryName))) as string[];
      setCategoryFilters(
        categories.reduce<Record<string, boolean>>((acc, category) => {
          acc[category] = true;
          return acc;
        }, {})
      );
    }
  }, [data]);

  //자동조회 useEffect
  useEffect(() => {
    if (userRole === 'User' && tempSelectedCompany) {
      handleFetchData(); 
    }
  }, [userRole, tempSelectedCompany, handleFetchData]);

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

  // const handleProductChange = (product: Product | null) => {
  //   if (product && !newFacility.items.includes(product.itemCode)) {
  //     setNewFacility(prev => ({ ...prev, items: [...prev.items, product.itemCode] }));
  //   }
  // };

  // const handleEditProductChange = (product: Product | null) => {
  //   if (product && !editFacility.items.includes(product.itemCode)) {
  //     setEditFacility(prev => ({ ...prev, items: [...prev.items, product.itemCode] }));
  //   }
  // };

  const handleOpen = () => {
    if (selectedCompany) {
      setNewFacility({ name: '', capacity: '', companyCode: selectedCompany.code, items: [] });
      setOpen(true);
    } else {
      setError('사업회사를 선택해주세요.');
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleFacilityModalOpen = () => {
    if (selectedCompany) {
      setFacilityModalOpen(true);
    } else {
      setError('사업회사를 선택해주세요.');
    }
  };

  const handleFacilityModalClose = () => {
    setFacilityModalOpen(false);
  };

  const handleEditModalOpen = async (facility: Facl) => {
    try {
      const response = await axios.get(`https://lcaapi.acess.co.kr/Facilities/${facility.id}`);
      const facilityData = response.data;
      setEditFacility({
        id: facility.id.toString(),
        name: facilityData.name,
        capacity: facilityData.capacity.toString(),
        companyCode: selectedCompany?.code || '',
        items: facilityData.items || []
      });
      setEditModalOpen(true);
    } catch (error) {
      console.error('설비 데이터를 불러오는데 실패했습니다:', error);
    }
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
  };

  const handleDeleteModalOpen = (facilityId: number) => {
    setDeleteFacilityId(facilityId);
    setDeleteModalOpen(true);
  };

  const handleDeleteModalClose = () => {
    setDeleteModalOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewFacility(prev => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFacility(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...newFacility,
        items: newFacility.items.map(itemCode => itemCode)
      };
      // console.log('보내는 데이터:', payload); 
      await axios.post('https://lcaapi.acess.co.kr/Facilities', payload); 
      setOpen(false);
      if (selectedCompany) {
        fetchData(selectedCompany.code);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('설비 등록 중 에러 발생:', error.response ? error.response.data : error.message); 
      } else {
        console.error('설비 등록 중 에러 발생:', error);
      }
    }
  };

  const handleEditSubmit = async () => {
    try {
      const payload = {
        name: editFacility.name,
        capacity: parseFloat(editFacility.capacity),
        items: editFacility.items.map(itemCode => itemCode)
      };
      // console.log('수정 데이터:', payload);
      await axios.put(`https://lcaapi.acess.co.kr/Facilities/${editFacility.id}`, payload);
      setEditModalOpen(false);
      if (selectedCompany) {
        fetchData(selectedCompany.code);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('설비 수정 중 에러 발생:', error.response ? error.response.data : error.message);
      } else {
        console.error('설비 수정 중 에러 발생:', error);
      }
    }
  };

  const handleDeleteFacility = async () => {
    if (deleteFacilityId !== null) {
      try {
        await axios.delete(`https://lcaapi.acess.co.kr/Facilities/${deleteFacilityId}`);
        setDeleteModalOpen(false);
        if (selectedCompany) {
          fetchData(selectedCompany.code);
        }
      } catch (error) {
        console.error('설비 삭제 중 에러 발생:', error);
      }
    }
  };

  // 엑셀 다운로드
  const handleDownloadExcel = () => {
    const tableData = table.getRowModel().rows.map(row => row.original);
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, '설비 관리.xlsx');
  };

  // 동적으로 columns 설정
  const dynamicColumns: ColumnDef<TableData>[] = [
    ...columns,
    ...facilities.map((facility) => {
      const cleanName = `${facility.id}_${facility.name}`.replace(/\./g, '_'); 
      return {
        accessorKey: cleanName,
        header: `${facility.id}_${facility.name} (${facility.capacity})`,
      };
    }),
  ];

  const filteredData = useMemo(() => {
    return data.filter((item) => categoryFilters[item.categoryName]);
  }, [data, categoryFilters]);

  const table = useReactTable({
    data: filteredData,  // 필터링된 데이터 사용
    columns: dynamicColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        설비 관리
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
          style={{
            height: '35px',
            padding: '0 10px',
            fontSize: '14px',
            marginRight: '10px',
            display: userRole === 'User' ? 'none' : 'inline-block', 
          }}
          onClick={handleFetchData}
        >
          조회
        </Button>
        <Button
          variant="contained"
          color="primary"
          style={{
            height: '35px',
            marginLeft: userRole === 'User' ? 0 : '20px', 
            padding: '0 10px',
            fontSize: '14px',
          }}
          onClick={handleFacilityModalOpen}
          disabled={!selectedCompany}
        >
          설비 관리
        </Button>

        <FormGroup row style={{ marginLeft: '20px' }}>
          {Object.keys(categoryFilters).map((category) => (
            <FormControlLabel
              key={category}
              control={
                <Checkbox
                  checked={categoryFilters[category]}
                  onChange={() => handleCategoryFilterChange(category)}
                />
              }
              label={category}
            />
          ))}
        </FormGroup>
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
        <Table stickyHeader>
          <TableHead>
            {/* 첫 번째 헤더 줄: 설비 용량 */}
            <TableRow>
              <TableCell colSpan={2} style={{ ...stickyHeaderStyle2(), textAlign: 'center', left: 0, zIndex: 3 }}>설비용량(KW) →</TableCell>
              {facilities.map(facility => (
                <TableCell key={facility.id} colSpan={1} style={{ ...stickyHeaderStyle2(), textAlign: 'center' }}>{numeral(facility.capacity).format('0.0')}</TableCell>
              ))}
            </TableRow>

            {/* 두 번째 헤더 줄: 품목군, 제품명, 설비명 */}
            <TableRow>
              <TableCell style={{ ...stickyHeaderStyle(), textAlign: 'center', left: 0, zIndex: 3 }}>품목군</TableCell>
              <TableCell style={{ ...stickyHeaderStyle(), textAlign: 'center', left: '130px', zIndex: 3 }}>제품명</TableCell>
              {facilities.map(facility => (
                <TableCell key={facility.id} style={{ ...stickyHeaderStyle(), textAlign: 'center' }}>
                  {`${facility.id}_${facility.name}`}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={facilities.length + 2} style={{ textAlign: 'center' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : selectedCompany ? (
              facilities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={facilities.length + 2} style={{ textAlign: 'center', color: 'red' }}>
                    데이터가 없습니다. 등록하여 주십시오.
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => {
                  const uniqueKey = uuidv4();
                  return (
                    <TableRow key={uniqueKey}>
                      {row.getVisibleCells().map((cell, index) => {
                        const isCategoryOrProduct = ['categoryName', 'itemName'].includes(cell.column.id);

                        return (
                          <TableCell
                            key={`row-${row.id}_cell-${cell.id}_index-${index}`}
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              textAlign: isCategoryOrProduct ? 'center' : 'center',  // 품목군, 제품명은 왼쪽 정렬, 나머지는 중앙 정렬
                              position: isCategoryOrProduct ? 'sticky' : 'static',
                              left: cell.column.id === 'categoryName' ? 0 : cell.column.id === 'itemName' ? '130px' : undefined,
                              zIndex: isCategoryOrProduct ? 2 : 1,
                              backgroundColor: isCategoryOrProduct ? '#ffffff' : undefined,
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              )
            ) : (
              <TableRow>
                <TableCell colSpan={facilities.length + 2} style={{ textAlign: 'center', color: 'red' }}>
                  조회하여 주십시오.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal open={facilityModalOpen} onClose={handleFacilityModalClose} aria-labelledby="facility-modal-title" aria-describedby="facility-modal-description">
        <Box sx={modalStyle}>
          <Typography id="facility-modal-title" variant="h6" component="h2" style={{ marginBottom: 20 }}>
            설비 관리
          </Typography>
          <TableContainer component={Paper} style={{ maxHeight: 400, overflowY: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell style={stickyHeaderStyle()}>설비명</TableCell>
                  <TableCell style={stickyHeaderStyle()}>용량(KW)</TableCell>
                  <TableCell style={stickyHeaderStyle()}>수정/삭제</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {facilities.map(facility => {
                  const uniqueKey = `facility-${facility.id}-${facility.name}`;
                  return (
                    <TableRow key={uniqueKey}> 
                      <TableCell>{`${facility.id}_${facility.name}`}</TableCell>
                      <TableCell>{numeral(facility.capacity).format('0.0')}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEditModalOpen(facility)}>
                          <Edit />
                        </IconButton>
                        <IconButton onClick={() => handleDeleteModalOpen(facility.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Button variant="contained" color="secondary" onClick={handleFacilityModalClose} style={{ marginTop: '20px'}}>
            뒤로
          </Button>
          <Button variant="contained" color="primary" onClick={handleOpen} style={{ marginTop: '20px' , marginLeft: '10px'}}>
            설비 등록
          </Button>
        </Box>
      </Modal>
      <Modal open={open} onClose={handleClose} aria-labelledby="modal-title" aria-describedby="modal-description">
        <Box sx={modalStyle2}>
          <Typography id="modal-title" variant="h6" component="h2" style={{ marginBottom: 20 }}>
            설비 등록
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
                label="설비명"
                variant="outlined"
                fullWidth
                value={newFacility.name}
                onChange={handleChange}
              />
              <Typography variant="body2" color="textSecondary" style={{ marginTop: '5px', marginLeft: '5px', color: 'black'}}>
                전기를 사용하는 주요 설비명을 기재해 주세요. (예시 : 파쇄시설, 분쇄시설, 자력선별시설, 근적외선선별시설, 중력선별시설, 성형시설, 냉매회수시설 등)
              </Typography>
              <Typography variant="body2" color="textSecondary" style={{ marginTop: '5px', marginLeft: '5px', color: 'red'}}>
                (수작업의 경우) 수작업으로 처리하는 부분은 기재하지 마세요. "전기를 사용하는 설비"에 대해서만 입력해 주세요.
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="capacity"
                label="설비용량(KW)"
                variant="outlined"
                fullWidth
                value={newFacility.capacity}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <UseProduct
                onProductChange={(updatedSelectedProducts) => {
                  setNewFacility(prev => ({ ...prev, items: updatedSelectedProducts }));
                }}
                selectedProducts={newFacility.items}
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
            설비 수정
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
                label="설비명"
                variant="outlined"
                fullWidth
                value={editFacility.name}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="capacity"
                label="설비용량(KW)"
                variant="outlined"
                fullWidth
                value={editFacility.capacity}
                onChange={handleEditChange}
              />
            </Grid>
            <Grid item xs={12}>
              <UseProduct
                onProductChange={(updatedSelectedProducts) => {
                  setEditFacility(prev => ({ ...prev, items: updatedSelectedProducts }));
                }}
                selectedProducts={editFacility.items}
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
            <Button variant="contained" color="primary" onClick={handleDeleteFacility}>
              예
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}