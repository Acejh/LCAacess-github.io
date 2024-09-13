import React, { useState, useCallback } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../ComponentBox/UseCompany';
import numeral from 'numeral';
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
} from '@mui/material';
import * as XLSX from 'xlsx';

type GTGData = {
  type: string;
  name: string;
  unit: string;
  amount: number;
  [key: string]: string | number; // 동적 컬럼을 추가하기 위한 타입
};

type GTGItem = {
  itemCode: string;
  amount: number;
};

type GTGResult = {
  lciItem: {
    type: string;
    name: string;
    unit: string;
  };
  amount: number;
  gtoGByItems: GTGItem[];
};

type WeightByItems = {
  itemName: string;
  ratio: number;
  totalWeight: number;
};

export function GTG_Data() {
  const [data, setData] = useState<GTGData[]>([]);
  const [weightByItems, setWeightByItems] = useState<WeightByItems[]>([]);
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchParams, setSearchParams] = useState({
    company: null as Company | null,
    year: '',
  });

  const columns: ColumnDef<GTGData>[] = [
    { accessorKey: 'type', header: '구분' },
    { accessorKey: 'name', header: '이름' },
    { accessorKey: 'unit', header: '단위' },
    { accessorKey: 'amount', header: '총값', cell: (info: CellContext<GTGData, unknown>) => numeral(info.getValue()).format('0,0') },
    ...data.length > 0
      ? Object.keys(data[0])
          .filter(key => !['type', 'name', 'unit', 'amount'].includes(key)) // 필터링해서 동적 헤더 생성
          .map(itemCode => ({
            accessorKey: itemCode,
            header: itemCode,
            cell: (info: CellContext<GTGData, unknown>) => numeral(info.getValue()).format('0,0'),
          }))
      : [],
  ];

  const fetchGTGData = useCallback(async () => {
    if (!searchParams.company || !searchParams.year) {
      setData([]);
      setWeightByItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const url = `https://lcaapi.acess.co.kr/GToGResults?CompanyCode=${searchParams.company?.code}&Year=${searchParams.year}`;
      const response = await axios.get(url);
      const { gtoGResults, weightByItems }: { gtoGResults: GTGResult[]; weightByItems: WeightByItems[] } = response.data;

      // 데이터 변환
      const transformedData = gtoGResults.map((item: GTGResult) => {
        const baseData: GTGData = {
          type: item.lciItem.type,
          name: item.lciItem.name,
          unit: item.lciItem.unit,
          amount: item.amount,
        };

        // gtoGByItems의 itemCode와 amount를 동적으로 추가
        item.gtoGByItems.forEach((subItem: GTGItem) => {
          baseData[subItem.itemCode] = subItem.amount;
        });

        return baseData;
      });

      // weightByItems에서 itemName, ratio, totalWeight 추출
      const transformedWeightByItems = weightByItems.map((item: WeightByItems) => ({
        itemName: item.itemName,
        ratio: item.ratio,
        totalWeight: item.totalWeight,
      }));

      setData(transformedData);
      setWeightByItems(transformedWeightByItems);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching GTG data:', error);
      setLoading(false);
    }
  }, [searchParams]);

  const handleDownloadExcel = () => {
    const tableData = table.getRowModel().rows.map(row => row.original);
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'GTGResults');
    XLSX.writeFile(workbook, 'GTGResults.xlsx');
  };

  const handleSearch = () => {
    setSearchParams({
      company: selectedCompany,
      year,
    });
    setLoading(true);
    fetchGTGData();
  };

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setYear(event.target.value as string);
  };

  const table = useReactTable<GTGData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        GTG 결과
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
          style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleSearch}
          disabled={!selectedCompany || !year}
        >
          조회
        </Button>
      </div>
      <TableContainer
        component={Paper}
        style={{ maxHeight: 600, overflowY: 'auto' }}
        className="custom-scrollbar"
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell colSpan={4} style={{ textAlign: 'center', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', backgroundColor: '#cfcfcf' }}>
                처리제품
              </TableCell>
              {weightByItems.map((item, index) => (
                <TableCell key={index} style={{ textAlign: 'center', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', backgroundColor: '#cfcfcf' }}>
                  {item.itemName}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell colSpan={4} style={{ textAlign: 'center', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', backgroundColor: '#cfcfcf' }}>
                처리비율
              </TableCell>
              {weightByItems.map((item, index) => (
                <TableCell key={index} style={{ textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', backgroundColor: '#cfcfcf' }}>
                  {item.ratio}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell colSpan={4} style={{ textAlign: 'center', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', backgroundColor: '#cfcfcf' }}>
                총 처리 중량
              </TableCell>
              {weightByItems.map((item, index) => (
                <TableCell key={index} style={{ textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', backgroundColor: '#cfcfcf' }}>
                  {item.totalWeight}
                </TableCell>
              ))}
            </TableRow>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableCell 
                      key={header.id} 
                      style={{ 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        textAlign: 'center',
                        backgroundColor: '#cfcfcf', 
                        fontWeight: 'bold',
                      }}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={weightByItems.length + 3} style={{ textAlign: 'center' }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={weightByItems.length + 3} style={{ textAlign: 'center', color: 'red' }}>
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
