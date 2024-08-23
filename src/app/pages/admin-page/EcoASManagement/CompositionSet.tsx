import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
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

type CompositionData = {
  componentType: string; 
  componentName: string;
  [key: string]: number | string; 
};

export function CompositionSet() {
  const [data, setData] = useState<CompositionData[]>([]);
  const [year, setYear] = useState('');         
  const [selectedYear, setSelectedYear] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [columns, setColumns] = useState<ColumnDef<CompositionData>[]>([
    { accessorKey: 'componentType', header: '구분' },
    { accessorKey: 'componentName', header: '구성품' },
  ]);

  const item1Ref = useRef<HTMLTableCellElement>(null);
  const item2Ref = useRef<HTMLTableCellElement>(null);

  const [leftOffsets, setLeftOffsets] = useState({
    item2: 0,
  });

  const fetchData = useCallback(async () => {
    if (!year) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const url = `https://lcaapi.acess.co.kr/Compositions?Year=${year}`;
      const response = await axios.get(url);
      const { columns: productColumns = [], list = [] } = response.data;

      // 동적으로 추가된 컬럼이 없으면 초기화
      if (!productColumns.length || !list.length) {
        setColumns([
          { accessorKey: 'componentType', header: '구분' },
          { accessorKey: 'componentName', header: '구성품' },
        ]);
        setData([]);
        setLoading(false);
        return;
      }

      // 새로운 컬럼을 동적으로 추가
      const dynamicColumns = productColumns.map((product: string) => ({
        accessorKey: product,
        header: () => (
          <div style={{ textAlign: 'center' }}>{product}</div>
        ),
        cell: (info: CellContext<CompositionData, unknown>) =>
          numeral(info.getValue() as number * 100).format('0,0.00000') + '%',
      }));

      // 기존의 구분 및 구성품 컬럼과 동적으로 생성된 컬럼 합침
      setColumns([
        { accessorKey: 'componentType', header: '구분' },
        { accessorKey: 'componentName', header: '구성품' },
        ...dynamicColumns,
      ]);

      // 데이터 변환
      const transformedData = list.map((item: {
        componentType: string;
        componentName: string;
        compositions: {
          itemName: string;
          percentage: number;
        }[];
      }) => {
        const rowData: { [key: string]: number | string } = {
          componentType: item.componentType,
          componentName: item.componentName,
        };
        item.compositions.forEach((composition) => {
          rowData[composition.itemName] = composition.percentage;
        });
        return rowData;
      });

      setData(transformedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    if (hasSearched) {
      fetchData();
    }
  }, [hasSearched, fetchData]); 

  useEffect(() => {
    const updateOffsets = () => {
      const item1Width = item1Ref.current?.offsetWidth || 0;
      setLeftOffsets({
        item2: item1Width,
      });
    };
    updateOffsets();
    window.addEventListener('resize', updateOffsets);
    return () => {
      window.removeEventListener('resize', updateOffsets);
    };
  }, [data]);

  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get(`https://lcaapi.acess.co.kr/Compositions/export?year=${year}`, {
        responseType: 'blob', 
      });
  
      // Content-Disposition에서 filename 추출
      const contentDisposition = response.headers['content-disposition'];
      let filename = 'download.xlsx'; // 기본 파일 이름
  
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+?)($|;|\s)/);
        if (filenameMatch?.[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        } else {
          const simpleFilenameMatch = contentDisposition.match(/filename="?(.+?)($|;|\s)"/);
          if (simpleFilenameMatch?.[1]) {
            filename = simpleFilenameMatch[1];
          }
        }
      }
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a'); 
      link.href = url;
    
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
    
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
    }
  };

  const handleSearch = () => {
    setYear(selectedYear);  
    setHasSearched(true);
    setInitialLoad(false);
    fetchData(); 
  };

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setSelectedYear(event.target.value as string);  
  };

  const table = useReactTable<CompositionData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    autoResetPageIndex: false,
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        구성비율 관리
      </Typography>
      <Button
        variant="contained"
        color="secondary"
        style={{ height: '35px', marginBottom: '20px', padding: '0 10px', fontSize: '14px' }}
        onClick={handleDownloadExcel}
      >
        엑셀 다운로드
      </Button>
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
          style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px'}}
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
                        ref={
                          header.column.id === 'componentType'
                            ? item1Ref
                            : header.column.id === 'componentName'
                            ? item2Ref
                            : undefined
                        }
                        style={{ 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          position: 'sticky', 
                          top: 0, 
                          left: 
                            header.column.id === 'componentType'
                              ? 0
                              : header.column.id === 'componentName'
                              ? `${leftOffsets.item2}px` 
                              : undefined,
                          zIndex: ['componentType', 'componentName'].includes(header.column.id) ? 3 : 2,
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
                      연도를 선택하여 조회해주십시오.
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
                            textAlign: ['componentType', 'componentName'].includes(cell.column.id)
                              ? 'left'
                              : 'right',
                            position: ['componentType', 'componentName'].includes(cell.column.id)
                              ? 'sticky'
                              : 'static',
                            left:
                              cell.column.id === 'componentType'
                                ? 0
                                : cell.column.id === 'componentName'
                                ? `${leftOffsets.item2}px`
                                : undefined,
                            zIndex: ['componentType', 'componentName'].includes(cell.column.id) ? 2 : 1,
                            backgroundColor: ['componentType', 'componentName'].includes(cell.column.id)
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