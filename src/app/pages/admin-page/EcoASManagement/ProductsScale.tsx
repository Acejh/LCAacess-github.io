import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../ComponentBox/UseCompany';
import numeral from 'numeral';
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
} from '@mui/material';
import * as XLSX from 'xlsx';

type WeightData = {
  categoryName: string;
  midItemName: string;
  itemName: string;
  monthlyWeights: number[];
};

const columns: ColumnDef<WeightData>[] = [
  { accessorKey: 'categoryName', header: '품목군' },
  { accessorKey: 'midItemName', header: '제품군' },
  { accessorKey: 'itemName', header: '제품 분류' },
  ...Array.from({ length: 12 }, (_, i) => ({
    accessorKey: `month_${i + 1}`,
    header: () => (
      <div style={{ textAlign: 'center' }}>
        {i + 1}월
      </div>
    ),
    cell: (info: CellContext<WeightData, unknown>) => numeral(info.getValue()).format('0,0.00000'),
  })),
];

export function ProductsScale() {
  const [data, setData] = useState<WeightData[]>([]);
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchParams, setSearchParams] = useState({
    company: null as Company | null,
    year: '',
  });

  const categoryNameRef = useRef<HTMLTableCellElement>(null);
  const midItemNameRef = useRef<HTMLTableCellElement>(null);
  const itemNameRef = useRef<HTMLTableCellElement>(null);

  const [leftOffsets, setLeftOffsets] = useState({
    midItemName: 0,
    itemName: 0,
  });

  const fetchData = useCallback(async () => {
    if (!searchParams.company || !searchParams.year) {
        setData([]);
        setLoading(false);
        return;
    }

    setLoading(true);

    try {
        const url = `https://lcaapi.acess.co.kr/MonthlyWeights/scaled?CompanyCode=${searchParams.company.code}&Year=${searchParams.year}`;
        const response = await axios.get(url);
        const { list } = response.data;

        const transformedData = list.map((item: {
            categoryName: string;
            midItemName: string;
            itemName: string;
            monthlyWeights: number[];
        }) => {
            const monthlyData: { [key: string]: number | string } = {
              categoryName: item.categoryName,
              midItemName: item.midItemName,
              itemName: item.itemName
            };
            item.monthlyWeights.forEach((weight: number, index: number) => {
                monthlyData[`month_${index + 1}`] = weight;
            });
            return monthlyData;
        });

        setData(transformedData);
        setLoading(false);
    } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (hasSearched) {
      fetchData();
    }
  }, [fetchData, hasSearched]);

  useEffect(() => {
    const updateOffsets = () => {
      const categoryWidth = categoryNameRef.current?.offsetWidth || 0;
      const midItemWidth = midItemNameRef.current?.offsetWidth || 0;
      setLeftOffsets({
        midItemName: categoryWidth,
        itemName: categoryWidth + midItemWidth,
      });
    };
    updateOffsets();
    window.addEventListener('resize', updateOffsets);
    return () => {
      window.removeEventListener('resize', updateOffsets);
    };
  }, [data]);

  const handleDownloadExcel = () => {
    const tableData = table.getRowModel().rows.map(row => row.original);
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, 'NonTargetWeights.xlsx');
  };

  const handleSearch = () => {
    setSearchParams({
      company: selectedCompany,
      year,
    });
    setHasSearched(true);
    setInitialLoad(false);
    setLoading(true);
    fetchData();
  };

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setYear(event.target.value as string);
  };

  const table = useReactTable<WeightData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        품목별 보정중량
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
        <UseCompany onCompanyChange={setSelectedCompany} showAllOption={false}/>
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
      <TableContainer component={Paper} style={{ maxHeight: 545, overflowY: 'auto' }}>
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
                          header.column.id === 'categoryName'
                            ? categoryNameRef
                            : header.column.id === 'midItemName'
                            ? midItemNameRef
                            : header.column.id === 'itemName'
                            ? itemNameRef
                            : undefined
                        }
                        style={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          position: 'sticky', 
                          top: 0, 
                          left: 
                            header.column.id === 'categoryName'
                              ? 0
                              : header.column.id === 'midItemName'
                              ? `${leftOffsets.midItemName}px` 
                              : header.column.id === 'itemName'
                              ? `${leftOffsets.itemName}px`
                              : undefined,
                          zIndex: ['categoryName', 'midItemName', 'itemName'].includes(header.column.id) ? 3 : 2,
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
                      사업회원 및 연도를 선택하여 조회해주십시오.
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
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textAlign: ['categoryName', 'midItemName', 'itemName'].includes(cell.column.id)
                              ? 'left'
                              : 'right',
                            position: ['categoryName', 'midItemName', 'itemName'].includes(cell.column.id)
                              ? 'sticky'
                              : 'static',
                            left:
                              cell.column.id === 'categoryName'
                                ? 0
                                : cell.column.id === 'midItemName'
                                ? `${leftOffsets.midItemName}px`
                                : cell.column.id === 'itemName'
                                ? `${leftOffsets.itemName}px` 
                                : undefined,
                            zIndex: ['categoryName', 'midItemName', 'itemName'].includes(cell.column.id) ? 2 : 1,
                            backgroundColor: ['categoryName', 'midItemName', 'itemName'].includes(cell.column.id)
                              ? '#ffffff'
                              : undefined,
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