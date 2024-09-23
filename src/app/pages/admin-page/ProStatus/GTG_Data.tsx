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
  category: string;
  name: string;
  unit: string;
  totalAmount: number;
  [key: string]: string | number;
};

// type GTGItem = {
//   itemCode: string;
//   amount: number;
// };

type GTGResult = {
  lciItem: {
    category: string;
    name: string;
    unit: string;
  };
  totalAmount: number;
  gtoGByItems: {
    item: {
      itemCode: string;
      itemName: string;
    };
    amount: number;
  }[];
};

type WeightByItems = {
  itemName: string;
  ratio: number;
  totalWeight: number;
  weight: number;
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
    { accessorKey: 'totalAmount', header: '총값', cell: (info: CellContext<GTGData, unknown>) => numeral(info.getValue()).format('0,0') },
    ...data.length > 0
    ? Object.keys(data[0])
        .filter(key => !['category', 'name', 'unit', 'totalAmount'].includes(key))
        .map(itemCode => ({
          accessorKey: itemCode,
          header: itemCode,
          cell: (info: CellContext<GTGData, unknown>) => {
            const value = info.getValue();
  
            // 지수 표기법으로 나오는 숫자일 경우 처리
            if (typeof value === 'number' && value.toString().includes('e')) {
              return parseFloat(value.toFixed(10));  // 소수점 10자리로 고정, 필요시 조정
            }
  
            // 일반 숫자는 그대로 포맷팅
            return numeral(value).format('0,0.0000000000');
          },
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

    setLoading(true);  // 로딩 시작

    try {
      const url = `https://lcaapi.acess.co.kr/GToGResults?CompanyCode=${searchParams.company?.code}&Year=${searchParams.year}`;
      const response = await axios.get(url);
      console.log(response.data);  // 데이터 확인용 로그

      const { gtoGResults, weightByItems }: { gtoGResults: GTGResult[]; weightByItems: WeightByItems[] } = response.data;

      const transformedData = gtoGResults.map((item: GTGResult) => {
        const baseData: GTGData = {
          category: item.lciItem.category,
          name: item.lciItem.name,
          unit: item.lciItem.unit,
          totalAmount: item.totalAmount || 0,  // totalAmount가 없으면 0으로 처리
        };

        // gtoGByItems가 배열인지 체크하고 처리
        if (Array.isArray(item.gtoGByItems)) {
          item.gtoGByItems.forEach((subItem) => {
            baseData[subItem.item.itemName] = subItem.amount || 0;  // amount가 없으면 0 처리
          });
        }

        return baseData;
      });

      const transformedWeightByItems = Array.isArray(weightByItems)
        ? weightByItems.map((item: WeightByItems) => ({
            itemName: item.itemName,
            ratio: item.ratio,
            totalWeight: item.totalWeight,
            weight: item.weight,
          }))
        : [];

      setData(transformedData);
      setWeightByItems(transformedWeightByItems);
    } catch (error) {
      console.error('Error fetching GTG data:', error);
    } finally {
      setLoading(false);  // 요청 완료 후 로딩 종료
    }
  }, [searchParams]);

  const handleSearch = () => {
    // 조회 버튼을 누르면 로딩 상태가 true로 설정되고 fetchGTGData 호출
    setSearchParams({
      company: selectedCompany,
      year,
    });
    fetchGTGData();  // fetchGTGData에서 로딩 상태를 처리하므로 별도로 setLoading(true) 필요 없음
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
        // onClick={handleDownloadExcel}
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
                  {/* 처리비율 값 포맷팅 적용 */}
                  {item.ratio.toFixed(10)}
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
                  {numeral(item.weight).format('0,0.00000')}
                </TableCell>
              ))}
            </TableRow>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, index) => {
                  const leftValues = [0, 112, 287, 355]; 
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
                        position: 'sticky', 
                        top: 0, 
                        left: index < 4 ? leftValues[index] : 'auto', 
                        width: index === 0 ? '150px' : index === 1 ? '200px' : index === 2 ? '100px' : '120px', 
                        zIndex: index < 4 ? 100 : 1, 
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
                    const isRightAligned = cell.column.id === 'totalAmount' || !['category', 'name', 'unit', 'totalAmount'].includes(cell.column.id);
                    const leftValues = [0, 112, 287, 355];
                    
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