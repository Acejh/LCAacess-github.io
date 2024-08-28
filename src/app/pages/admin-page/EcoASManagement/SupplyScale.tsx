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

type ValuableData = {
  item1: string;
  item2: string;
  item3: string;
  monthlyWeights: number[];
  total: number;
};

const columns: ColumnDef<ValuableData>[] = [
  { accessorKey: 'item1', header: '품목군' },
  { accessorKey: 'item2', header: '제품군' },
  { accessorKey: 'item3', header: '제품 분류' },
  ...Array.from({ length: 12 }, (_, i) => ({
    accessorKey: `month_${i + 1}`,
    header: () => (
      <div style={{ textAlign: 'center' }}>
        {i + 1}월
      </div>
    ),
    cell: (info: CellContext<ValuableData, unknown>) => numeral(info.getValue()).format('0,0.00000'),
  })),
  {
    accessorKey: 'total',
    header: '총합',
    cell: (info: CellContext<ValuableData, unknown>) => numeral(info.getValue()).format('0,0.00000'),
  },
];

export function SupplyScale() {
  const [data, setData] = useState<ValuableData[]>([]);
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchParams, setSearchParams] = useState({
    company: null as Company | null,
    year: '',
  });

  const item1Ref = useRef<HTMLTableCellElement>(null);
  const item2Ref = useRef<HTMLTableCellElement>(null);
  const item3Ref = useRef<HTMLTableCellElement>(null);

  const [leftOffsets, setLeftOffsets] = useState({
    item2: 0,
    item3: 0,
  });

  const fetchData = useCallback(async () => {
    if (!searchParams.company || !searchParams.year) {
        setData([]);
        setLoading(false);
        return;
    }

    setLoading(true);

    try {
        const url = `https://lcaapi.acess.co.kr/MonthlyWeights/valuables?CompanyCode=${searchParams.company.code}&Year=${searchParams.year}`;
        const response = await axios.get(url);
        const { list } = response.data;

        const transformedData = list.map((item: {
            item1: string;
            item2: string;
            item3: string;
            weights: number[];
            total: number;
        }) => {
            const monthlyData: { [key: string]: number | string } = {
              item1: item.item1,
              item2: item.item2,
              item3: item.item3,
              total: item.total,
            };
            item.weights.forEach((weight: number, index: number) => {
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
      const item1Width = item1Ref.current?.offsetWidth || 0;
      const item2Width = item2Ref.current?.offsetWidth || 0;
      setLeftOffsets({
        item2: item1Width,
        item3: item1Width + item2Width,
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
    XLSX.writeFile(workbook, 'ValuableWeights.xlsx');
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

  const table = useReactTable<ValuableData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        유가물 중량
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
                          header.column.id === 'item1'
                            ? item1Ref
                            : header.column.id === 'item2'
                            ? item2Ref
                            : header.column.id === 'item3'
                            ? item3Ref
                            : undefined
                        }
                        style={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          position: 'sticky', 
                          top: 0, 
                          left: 
                            header.column.id === 'item1'
                              ? 0
                              : header.column.id === 'item2'
                              ? `${leftOffsets.item2}px` 
                              : header.column.id === 'item3'
                              ? `${leftOffsets.item3}px`
                              : undefined,
                          zIndex: ['item1', 'item2', 'item3'].includes(header.column.id) ? 3 : 2,
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
                            textAlign: ['item1', 'item2', 'item3'].includes(cell.column.id)
                              ? 'left'
                              : 'right',
                            position: ['item1', 'item2', 'item3'].includes(cell.column.id)
                              ? 'sticky'
                              : 'static',
                            left:
                              cell.column.id === 'item1'
                                ? 0
                                : cell.column.id === 'item2'
                                ? `${leftOffsets.item2}px`
                                : cell.column.id === 'item3'
                                ? `${leftOffsets.item3}px` 
                                : undefined,
                            zIndex: ['item1', 'item2', 'item3'].includes(cell.column.id) ? 2 : 1,
                            backgroundColor: ['item1', 'item2', 'item3'].includes(cell.column.id)
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