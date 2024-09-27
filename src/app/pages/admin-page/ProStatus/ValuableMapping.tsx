import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../ComponentBox/UseCompany';
import '../../CSS/SCbar.css';
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
import * as XLSX from 'xlsx';

// 유가물 품목 매핑 데이터를 위한 타입 정의
type LciItem = {
  id: number;
  year: number;
  type: string;
  category: string;
  itemName: string | null;
  unit: string;
  gwp: number;
  gwpAlt: number;
};

type ValuableMapItem = {
  id: number;
  companyCode: string;
  companyName: string;
  item1: string;
  item2: string;
  item3: string;
  lciItem: LciItem;
};

type ValuableMappingData = {
  id: number;
  companyCode: string;
  companyName: string;
  item1: string;
  item2: string;
  item3: string;
  lciItem: LciItem;
  onItemClick: (lciItem: LciItem) => void;
};

// 모달창에 표시할 데이터를 위한 타입 정의
type ModalData = LciItem | null;

export function ValuableMapping() {
  const [data, setData] = useState<ValuableMappingData[]>([]);
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData>(null);

  const [isMappingTestMode, setIsMappingTestMode] = useState(false); // 테스트 삭제예정

  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [mappingItems, setMappingItems] = useState<{ id: number, name: string }[]>([]);
  const [selectedMappingItem, setSelectedMappingItem] = useState<number | null>(null);
  const [currentRowId, setCurrentRowId] = useState<number | null>(null);

  const [searchParams, setSearchParams] = useState({
    company: null as Company | null,
    year: '',
  });

  // 데이터 가져오는 함수
  const fetchData = useCallback(async () => {
    if (!searchParams.company || !searchParams.year) {
      setData([]);
      setLoading(false);
      return;
    }
  
    setLoading(true);
  
    try {
      const url = `https://lcaapi.acess.co.kr/ValuableMaps?CompanyCode=${searchParams.company?.code}&Year=${searchParams.year}`;
      const response = await axios.get(url);
      const { valuableMaps } = response.data;
  
      const transformedData = valuableMaps.map((item: ValuableMapItem, index: number) => ({
        id: item.id,
        companyCode: item.companyCode,
        companyName: item.companyName,
        item1: item.item1,
        item2: item.item2,
        item3: item.item3,
        // 매핑 테스트 모드에 따라 첫 번째 lciItem을 null로 설정
        lciItem: isMappingTestMode && index === 0 ? null : item.lciItem,
        onItemClick: handleItemClick,
      }));
  
      setData(transformedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [searchParams, isMappingTestMode]);

  // 검색 조건이 설정된 후 데이터를 가져오기 위한 useEffect
  useEffect(() => {
    if (hasSearched) {
      fetchData();
    }
  }, [fetchData, hasSearched, isMappingTestMode]);

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

  // 연도 선택 핸들러
  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setYear(event.target.value as string);
  };

  // 아이템 클릭 시 모달 창 열기
  const handleItemClick = (lciItem: LciItem) => {
    setModalData(lciItem);
    setModalOpen(true);
  };

  // 모달 창 닫기
  const handleCloseModal = () => {
    setModalOpen(false);
    setModalData(null);
  };

  // 매핑 모달 열기
  const handleMappingClick = async (row: ValuableMappingData) => {
    setCurrentRowId(row.id);  // 선택된 row의 id 저장

    try {
      // lciItem이 없으면 searchParams.year 사용
      const year = row.lciItem ? row.lciItem.year : searchParams.year;

      const response = await axios.get(`https://lcaapi.acess.co.kr/ValuableMaps/LciItems?Year=${year}`);
      setMappingItems(response.data.lciItems);  // API로부터 가져온 lciItems 설정
      setMappingModalOpen(true);
    } catch (error) {
      console.error('Error fetching LCI items:', error);
    }
  };

  // Autocomplete 선택 핸들러
  const handleMappingSelectChange = (
    event: React.SyntheticEvent,
    newValue: { id: number; name: string } | null
  ) => {
    if (newValue) {
      setSelectedMappingItem(newValue.id);
    } else {
      setSelectedMappingItem(null);
    }
  };

  // 매핑 저장 요청
  const handleSaveMapping = async () => {
    if (currentRowId && selectedMappingItem) {
      try {
        const payload = { id: currentRowId, lciItemId: selectedMappingItem };
        await axios.post('https://lcaapi.acess.co.kr/ValuableMaps', payload);
        setMappingModalOpen(false);
        alert('매핑이 완료되었습니다.');
        fetchData();  // 데이터 새로 고침
      } catch (error) {
        console.error('Error saving mapping:', error);
        alert('매핑 저장에 실패했습니다.');
      }
    }
  };

  // 모달 닫기 핸들러
  const handleCloseMappingModal = () => {
    setMappingModalOpen(false);
    setSelectedMappingItem(null);
  };

  // 엑셀 다운로드 기능
  const handleDownloadExcel = () => {
    const tableData = table.getRowModel().rows.map(row => row.original);
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '유가물 품목 매핑');
    XLSX.writeFile(workbook, 'ValuableMapping.xlsx');
  };

  // 테이블 열 정의
  const columns: ColumnDef<ValuableMappingData>[] = [
    { accessorKey: 'companyName', header: '사업회원' },
    { accessorKey: 'item1', header: '품목군' },
    { accessorKey: 'item2', header: '제품군' },
    { accessorKey: 'item3', header: '제품분류' },
    {
      accessorKey: 'lciItem.itemName',
      header: 'LCI 품목매핑',
      cell: (info: CellContext<ValuableMappingData, unknown>) => {
        const lciItem = info.row.original.lciItem;
        
        if (lciItem) {
          // lciItem 데이터가 존재하면 매핑된 상태로 간주
          const itemName = lciItem.itemName ? lciItem.itemName : '매핑된 품목';
          return (
            <Typography
              style={{ color: 'blue', cursor: 'pointer' }}
              onClick={() => info.row.original.onItemClick(lciItem)}  
            >
              {itemName}
            </Typography>
          );
        } else {
          // lciItem이 없으면 매핑이 안 된 상태
          return (
            <Typography
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => handleMappingClick(info.row.original)} 
            >
              매핑필요
            </Typography>
          );
        }
      },
    },
  ];

  // 테이블 세팅
  const table = useReactTable<ValuableMappingData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // 컴포넌트 렌더링
  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        유가물 품목 매핑 관리
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
        <UseCompany onCompanyChange={setSelectedCompany} />
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
        <Button
          variant="contained"
          color="primary"
          style={{ height: '35px', padding: '0 10px', fontSize: '14px', display: 'none', }}
          onClick={() => {
            setIsMappingTestMode(prev => !prev); 
            setHasSearched(true); 
          }}
        >
          {isMappingTestMode ? '매핑 테스트 종료' : '매핑 테스트 시작'}
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
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      style={{
                        backgroundColor: row.original.lciItem ? 'white' : '#64fccedd', 
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
                  ))
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

      {/* 모달 창 */}
      <Dialog open={modalOpen} onClose={handleCloseModal}>
        <DialogTitle>LCI 품목 상세 정보</DialogTitle>
        <DialogContent>
          {modalData ? (
            <>
              <Typography variant="body1"><strong>품목명:</strong> {modalData.itemName || 'N/A'}</Typography>
              <Typography variant="body1"><strong>연도:</strong> {modalData.year}</Typography>
              <Typography variant="body1"><strong>유형:</strong> {modalData.type}</Typography>
              <Typography variant="body1"><strong>카테고리:</strong> {modalData.category}</Typography>
              <Typography variant="body1"><strong>단위:</strong> {modalData.unit}</Typography>
              <Typography variant="body1"><strong>GWP:</strong> {modalData.gwp}</Typography>
              <Typography variant="body1"><strong>GWP 대체:</strong> {modalData.gwpAlt}</Typography>
            </>
          ) : (
            <Typography variant="body1">데이터를 불러오는 중입니다...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={mappingModalOpen} onClose={handleCloseMappingModal} maxWidth="sm" fullWidth>
        <DialogTitle>LCI 품목 매핑</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>매핑할 품목 선택</Typography>
          <Autocomplete
            options={mappingItems}
            getOptionLabel={(option) => option.name}  // 드롭다운에 표시할 필드
            renderInput={(params) => <TextField {...params} label="LCI 품목 선택" variant="outlined" />}
            value={mappingItems.find(item => item.id === selectedMappingItem) || null}
            onChange={handleMappingSelectChange}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            style={{ maxHeight: 224, overflowY: 'auto' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveMapping} color="primary" disabled={!selectedMappingItem}>
            매핑 저장
          </Button>
          <Button onClick={handleCloseMappingModal} color="secondary">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
