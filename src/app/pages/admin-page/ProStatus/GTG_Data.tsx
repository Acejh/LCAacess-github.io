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
  category: string;
  name: string;
  unit: string;
  amount: number;
  [key: string]: string | number;
};

type GTGItem = {
  itemCode: string;
  amount: number;
};

type GTGResult = {
  lciItem: {
    category: string;
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
    { accessorKey: 'category', header: '구분' },
    { accessorKey: 'name', header: '이름' },
    { accessorKey: 'unit', header: '단위' },
    { accessorKey: 'amount', header: '총값', cell: (info: CellContext<GTGData, unknown>) => numeral(info.getValue()).format('0,0') },
    ...data.length > 0
      ? Object.keys(data[0])
          .filter(key => !['category', 'name', 'unit', 'amount'].includes(key))
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

      const transformedData = gtoGResults.map((item: GTGResult) => {
        const baseData: GTGData = {
          category: item.lciItem.category,
          name: item.lciItem.name,
          unit: item.lciItem.unit,
          amount: item.amount,
        };

        item.gtoGByItems.forEach((subItem: GTGItem) => {
          baseData[subItem.itemCode] = subItem.amount;
        });

        return baseData;
      });

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
      <TableContainer component={Paper} style={{ maxHeight: 600, overflowY: 'auto', overflowX: 'auto' }} className="custom-scrollbar">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                colSpan={4}
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  backgroundColor: '#cfcfcf',
                  position: 'sticky',
                  left: 0,
                  zIndex: 5,
                  width: '200px',
                }}
              >
                처리제품
              </TableCell>
              {weightByItems.map((item, index) => (
                <TableCell
                  key={index}
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    backgroundColor: '#cfcfcf',
                    width: '200px',
                    zIndex: 0,
                  }}
                >
                  {item.itemName}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell
                colSpan={4}
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  backgroundColor: '#cfcfcf',
                  position: 'sticky',
                  left: 0,
                  zIndex: 5,
                  width: '200px',
                }}
              >
                처리비율(%)
              </TableCell>
              {weightByItems.map((item, index) => (
                <TableCell
                  key={index}
                  style={{
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    backgroundColor: '#cfcfcf',
                    width: '200px',
                    zIndex: 0,
                  }}
                >
                  {item.ratio}
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              <TableCell
                colSpan={4}
                style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  backgroundColor: '#cfcfcf',
                  position: 'sticky',
                  left: 0,
                  zIndex: 5,
                  width: '200px',
                }}
              >
                총 처리 중량(kg)
              </TableCell>
              {weightByItems.map((item, index) => (
                <TableCell
                  key={index}
                  style={{
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    backgroundColor: '#cfcfcf',
                    width: '200px',
                    zIndex: 0,
                  }}
                >
                  {item.totalWeight}
                </TableCell>
              ))}
            </TableRow>
            {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => {
                const leftValues = [0, 85, 260, 325]; // 각 열의 위치를 제어하기 위한 left 값
                return (
                  <TableCell
                    key={header.id}
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'center',
                      backgroundColor: '#cfcfcf',
                      fontWeight: 'bold',
                      position: 'sticky', // sticky로 변경하여 위아래로 스크롤 시 고정
                      top: 0, // 위아래 스크롤 시 고정 위치를 top으로 설정
                      left: index < 4 ? leftValues[index] : 'auto', // 좌우 스크롤 시 고정은 기존 설정 유지
                      width: index === 0 ? '150px' : index === 1 ? '200px' : index === 2 ? '100px' : '120px', // 열의 너비 설정
                      zIndex: index < 4 ? 100 : 1, // 좌우로 고정되는 열에 더 높은 zIndex 설정
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                );
              })}
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
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell, index) => {
                    const isRightAligned = cell.column.id === 'amount' || !['category', 'name', 'unit', 'amount'].includes(cell.column.id);
                    const leftValues = [0, 85, 260, 325];
                    return (
                      <TableCell
                        key={cell.id}
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          textAlign: isRightAligned ? 'right' : 'left',
                          position: index < 4 ? 'sticky' : 'static',
                          left: leftValues[index],
                          width: index === 0 ? '150px' : index === 1 ? '200px' : index === 2 ? '100px' : '120px',
                          backgroundColor: '#fff',
                          zIndex: 1,
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
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
