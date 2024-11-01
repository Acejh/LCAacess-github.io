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

type GTGData = {
  type: string;
  category: string;
  amount: number;
  functionalUnit: number;
  unit: string;
  gwp: number;
  gwpAlt: number;
  emissionWithBenefit: number;
  emissionWithoutBenefit: number;
  [key: string]: string | number;
};

type MidItem = {
  midItemCode: string;
  midItemName: string;
};

type LCAItem = {
  id: number;
  midItemCode: string;
  midItemName: string;
  amount: number;
};

type LCAResult = {
  id: number;
  year: number;
  companyCode: string;
  companyName: string;
  type: string;
  category: string;
  flow: string;
  amount: number;
  functionalUnit: number;
  unit: string;
  gwp: number;
  gwpAlt: number;
  emissionWithBenefit: number;
  emissionWithoutBenefit: number;
  lcaItems: LCAItem[];
};

type APIResponse = {
  midItems: MidItem[];
  lcaResults: LCAResult[];
};

export function LCI_Data() {
  const [data, setData] = useState<GTGData[]>([]);
  const [midItems, setMidItems] = useState<MidItem[]>([]);
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const columns: ColumnDef<GTGData>[] = [
    { id: 'type', accessorKey: 'type', header: '구분' },
    { id: 'category', accessorKey: 'category', header: '이름' },
    { id: 'amount', accessorKey: 'amount', header: '총값', cell: (info: CellContext<GTGData, unknown>) => numeral(info.getValue()).format('0,0.00000') },
    { 
      id: 'functionalUnit', 
      accessorKey: 'functionalUnit', 
      header: 'functionalunit', 
      cell: (info: CellContext<GTGData, unknown>) => {
        const value = info.getValue();
        if (typeof value === 'number') {
          // 숫자인 경우 toLocaleString으로 포맷
          return value.toLocaleString(undefined, { minimumFractionDigits: 10, maximumFractionDigits: 10 });
        }
        // 숫자가 아닌 경우 numeral로 포맷
        return numeral(value).format('0,0.0000000000');
      }
    },
    { id: 'unit', accessorKey: 'unit', header: '단위' },
    { 
      id: 'gwp', 
      accessorKey: 'gwp', 
      header: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>GWP</span>
          <span style={{ whiteSpace: 'nowrap' }}>유가물 재활용 공정</span>
        </div>
      ),
      cell: (info: CellContext<GTGData, unknown>) => (Number(info.getValue()) || 0).toFixed(5)
    },
    { 
      id: 'gwpAlt', 
      accessorKey: 'gwpAlt', 
      header: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>GWP</span>
          <span style={{ whiteSpace: 'nowrap' }}>유가물 대체효과</span>
        </div>
      ),
      cell: (info: CellContext<GTGData, unknown>) => (Number(info.getValue()) || 0).toFixed(5) 
    },
    { 
      id: 'emissionWithBenefit',  
      accessorKey: 'emissionWithBenefit', 
      header: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>배출량</span>
          <span style={{ whiteSpace: 'nowrap' }}>w/_benefit</span>
        </div>
      ),
      cell: (info: CellContext<GTGData, unknown>) => (Number(info.getValue()) || 0).toExponential(5) 
    },
    { 
      id: 'emissionWithoutBenefit',  
      accessorKey: 'emissionWithoutBenefit', 
      header: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>배출량</span>
          <span style={{ whiteSpace: 'nowrap' }}>w/o_benefit</span>
        </div>
      ), 
      cell: (info: CellContext<GTGData, unknown>) => (Number(info.getValue()) || 0).toExponential(5) 
    },
    ...midItems.map((item) => ({
      id: item.midItemCode,
      accessorKey: item.midItemCode,
      header: item.midItemName,
      cell: (info: CellContext<GTGData, unknown>) => numeral(info.getValue()).format('0,0.00000')
    }))
  ];

  const fetchData = useCallback(async () => {
    if (!selectedCompany || !year) return;

    setLoading(true);
    try {
      const url = `https://lcaapi.acess.co.kr/LcaResults?companyCode=${selectedCompany.code}&year=${year}`;
      const response = await axios.get<APIResponse>(url);  
      
      const { midItems, lcaResults } = response.data;

      const transformedData = lcaResults.map((item: LCAResult) => {
        const baseData: GTGData = {
          type: item.type,
          category: item.category,
          amount: item.amount,
          functionalUnit: item.functionalUnit,
          unit: item.unit,
          gwp: item.gwp,
          gwpAlt: item.gwpAlt,
          emissionWithBenefit: item.emissionWithBenefit,
          emissionWithoutBenefit: item.emissionWithoutBenefit,
        };
        
        midItems.forEach(({ midItemCode }) => {
          baseData[midItemCode] = 0;
        });

        item.lcaItems.forEach((subItem: LCAItem) => {
          baseData[subItem.midItemCode] = subItem.amount;
        });
        
        return baseData;
      });

      setData(transformedData);
      setMidItems(midItems);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCompany, year]);

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setYear(event.target.value as string);
  };

  const handleSearch = () => {
    fetchData();
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
        LCA 결과(종합,사업회원)
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <UseCompany onCompanyChange={setSelectedCompany} showGeneralOption={true} />
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
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    style={{
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      textAlign: 'center',
                      backgroundColor: '#cfcfcf',
                      fontWeight: 'bold',
                      position: 'sticky',
                      top: 0,
                      zIndex: 100,
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
                <TableCell colSpan={columns.length} style={{ textAlign: 'center' }}>
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
                        textAlign: 'right',
                        backgroundColor: '#fff',
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} style={{ textAlign: 'center', color: 'red' }}>
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
