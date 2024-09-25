import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../../../CSS/SCbar.css';
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
} from '@mui/material';

type LciItem = {
  id: number;
  year: number;
  type: string;
  category: string;
  itemName: string;
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

export function LCI_Item() {
  const [data, setData] = useState<LciItem[]>([]);
  const [filteredData, setFilteredData] = useState<LciItem[]>([]);
  const [lciTypes, setLciTypes] = useState<{ [key: string]: string }>({});
  const [lciCategories, setLciCategories] = useState<LciCategory>({});
  const [year, setYear] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // 실제 필터링에 사용될 상태
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // 드롭다운 선택 값 임시 저장 상태
  const [tempSelectedType, setTempSelectedType] = useState('');
  const [tempSelectedCategory, setTempSelectedCategory] = useState('');

  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // LCI 타입 데이터를 가져오는 함수
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

  // LCI 카테고리 데이터를 가져오는 함수
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

  // LCI 항목 데이터를 가져오는 함수
  const fetchData = useCallback(async () => {
    if (!year) return;

    setLoading(true);

    try {
      const url = `https://lcaapi.acess.co.kr/LciItems?year=${year}`;
      const response = await axios.get<LciItem[]>(url);

      setData(response.data);
      setFilteredData(response.data); // 전체 데이터를 설정
      setLoading(false);
    } catch (error) {
      console.error('데이터 가져오기 오류:', error);
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    // 초기 로드 시 LCI 타입과 카테고리 데이터 가져오기
    fetchLciTypes();
    fetchLciCategories();
  }, []);

  useEffect(() => {
    if (hasSearched) {
      fetchData();
    }
  }, [hasSearched, fetchData]);

  // 필터링 로직
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

  // 조회 버튼이 눌렸을 때 필터링 적용
  const handleSearch = () => {
    setSelectedType(tempSelectedType); // 임시 상태를 실제 필터링 상태에 반영
    setSelectedCategory(tempSelectedCategory); // 임시 상태를 실제 필터링 상태에 반영
    setYear(selectedYear);
    setHasSearched(true);
    setInitialLoad(false);
  };

  // 드롭다운에서 연도 변경 시
  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setSelectedYear(event.target.value as string);
  };

  // 드롭다운에서 구분 변경 시 임시 상태에 저장
  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    setTempSelectedType(event.target.value as string);
    setTempSelectedCategory(''); // 구분이 바뀌면 종류 초기화
  };

  // 드롭다운에서 종류 변경 시 임시 상태에 저장
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setTempSelectedCategory(event.target.value as string);
  };

  const getCategoryValue = (type: string, categoryKey: string) => {
    const categoryList = lciCategories[type] || [];
    const category = categoryList.find((cat) => cat.key === categoryKey);
    return category ? category.value : categoryKey;
  };

  const columns: ColumnDef<LciItem>[] = [
    {
      header: '유형',
      accessorFn: (row) => row.type,
      id: 'type',
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
      accessorFn: (row) => row.itemName,
      id: 'itemName',
    },
    {
      header: '단위',
      accessorFn: (row) => row.unit,
      id: 'unit',
    },
    {
      header: 'GWP',
      accessorFn: (row) => row.gwp,
      id: 'gwp',
    },
    {
      header: '유가물 대체효과',
      accessorFn: (row) => row.gwpAlt,
      id: 'gwpAlt',
    },
  ];

  const table = useReactTable<LciItem>({
    data: filteredData, // 필터링된 데이터 사용
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

        {/* 구분 선택 드롭다운 */}
        <FormControl style={{ marginRight: '10px' }}>
          <Select
            id="type-select"
            value={tempSelectedType} // 임시 상태 사용
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

        {/* 종류 선택 드롭다운 */}
        <FormControl style={{ marginRight: '10px' }}>
          <Select
            id="category-select"
            value={tempSelectedCategory} // 임시 상태 사용
            onChange={handleCategoryChange}
            displayEmpty
            style={{ width: '150px' }}
            sx={{ height: '45px' }}
            disabled={!tempSelectedType} // 구분이 선택되지 않으면 비활성화
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
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textAlign: ['gwp', 'gwpAlt'].includes(header.column.id) ? 'center' : 'left',
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
                      연도를 선택하여 조회해주십시오.
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
                            textAlign: typeof cell.getValue() === 'number' ? 'right' : 'left',
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
    </div>
  );
}
