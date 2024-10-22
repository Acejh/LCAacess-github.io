import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../ComponentBox/UseCompany';
import '../../CSS/SCbar.css';
import UseProduct from '../../ComponentBox/ProductMap';
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
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
} from '@mui/material';

// 폐기물 품목 매핑 데이터를 위한 타입 정의
type LciItem = {
  id: number;
  year: number;
  type: string;
  category: string;
  name: string | null;
  unit: string;
  gwp: number;
  gwpAlt: number;
};

type Client = {
  id: number;
  companyCode: string;
  inOutType: string;
  type: string;
  name: string;
  bizNo: string;
  address: string;
  distance: number;
};

type WasteMapItem = {
  id: number;
  year: number;
  companyCode: string;
  client: Client;
  item1: string;
  item2: string;
  item3: string;
  wasteMethod: string;
  lciItem: LciItem;
  itemCodes: string[];
};

type WasteMappingData = {
  id: number;
  companyCode: string;
  client: Client;
  item1: string;
  item2: string;
  item3: string;
  wasteMethod: string;
  lciItem: LciItem;
  itemCodes: string[];
  onItemClick: (lciItem: LciItem, rowId: number) => void; 
  onClientClick: (client: Client) => void;
};

// 모달창에 표시할 데이터를 위한 타입 정의
type ModalData = LciItem | null;
type ClientModalData = Client | null;

export function WasteMapping() {
  const [data, setData] = useState<WasteMappingData[]>([]);
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  // LCI Modal 관련 상태
  const [lciModalOpen, setLciModalOpen] = useState(false);
  const [lciModalData, setLciModalData] = useState<ModalData>(null);

  // Client Modal 관련 상태
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [clientModalData, setClientModalData] = useState<ClientModalData>(null);

  // Mapping Modal 관련 상태
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [mappingItems, setMappingItems] = useState<{ id: number; name: string }[]>([]);
  const [selectedMappingItem, setSelectedMappingItem] = useState<{ id: number; name: string } | null>(null);

  // UseProduct 모달 관련 상태
  const [productModalOpen, setProductModalOpen] = useState(false);  // 처리제품 모달 상태
  const [selectedItemCodes, setSelectedItemCodes] = useState<string[]>([]); // 선택된 itemCodes 저장

  // 처리 방법 Modal 관련 상태
  const [wasteMethodModalOpen, setWasteMethodModalOpen] = useState(false);
  const [wasteMethods, setWasteMethods] = useState<string[]>([]);
  const [selectedWasteMethod, setSelectedWasteMethod] = useState<string | null>(null);

  const [currentRowId, setCurrentRowId] = useState<number | null>(null);

  const [typeMapping, setTypeMapping] = useState<Record<string, string>>({});
  const [categoryMapping, setCategoryMapping] = useState<Record<string, Record<string, string>>>({});

  const [searchParams, setSearchParams] = useState({
    company: null as Company | null,
    year: '',
  });

  //권한 관리
  useEffect(() => {
    const userInfoString = localStorage.getItem('kt-auth-react-v');
    if (userInfoString) {
      try {
        const parsedData = JSON.parse(userInfoString);
        const userInfo = parsedData?.userInfo;  // userInfo 객체 접근
        if (userInfo) {
          setUserRole(userInfo.role);  // role 값 설정
        }
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }
  }, []);

  // 데이터 가져오는 함수
  const fetchData = useCallback(async () => {
    if (!searchParams.company || !searchParams.year) {
      setData([]);
      setLoading(false);
      return;
    }
  
    setLoading(true);
  
    try {
      const url = `https://lcaapi.acess.co.kr/WasteMaps?CompanyCode=${searchParams.company?.code}&Year=${searchParams.year}`;
      const response = await axios.get(url);
      const { wasteMaps } = response.data;

      // 데이터 변환 및 상태 업데이트
      const transformedData = wasteMaps.map((item: WasteMapItem) => ({
        id: item.id,
        companyCode: item.companyCode,
        client: item.client,
        item1: item.item1,
        item2: item.item2,
        item3: item.item3,
        wasteMethod: item.wasteMethod, 
        lciItem: item.lciItem,         
        itemCodes: item.itemCodes,       
        onItemClick: handleLciItemClick,
        onClientClick: handleClientClick,
      }));

      setData(transformedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [searchParams]);

  // 유형 및 카테고리 매핑 데이터 가져오기
  const fetchMappings = useCallback(async () => {
    try {
      const typeResponse = await axios.get('https://lcaapi.acess.co.kr/LciItems/LciTypes');
      const typeMap: Record<string, string> = {};
      typeResponse.data.forEach((item: { key: string; value: string }) => {
        typeMap[item.key] = item.value;
      });
      setTypeMapping(typeMap);

      const categoryResponse = await axios.get('https://lcaapi.acess.co.kr/LciItems/LciCategories');
      const categoryMap: Record<string, Record<string, string>> = {};

      if (categoryResponse.data && categoryResponse.data.lciCategories) {
        Object.entries(categoryResponse.data.lciCategories).forEach(([typeKey, categories]) => {
          if (Array.isArray(categories)) {
            categoryMap[typeKey] = {};
            categories.forEach((item: { key: string; value: string }) => {
              categoryMap[typeKey][item.key] = item.value;
            });
          }
        });
      }
      setCategoryMapping(categoryMap);
    } catch (error) {
      console.error('Error fetching mappings:', error);
    }
  }, []);

  useEffect(() => {
    fetchMappings();
  }, [fetchMappings]);

  useEffect(() => {
    if (hasSearched) {
      fetchData();
    }
  }, [fetchData, hasSearched]);

  // 검색 기능
  const handleSearch = () => {
    setSearchParams({
      company: selectedCompany,
      year,
    });
    setHasSearched(true);
    setInitialLoad(false);
    setLoading(true);
  };

  // 처리방법 모달 열기
  const handleWasteMethodClick = async (row: WasteMappingData) => {
    setCurrentRowId(row.id);
    try {
      const response = await axios.get(`https://lcaapi.acess.co.kr/WasteMaps/Methods`);
      setWasteMethods(response.data.wasteMethods);
      setWasteMethodModalOpen(true);
    } catch (error) {
      console.error('Error fetching waste methods:', error);
    }
  };

  // 처리방법 모달 닫기
  const handleCloseWasteMethodModal = () => {
    setWasteMethodModalOpen(false);
    setSelectedWasteMethod(null);
  };

  // 매핑 모달 열기
  const handleMappingClick = async (row: WasteMappingData) => {
    setCurrentRowId(row.id);
    
    try {
      const response = await axios.get(`https://lcaapi.acess.co.kr/WasteMaps/LciItems?year=${searchParams.year}`);
      setMappingItems(response.data.lciItems);
      setMappingModalOpen(true);  // 모달 열기
    } catch (error) {
      console.error('Error fetching LCI items:', error);
    }
  };

  // 매핑 모달 닫기
  const handleCloseMappingModal = () => {
    setMappingModalOpen(false);
    setSelectedMappingItem(null);
  };

  // 처리제품 모달 열기
  const handleProductModalOpen = (itemCodes: string[], rowId: number) => {
    setSelectedItemCodes(itemCodes || []);  
    setCurrentRowId(rowId);                 
    setProductModalOpen(true);              
  };

  // 처리제품 모달 닫기
  const handleProductModalClose = () => {
    setProductModalOpen(false);
  };

  // 제품 선택이 변경될 때 호출되는 함수
  const handleProductChange = (selectedCodes: string[]) => {
    setSelectedItemCodes(selectedCodes);
  };

  // 연도 선택 핸들러
  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setYear(event.target.value as string);
  };

  // LCI 아이템 클릭 시 모달 열기
  const handleLciItemClick = async (lciItem: LciItem, rowId: number) => {
    setCurrentRowId(rowId);  // 선택한 행의 ID를 설정
    setLciModalData(lciItem);
    setLciModalOpen(true);
  
    try {
      const response = await axios.get(`https://lcaapi.acess.co.kr/WasteMaps/LciItems?year=${lciItem.year}`);
      setMappingItems(response.data.lciItems);
    } catch (error) {
      console.error('Error fetching LCI items:', error);
      setMappingItems([]); 
    }
  };

  // LCI 모달 닫고 매핑 모달 열기
  const handleOpenMappingModal = async () => {
    handleCloseLciModal(); 

    setTimeout(async () => {
      try {
        const response = await axios.get(`https://lcaapi.acess.co.kr/WasteMaps/LciItems?year=${searchParams.year}`);
        setMappingItems(response.data.lciItems);

      
        setMappingModalOpen(true);
      } catch (error) {
        console.error('Error fetching LCI items for mapping:', error);
      }
    }, 100); 
  };

  // Client 클릭 시 모달 열기
  const handleClientClick = (client: Client) => {
    setClientModalData(client);
    setClientModalOpen(true);
  };

  // LCI 모달 닫기
  const handleCloseLciModal = () => {
    setLciModalOpen(false);
    setLciModalData(null);
  };

  // Client 모달 닫기
  const handleCloseClientModal = () => {
    setClientModalOpen(false);
    setClientModalData(null);
  };

  // 처리방법 저장
  const handleSaveWasteMethod = async () => {
    if (currentRowId && selectedWasteMethod) {
      try {
        const payload = { id: currentRowId, wasteMethod: selectedWasteMethod };
        await axios.post('https://lcaapi.acess.co.kr/WasteMaps/Method', payload);
        setWasteMethodModalOpen(false);
        fetchData();
      } catch (error) {
        console.error('Error saving waste method:', error);
      }
    }
  };

  // 매핑 저장
  const handleSaveMapping = async () => {
    if (currentRowId && selectedMappingItem) {
      try {
        const payload = { id: currentRowId, lciItemId: selectedMappingItem.id };
        await axios.post('https://lcaapi.acess.co.kr/WasteMaps', payload);
        setMappingModalOpen(false);
        fetchData();
      } catch (error) {
        console.error('Error saving mapping:', error);
      }
    }
  };

  // 선택한 제품 데이터를 저장
  const handleSaveProductMapping = async () => {
    if (currentRowId) {
      try {
        const payload = {
          id: currentRowId,
          itemCodes: selectedItemCodes, 
        };
        await axios.post('https://lcaapi.acess.co.kr/WasteMaps/ItemCodes', payload); 
        setProductModalOpen(false);
        fetchData();  
      } catch (error) {
        console.error('Error saving item codes:', error);
      }
    }
  };

  // 테이블 열 정의
  const columns: ColumnDef<WasteMappingData>[] = [
    {
      accessorKey: 'client.name',
      header: '거래처',
      cell: (info: CellContext<WasteMappingData, unknown>) => {
        const client = info.row.original.client;
        return (
          <Typography
            style={{ color: 'blue', cursor: 'pointer' }}
            onClick={() => info.row.original.onClientClick(client)}
          >
            {client.name}
          </Typography>
        );
      },
    },
    { accessorKey: 'item1', header: '품목군' },
    { accessorKey: 'item2', header: '제품군' },
    { accessorKey: 'item3', header: '제품분류' },
    {
      accessorKey: 'wasteMethod',
      header: '처리방법',
      cell: (info: CellContext<WasteMappingData, unknown>) => {
        const lciItem = info.row.original.lciItem;
        const wasteMethod = info.row.original.wasteMethod;
        
        if (lciItem.name === '폐기물(제외)') {
          return (
            <Typography style={{ color: 'gray' }}>매핑 불필요</Typography>
          );
        }
        
        return (
          <Typography
            style={{ color: wasteMethod ? 'blue' : 'red', cursor: 'pointer' }}
            onClick={() => handleWasteMethodClick(info.row.original)}
          >
            {wasteMethod || '매핑필요'}
          </Typography>
        );
      },
    },
    {
      accessorKey: 'lciItem.name',
      header: 'LCI 품목매핑',
      cell: (info: CellContext<WasteMappingData, unknown>) => {
        const lciItem = info.row.original.lciItem;
        if (lciItem) {
          return (
            <Typography
              style={{
                color: userRole === 'User' ? 'black' : 'blue',
                cursor: userRole === 'User' ? 'default' : 'pointer',
              }}
              onClick={() => {
                if (userRole !== 'User') {
                  // 두 인수를 전달: lciItem, rowId
                  info.row.original.onItemClick(lciItem, info.row.original.id);
                }
              }}
            >
              {lciItem.name}
            </Typography>
          );
        } else {
          return (
            <Typography
              style={{
                color: userRole === 'User' ? 'black' : 'red',
                cursor: userRole === 'User' ? 'default' : 'pointer',
              }}
              onClick={() => {
                if (userRole !== 'User') {
                  handleMappingClick(info.row.original);
                }
              }}
            >
              매핑필요
            </Typography>
          );
        }
      },
    },
    {
      accessorKey: 'itemCodes',
      header: '처리제품',
      cell: (info: CellContext<WasteMappingData, unknown>) => {
        const lciItem = info.row.original.lciItem;
        const itemCodes = info.row.original.itemCodes || [];
        const displayText = itemCodes.length > 0 ? '매핑완료' : '매핑필요';
    
        if (lciItem.name === '폐기물(제외)') {
          return (
            <Typography style={{ color: 'gray' }}>매핑 불필요</Typography>
          );
        }
        
        return (
          <Typography
            style={{ color: itemCodes.length > 0 ? 'blue' : 'red', cursor: 'pointer' }}
            onClick={() => handleProductModalOpen(itemCodes, info.row.original.id)}
          >
            {displayText}
          </Typography>
        );
      },
    },
  ];

  const table = useReactTable<WasteMappingData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        폐기물 처리품목&middot;방법 관리
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
          disabled={!selectedCompany || !year}
        >
          조회
        </Button>
      </div>
      <TableContainer
        component={Paper}
        style={{ maxHeight: 545, overflowY: 'auto' }}
        className="custom-scrollbar"
      >
        <Table>
          {loading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={13} style={{ textAlign: 'center' }}>
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
                {!hasSearched && initialLoad ? (
                  <TableRow>
                    <TableCell colSpan={13} style={{ textAlign: 'center', color: 'red' }}>
                      사업회원 및 연도를 선택하여 조회해주십시오.
                    </TableCell>
                  </TableRow>
                ) : loading ? (
                  <TableRow>
                    <TableCell colSpan={13} style={{ textAlign: 'center' }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => {
                
                    const isMappingIncomplete = 
                      row.original.lciItem?.name !== '폐기물(제외)' && ( 
                        !row.original.wasteMethod || 
                        !row.original.lciItem ||    
                        !(row.original.itemCodes && row.original.itemCodes.length > 0) 
                      );
              
                    return (
                      <TableRow
                        key={row.id}
                        style={{
                          backgroundColor: isMappingIncomplete ? '#f5c6cb' : 'white', 
                        }}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={13} style={{ textAlign: 'center', color: 'red' }}>
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      </TableContainer>

      {/* LCI 품목 상세 정보 모달 */}
      <Dialog 
        open={lciModalOpen} 
        onClose={handleCloseLciModal} 
        maxWidth="md" 
        fullWidth={true}
      >
        <DialogTitle>LCI 품목 상세 정보</DialogTitle>
        <DialogContent>
          {lciModalData ? (
            <>
              <Typography variant="body1"><strong>품목명:</strong> {lciModalData.name || 'N/A'}</Typography>
              <Typography variant="body1"><strong>연도:</strong> {lciModalData.year}</Typography>
              <Typography variant="body1">
                <strong>유형:</strong> {typeMapping[lciModalData.type] || lciModalData.type || '알 수 없음'}
              </Typography>
              <Typography variant="body1">
                <strong>카테고리:</strong>{' '}
                {categoryMapping[lciModalData.type] && categoryMapping[lciModalData.type][lciModalData.category]
                  ? categoryMapping[lciModalData.type][lciModalData.category]
                  : lciModalData.category || '알 수 없음'}
              </Typography>
              <Typography variant="body1"><strong>단위:</strong> {lciModalData.unit}</Typography>
              <Typography variant="body1"><strong>GWP:</strong> {lciModalData.gwp}</Typography>
              <Typography variant="body1"><strong>GWP 대체:</strong> {lciModalData.gwpAlt}</Typography>
            </>
          ) : (
            <Typography variant="body1">데이터를 불러오는 중입니다...</Typography>
          )}
        </DialogContent>
        <DialogActions style={{ justifyContent: 'space-between' }}>
          <Button
            onClick={async () => {
              // 이제 handleOpenMappingModal로 교체합니다.
              await handleOpenMappingModal();
            }}
            color="secondary"
          >
            매핑 수정
          </Button>
          <Button onClick={handleCloseLciModal} color="primary">
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* Client 상세 정보 모달 */}
      <Dialog open={clientModalOpen} onClose={handleCloseClientModal}>
        <DialogTitle>거래처 상세 정보</DialogTitle>
        <DialogContent>
          {clientModalData ? (
            <>
              <Typography variant="body1"><strong>거래처명:</strong> {clientModalData.name}</Typography>
              <Typography variant="body1"><strong>사업자 번호:</strong> {clientModalData.bizNo}</Typography>
              <Typography variant="body1"><strong>주소:</strong> {clientModalData.address}</Typography>
              <Typography variant="body1"><strong>거리:</strong> {clientModalData.distance} km</Typography>
            </>
          ) : (
            <Typography variant="body1">데이터를 불러오는 중입니다...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClientModal} color="primary">닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 처리방법 매핑 모달 */}
      <Dialog
        open={wasteMethodModalOpen}
        onClose={handleCloseWasteMethodModal}
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogTitle>처리방법 매핑</DialogTitle>
        <DialogContent>
        <div style={{ marginTop: '20px' }}>
          <Autocomplete
            options={wasteMethods}
            getOptionLabel={(option) => option}
            renderInput={(params) => <TextField {...params} label="처리방법 선택" variant="outlined" />}
            value={selectedWasteMethod}
            onChange={(event, newValue) => setSelectedWasteMethod(newValue)}
          />
        </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWasteMethodModal} color="secondary">취소</Button>
          <Button onClick={handleSaveWasteMethod} color="primary" disabled={!selectedWasteMethod}>
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 매핑 모달 */}
      <Dialog
        open={mappingModalOpen}
        onClose={handleCloseMappingModal}
        maxWidth="sm"
        fullWidth={true}
      >
        <DialogTitle>LCI 품목 매핑</DialogTitle>
        <DialogContent>
          <div style={{ marginTop: '20px' }}>
            {mappingItems.length > 0 ? (
              <Autocomplete
                options={mappingItems}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => <TextField {...params} label="LCI 품목 선택" variant="outlined" />}
                value={selectedMappingItem}
                onChange={(event, newValue) => setSelectedMappingItem(newValue)}
              />
            ) : (
              <Typography>매핑할 항목이 없습니다.</Typography>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMappingModal} color="secondary">취소</Button>
          <Button onClick={handleSaveMapping} color="primary" disabled={!selectedMappingItem}>
            저장
          </Button>
        </DialogActions>
      </Dialog>
      {/* 처리제품 모달 */}
      <Dialog
        open={productModalOpen}
        onClose={handleProductModalClose}
        maxWidth="lg"
        fullWidth={true}
      >
        <DialogTitle>처리제품 매핑</DialogTitle>
        <DialogContent>
          <UseProduct
            selectedProducts={selectedItemCodes}  
            onProductChange={handleProductChange}  
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleProductModalClose} color="secondary">취소</Button>
          <Button onClick={handleSaveProductMapping} color="primary" disabled={!selectedItemCodes.length}>
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
