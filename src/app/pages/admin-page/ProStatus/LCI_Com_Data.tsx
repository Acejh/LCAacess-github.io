import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
  Autocomplete,
  TextField,
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
  category: string;
  flow: string;
  amount: number;
  functionalUnit: number;
  unit: string;
  gwp: number;
  gwpAlt: number;
  emissionWithBenefit: number;
  emissionWithoutBenefit: number;
  reductionEffect: number; 
  [key: string]: string | number;
};

type MidItem = {
  midItemCode: string;
  midItemName: string;
};

type ItemLcaCompany = {
  id: number;
  companyCode: string;
  companyName: string;
  amount: number;
};

type ItemLcaResult = {
  id: number;
  year: number;
  midItemCode: string;
  midItemName: string;
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
  reductionEffect: number;
  itemLcaCompanies: ItemLcaCompany[];
};

type NewAPIResponse = {
  companyNames: string[];
  itemLcaResults: ItemLcaResult[];
};

export function LCI_Com_Data() {
  const [data, setData] = useState<GTGData[]>([]);
  const [midItems, setMidItems] = useState<MidItem[]>([]);
  const [selectedMidItem, setSelectedMidItem] = useState<MidItem | null>(null);
  const [companyNames, setCompanyNames] = useState<string[]>([]);
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);

  const columns: ColumnDef<GTGData>[] = [
    { 
      id: 'category', 
      accessorKey: 'category', 
      header: '구분',
      cell: (info: CellContext<GTGData, unknown>) => <div style={{ textAlign: 'left' }}>{info.getValue() as React.ReactNode}</div>
    },
    { 
      id: 'flow', 
      accessorKey: 'flow', 
      header: 'Flow',
      cell: (info: CellContext<GTGData, unknown>) => <div style={{ textAlign: 'left' }}>{info.getValue() as React.ReactNode}</div>
    },
    { 
      id: 'amount', 
      accessorKey: 'amount', 
      header: 'SUM', 
      cell: (info: CellContext<GTGData, unknown>) => {
        const value = info.getValue();
        return Number(value) === 0 ? '-' : numeral(value).format('0,0.00000');
      }
    },
    {
      id: 'functionalUnit',
      accessorKey: 'functionalUnit',
      header: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>Functional</span>
          <span style={{ whiteSpace: 'nowrap' }}>Unit</span>
        </div>
      ),
      cell: (info: CellContext<GTGData, unknown>) => {
        const value = info.getValue();
        if (typeof value === 'number' && value === 0) {
          return '-';
        }
        if (typeof value === 'number') {
          return value.toExponential(5); 
        }
        return value; 
      },
    },
    { 
      id: 'unit', 
      accessorKey: 'unit', 
      header: 'Unit',
      cell: (info: CellContext<GTGData, unknown>) => <div style={{ textAlign: 'left' }}>{info.getValue() as React.ReactNode}</div>
    },
    // 이하 GWP, 배출량 열들은 오른쪽 정렬
    { 
      id: 'gwp', 
      accessorKey: 'gwp', 
      header: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>GWP</span>
          <span style={{ whiteSpace: 'nowrap' }}>유가물 재활용 공정</span>
        </div>
      ),
      cell: (info: CellContext<GTGData, unknown>) => {
        const value = info.getValue();
        return Number(value) === 0 ? '-' : (Number(value) || 0).toFixed(5);
      }
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
      cell: (info: CellContext<GTGData, unknown>) => {
        const value = info.getValue();
        return Number(value) === 0 ? '-' : (Number(value) || 0).toFixed(5);
      }
    },
    { 
      id: 'emissionWithoutBenefit',  
      accessorKey: 'emissionWithoutBenefit', 
      header: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>배출량</span>
          <span style={{ whiteSpace: 'nowrap' }}>w/o_benefit(B)</span>
        </div>
      ),
      cell: (info: CellContext<GTGData, unknown>) => {
        const value = info.getValue();
        return Number(value) === 0 ? '-' : (Number(value) || 0).toExponential(5);
      }
    },
    { 
      id: 'emissionWithBenefit',  
      accessorKey: 'emissionWithBenefit', 
      header: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>배출량</span>
          <span style={{ whiteSpace: 'nowrap' }}>w/_benefit(A)</span>
        </div>
      ),
      cell: (info: CellContext<GTGData, unknown>) => {
        const value = info.getValue();
        return Number(value) === 0 ? '-' : (Number(value) || 0).toExponential(5);
      }
    },
    { 
      id: 'reductionEffect', 
      accessorKey: 'reductionEffect', 
      header: () => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span>탄소배출</span>
          <span style={{ whiteSpace: 'nowrap' }}>저감효과(A-B)</span>
        </div>
      ),
      cell: (info: CellContext<GTGData, unknown>) => {
        const value = info.getValue();
        return Number(value) === 0 ? '-' : (Number(value) || 0).toFixed(5);
      }
    },
    ...companyNames.map((companyName) => ({
      id: companyName,
      accessorKey: companyName,
      header: companyName,
      cell: (info: CellContext<GTGData, unknown>) => {
        const value = info.getValue();
        return Number(value) === 0 ? '-' : numeral(value).format('0,0.00000');
      },
    })),
  ];

  const fetchMidItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get<MidItem[]>('https://lcaapi.acess.co.kr/Items/mid');
      setMidItems(response.data);
    } catch (error) {
      console.error('Error fetching mid items:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMidItems();
  }, [fetchMidItems]);

  const fetchData = useCallback(async () => {
    if (!selectedMidItem || !year) return;
  
    setLoading(true);
    try {
      const url = `https://lcaapi.acess.co.kr/LcaResults/mid-item?year=${year}&midItemCode=${selectedMidItem.midItemCode}`;
      const response = await axios.get<NewAPIResponse>(url);
  
      const { companyNames, itemLcaResults } = response.data;
  
      const transformedData = itemLcaResults.map((item: ItemLcaResult) => {
        const baseData: GTGData = {
          category: item.category,
          flow: item.flow,
          amount: item.amount,
          functionalUnit: item.functionalUnit,
          unit: item.unit,
          gwp: item.gwp,
          gwpAlt: item.gwpAlt,
          emissionWithBenefit: item.emissionWithBenefit,
          emissionWithoutBenefit: item.emissionWithoutBenefit,
          reductionEffect: item.reductionEffect,
        };
  
        item.itemLcaCompanies.forEach((company: ItemLcaCompany) => {
          baseData[company.companyName] = company.amount;
        });
  
        return baseData;
      });
  
      setData(transformedData);
      setCompanyNames(companyNames); 
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMidItem, year]);

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
      <Autocomplete
        options={midItems}
        getOptionLabel={(option) => option.midItemName}
        onChange={(event, value) => setSelectedMidItem(value)}
        isOptionEqualToValue={(option, value) => option.midItemCode === value?.midItemCode}
        loading={loading}
        sx={{
          width: '300px', 
          marginRight: '10px',
          '& .MuiInputBase-root': {
          height: '45px', 
        },
        }}
        ListboxProps={{
          style: {
            maxHeight: '300px', 
            overflowY: 'auto',
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="제품 선택"
            variant="outlined"
            sx={{
            }}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />
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
          disabled={!selectedMidItem || !year}
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
