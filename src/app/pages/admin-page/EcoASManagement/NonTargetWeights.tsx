import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../ComponentBox/UseCompany';
import numeral from 'numeral';
import '../../CSS/SCbar.css';
import { CellContext } from '@tanstack/react-table';
import { SelectChangeEvent } from '@mui/material';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
  Updater,
  PaginationState,
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
  Modal,
  Box,
  TextField,
  InputLabel,
} from '@mui/material';

type WeightPayload = {
  companyCode: string | undefined;
  year: string;
  month: string;
  weight: number;
};

type WeightData = {
  id: number;
  companyCode: string;
  companyName: string;
  year: number;
  month: number;
  weight: number;
  totalWeight: number;
};

const columns: ColumnDef<WeightData>[] = [
  { accessorKey: 'companyName', header: '업체명' },
  ...Array.from({ length: 12 }, (_, i) => ({
    accessorKey: `month_${i + 1}`,
    header: () => (
      <div style={{ textAlign: 'center' }}>
        {i + 1}월 (kg)
      </div>
    ),
    cell: (info: CellContext<WeightData, unknown>) => numeral(info.getValue()).format('0,0'),
  })),
  { 
    accessorKey: 'totalWeight', 
    header: '계 (kg)',
    cell: (info: CellContext<WeightData, unknown>) => numeral(info.getValue()).format('0,0'), 
  },
];

export function NonTargetWeights() {
  const [data, setData] = useState<WeightData[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 상태
  const [modalType, setModalType] = useState<'register' | 'edit' | null>(null); // 모달 타입 (등록 or 수정)
  const [modalData, setModalData] = useState({
  company: null as Company | null,
  year: '',
  month: '',
  weight: '',
}); // 모달에 사용할 데이터
  const [searchParams, setSearchParams] = useState({
    company: null as Company | null,
    year: '',
  });

  const fetchData = useCallback(async (pageIndex: number, pageSize: number) => {
    if (!searchParams.company || !searchParams.year) {
        setData([]);
        setTotalCount(0);
        setLoading(false);
        return;
    }

    setLoading(true);

    try {
        const url = `https://lcaapi.acess.co.kr/NonTargetWeights?page=${pageIndex + 1}&pageSize=${pageSize}&companyCode=${searchParams.company.code}&year=${searchParams.year}`;
        const response = await axios.get(url);
        const { list, totalCount } = response.data;

        const transformedData = list.map((item: {
          companyName: string;
          monthlyWeights: number[];
          totalWeight: number;
        }) => {
            const monthlyData: { companyName: string; totalWeight: number; [key: string]: number | string } = { 
                companyName: item.companyName, 
                totalWeight: item.totalWeight // totalWeight 추가
            };
            item.monthlyWeights.forEach((weight: number, index: number) => {
                monthlyData[`month_${index + 1}`] = weight;
            });
            return monthlyData;
        });

        setData(transformedData);
        setTotalCount(totalCount);
        setLoading(false);
    } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
    }
}, [searchParams]);

  useEffect(() => {
    if (hasSearched) {
      fetchData(pageIndex, pageSize);
    }
  }, [pageIndex, pageSize, fetchData, hasSearched]);

  const totalPages = Math.ceil(totalCount / pageSize);

  //엑셀 다운로드
  const handleDownloadExcel = async () => {
    if (!selectedCompany) {
      console.error('회사를 선택해 주세요.');
      return;
    }
  
    setDownloading(true); // 다운로드 시작
  
    try {
      let url = `https://lcaapi.acess.co.kr/NonTargetWeights/export?companyCode=${selectedCompany.code}`;
  
      // Optional parameters
      if (year) url += `&year=${year}`;
  
      const response = await axios.get(url, {
        responseType: 'blob',
        timeout: 180000, // 3분 타임아웃 설정
      });
  
      const contentDisposition = response.headers['content-disposition'];
      let filename = '수집운반_관리표.xlsx'; // 기본 파일 이름
  
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?UTF-8['"]?''(.+?)['"]?(;|$)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1]);
        } else {
          const simpleFilenameMatch = contentDisposition.match(/filename="?(.+?)['"]?(;|$)/);
          if (simpleFilenameMatch && simpleFilenameMatch[1]) {
            filename = simpleFilenameMatch[1];
          }
        }
      }
  
      const blob = new Blob([response.data]);
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('엑셀 파일 다운로드 중 오류 발생:', error);
    } finally {
      setDownloading(false); // 다운로드 완료
    }
  };

  const handleSearch = () => {
    setSearchParams({
      company: selectedCompany,
      year,
    });
    setPageIndex(0);
    setHasSearched(true);
    setInitialLoad(false);
    setLoading(true);
    fetchData(0, pageSize); 
  };

  const postWeightData = async (data: WeightPayload) => {
    try {
      await axios.post(`https://lcaapi.acess.co.kr/NonTargetWeights`, data);
      alert('등록이 완료되었습니다.');
      setIsModalOpen(false);
      handleSearch(); // 등록 후 데이터 다시 조회
    } catch (error) {
      alert('등록 중 오류가 발생했습니다.');
    }
  };
  
  const putWeightData = async (data: WeightPayload) => {
    try {
      await axios.put(`https://lcaapi.acess.co.kr/NonTargetWeights`, data);
      alert('수정이 완료되었습니다.');
      setIsModalOpen(false);
      handleSearch(); // 수정 후 데이터 다시 조회
    } catch (error) {
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  const handlePaginationChange = (updater: Updater<PaginationState>) => {
    if (typeof updater === 'function') {
      const newState = updater({ pageIndex, pageSize });
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
      fetchData(newState.pageIndex, newState.pageSize);
    } else {
      const newPageIndex = updater.pageIndex ?? pageIndex;
      const newPageSize = updater.pageSize ?? pageSize;
      setPageIndex(newPageIndex);
      setPageSize(newPageSize);
      fetchData(newPageIndex, newPageSize);
    }
  };

  const table = useReactTable<WeightData>({
    data,
    columns,
    pageCount: totalPages,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    manualPagination: true,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
  });

  useEffect(() => {
    const fetchWeightData = async () => {
      if (modalType === 'edit' && modalData.company && modalData.year && modalData.month) {
        try {
          const response = await axios.get(
            `https://lcaapi.acess.co.kr/NonTargetWeights?companyCode=${modalData.company.code}&year=${modalData.year}`
          );
          const monthlyWeights = response.data.list[0]?.monthlyWeights || [];
          const monthWeight = monthlyWeights[parseInt(modalData.month, 10) - 1] || 0;
  
          setModalData((prev) => ({
            ...prev,
            weight: monthWeight.toString(),
          }));
        } catch (error) {
          console.error('Error fetching weight data:', error);
        }
      }
    };
  
    fetchWeightData();
  }, [modalData.company, modalData.year, modalData.month, modalType]); 

  const renderPageNumbers = () => {
    const startPage = Math.floor(pageIndex / 5) * 5;
    const endPage = Math.min(startPage + 5, totalPages);

    return Array.from({ length: endPage - startPage }, (_, i) => startPage + i).map((number) => (
      <Button
        key={number}
        variant={pageIndex === number ? 'contained' : 'outlined'}
        color="primary"
        style={{ marginRight: '5px', minWidth: '30px', padding: '5px' }}
        onClick={() => {
          table.setPageIndex(number);
        }}
      >
        {number + 1}
      </Button>
    ));
  };

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setYear(event.target.value as string);
  };

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        비대상제품 입고량
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <UseCompany onCompanyChange={setSelectedCompany} label = '업체 선택' />
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

        <Button
          variant="contained"
          color="primary"
          style={{ height: '35px',  padding: '0 10px', fontSize: '14px' }}
          onClick={() => {
            setModalType('register');
            setModalData({ company: selectedCompany, year, month: '', weight: '' });
            setIsModalOpen(true);
          }}
          disabled={!selectedCompany || !year}
        >
          등록
        </Button>
        <Button
          variant="contained"
          color="secondary"
          style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px' }}
          onClick={() => {
            if (!selectedCompany || !year || !searchParams.company) return;
            setModalType('edit');
            setIsModalOpen(true);

            // 업체 및 연도 정보 설정
            setModalData((prev) => ({
              ...prev,
              company: selectedCompany,
              year,
              month: '',
              weight: '',
            }));
          }}
          disabled={!selectedCompany || !year}
        >
          수정
        </Button>

        <Button
          variant="contained"
          color="secondary"
          style={{ height: '35px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleDownloadExcel}
          disabled={
            !selectedCompany || 
            !year ||
            downloading || 
            (selectedCompany.name === '전체' || selectedCompany.name === '공통')
          }
        >
          {downloading ? '다운로드 중...' : '엑셀 다운로드'}
        </Button>
      </div>
      <TableContainer
        component={Paper}
        style={{ maxHeight: 545, overflowY: 'auto' }}
        className="custom-scrollbar custom-table"
      >
        <Table>
          {loading ? (
            <TableBody>
              <TableRow>
                <TableCell colSpan={13} style={{ textAlign: 'center' }}>
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
                          position: 'sticky', 
                          top: 0, 
                          backgroundColor: '#cfcfcf', 
                          zIndex: 1 
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
                    <TableCell colSpan={13} style={{ textAlign: 'center', color: 'red' }}>
                      조회하여 주십시오.
                    </TableCell>
                  </TableRow>
                ) : loading ? (
                  <TableRow>
                    <TableCell colSpan={13} style={{ textAlign: 'center' }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell 
                          key={cell.id} 
                          style={{ 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            textAlign: ['companyName'].includes(cell.column.id) ? 'left' : 'right', 
                          }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={13} style={{ textAlign: 'center', color: 'red' }}>
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </>
          )}
        </Table>
      </TableContainer>
      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Button onClick={() => table.setPageIndex(pageIndex - 1)} disabled={!table.getCanPreviousPage()} variant="contained" color="primary" style={{ marginRight: '10px' }}>
            이전
          </Button>
          <Button onClick={() => table.setPageIndex(pageIndex + 1)} disabled={!table.getCanNextPage()} variant="contained" color="primary">
            다음
          </Button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
          <Button onClick={() => table.setPageIndex(0)} disabled={pageIndex === 0} variant="contained" color="primary" style={{ marginRight: '10px', minWidth: '30px', padding: '5px', width: 50 }}>
            처음
          </Button>
          <Button onClick={() => table.setPageIndex(Math.max(0, pageIndex - 5))} disabled={pageIndex < 5} variant="contained" color="warning" style={{ marginRight: '15px', minWidth: '30px', padding: '5px' }}>
            -5
          </Button>
          {renderPageNumbers()}
          <Button onClick={() => table.setPageIndex(Math.min(table.getPageCount() - 1, pageIndex + 5))} disabled={pageIndex >= table.getPageCount() - 5} variant="contained" color="warning" style={{ marginLeft: '10px', minWidth: '30px', padding: '5px' }}>
            +5
          </Button>
          <Button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={pageIndex === table.getPageCount() - 1} variant="contained" color="primary" style={{ marginLeft: '10px', minWidth: '30px', padding: '5px', width: 50 }}>
            끝
          </Button>
        </div>
        <div>
          <Typography variant="body1" component="span" style={{ marginRight: '10px' }}>
            Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </Typography>
          <Select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20, 30, 40, 50].map(pageSize => (
              <MenuItem key={pageSize} value={pageSize}>
                Show {pageSize}
              </MenuItem>
            ))}
          </Select>
        </div>
      </div>
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            width: 400,
          }}
        >
          <Typography variant="h6" gutterBottom>
            {modalType === 'register' ? '등록' : '수정'} 모달
          </Typography>

          <UseCompany
            onCompanyChange={(company) =>
              setModalData((prev) => ({
                ...prev,
                company,
                weight: '', // 업체 변경 시 무게 초기화
              }))
            }
            label="업체 선택"
            selectedCompany={modalData.company}
            showAllOption={false}
          />
        <FormControl fullWidth margin="normal">
          <InputLabel id="year-select-label">연도</InputLabel>
          <Select
            labelId="year-select-label"
            label="연도"
            id="year-select"
            value={modalData.year}
            onChange={(e) =>
              setModalData((prev) => ({
                ...prev,
                year: e.target.value,
                weight: '', // 연도 변경 시 무게 초기화
              }))
            }
            displayEmpty
          >
            {Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()).map(
              (year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="month-select-label">월</InputLabel>
          <Select
            labelId="month-select-label"
            label="월"
            id="month-select"
            value={modalData.month}
            onChange={(e) =>
              setModalData((prev) => ({
                ...prev,
                month: e.target.value,
                weight: '', // 월 변경 시 무게 초기화
              }))
            }
            displayEmpty
          >
            {Array.from({ length: 12 }, (_, i) => (
              <MenuItem key={i + 1} value={(i + 1).toString()}>
                {i + 1}월
              </MenuItem>
            ))}
          </Select>
        </FormControl>
          <TextField
            label="무게 (kg)"
            fullWidth
            margin="normal"
            value={modalData.weight}
            onChange={(e) => setModalData((prev) => ({ ...prev, weight: e.target.value }))}
          />

          <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              const payload: WeightPayload = {
                companyCode: modalData.company?.code,
                year: modalData.year,
                month: modalData.month,
                weight: parseFloat(modalData.weight), // 무게를 숫자로 변환
              };

              if (modalType === 'register') {
                // 등록 API 호출
                postWeightData(payload);
              } else if (modalType === 'edit') {
                // 수정 API 호출
                putWeightData(payload);
              }
            }}
          >
            저장
          </Button>
            <Button onClick={() => setIsModalOpen(false)} sx={{ ml: 2 }}>
              취소
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}