import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
// import numeral from 'numeral';
// import { CellContext } from '@tanstack/react-table';
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
  lciType: string;
  itemName: string;
  componentType: string | null;
  unit: string;
  hasComposition: boolean;
};

export function LCI_Item() {
  const [data, setData] = useState<LciItem[]>([]);
  const [year, setYear] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const columns: ColumnDef<LciItem>[] = [
    {
      header: 'LCI 구분',
      accessorFn: row => {
        // LCI 구분 변환
        if (row.lciType === 'INPUT') return '입고';
        if (row.lciType === 'OUTPUT') return '출고';
        return row.lciType;
      },
      id: 'lciType',
    },
    {
      header: '명칭',
      accessorFn: row => row.itemName,
      id: 'itemName',
    },
    {
      header: '단위',
      accessorFn: row => row.unit,
      id: 'unit',
    },
    {
      header: '구성 유형',
      accessorFn: row => {
        switch (row.componentType) {
          case 'Valuable':
            return '유가물';
          case 'Part':
            return '부품';
          case 'Waste':
            return '폐기물';
          default:
            return row.componentType;
          }
        },
      id: 'componentType',
    },
  ];

  const fetchData = useCallback(async () => {
    if (!year) return;

    setLoading(true);

    try {
      const url = `https://lcaapi.acess.co.kr/LciItems?year=${year}`;
      const response = await axios.get<LciItem[]>(url);

      setData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('데이터 가져오기 오류:', error);
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    if (hasSearched) {
      fetchData();
    }
  }, [hasSearched, fetchData]);

  const handleSearch = () => {
    setYear(selectedYear);
    setHasSearched(true);
    setInitialLoad(false);  
  };

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setSelectedYear(event.target.value as string);
  };

  const table = useReactTable<LciItem>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        LCI 품목 관리
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
          style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleSearch}
          disabled={!selectedYear}
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
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: header.column.id === 'gwp' ? 'center' : 'left',
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