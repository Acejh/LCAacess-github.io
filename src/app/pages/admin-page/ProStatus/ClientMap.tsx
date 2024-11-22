import React, { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import UseCompany, { Company } from '../../ComponentBox/UseCompany';
import '../../CSS/SCbar.css';
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
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';

// 데이터 타입 정의
type ExtraClientMapData = {
  companyCode: string; // 업체 코드
  lciItemName: string; // 품목3
  clientName: string; // 2차 거래처
  id: number; // 보유용
  clientId: number; // 보유용
};

type ClientData = {
  id: number;
  name: string;
  address: string;
};

type LciItemData = {
  name: string;
};

type CompanyData = {
  code: string; // 업체 코드
  name: string; // 업체 이름
};

export function ClientMap() {
  const [data, setData] = useState<ExtraClientMapData[]>([]); // 테이블에 표시될 데이터
  const [companyMap, setCompanyMap] = useState<Record<string, string>>({}); // 업체 코드 -> 이름 매핑
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null); // 선택된 업체
  const [hasSearched, setHasSearched] = useState(false); // 조회 버튼 클릭 여부

  const [clientList, setClientList] = useState<ClientData[]>([]); // 2차 거래처 목록
  const [lciItems, setLciItems] = useState<LciItemData[]>([]); // LCI 항목 목록

  const [deleteModalOpen, setDeleteModalOpen] = useState(false); // 삭제 모달 상태
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null); // 삭제 대상 ID

  const [editModalOpen, setEditModalOpen] = useState(false); // 수정 모달 상태
  const [editData, setEditData] = useState<Partial<ExtraClientMapData> | null>(null); // 수정 대상 데이터


  const [mappingModalOpen, setMappingModalOpen] = useState(false); // 모달 상태
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null); // 선택된 2차 거래처 ID
  const [selectedLciItem, setSelectedLciItem] = useState<string | null>(null); // 선택된 LCI 항목

  // 업체 데이터를 가져와 매핑 생성
  const fetchCompanies = useCallback(async () => {
    try {
      const response = await axios.get('https://lcaapi.acess.co.kr/Companies');
      const { list } = response.data;

      // 업체 코드 -> 이름 매핑 생성
      const mapping: Record<string, string> = {};
      list.forEach((company: CompanyData) => {
        mapping[company.code] = company.name;
      });

      setCompanyMap(mapping);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // 조회 버튼 클릭 시 데이터 가져오기
  const fetchData = useCallback(async () => {
    if (!selectedCompany) {
      setData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const url = `https://lcaapi.acess.co.kr/ExtraClientMaps?companyCode=${selectedCompany.code}`;
      const response = await axios.get(url);
      const { list } = response.data;

      setData(list); // 조회된 데이터 반영
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setLoading(false);
    }
  }, [selectedCompany]);

  const handleSearch = () => {
    if (selectedCompany) {
      setHasSearched(true);
      fetchData();
    }
  };

  const fetchClients = useCallback(async () => {
    try {
      const response = await axios.get('https://lcaapi.acess.co.kr/ExtraClientMaps/clients');
      setClientList(response.data.list);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  }, []);

  const fetchLciItems = useCallback(async () => {
    try {
      const response = await axios.get('https://lcaapi.acess.co.kr/ExtraClientMaps/lci-items');
      setLciItems(response.data.list);
    } catch (error) {
      console.error('Error fetching LCI items:', error);
    }
  }, []);

  useEffect(() => {
    fetchClients();
    fetchLciItems();
  }, [fetchClients, fetchLciItems]);

  const handleOpenMappingModal = () => {
    setMappingModalOpen(true);
  };

  const handleCloseMappingModal = () => {
    setMappingModalOpen(false);
    setSelectedClientId(null);
    setSelectedLciItem(null);
  };

  const handleRegisterMapping = async () => {
    if (!selectedCompany || !selectedClientId || !selectedLciItem) {
      alert('모든 항목을 선택해주세요.');
      return;
    }

    try {
      const payload = {
        companyCode: selectedCompany.code,
        lciItemName: selectedLciItem,
        clientId: selectedClientId,
      };

      await axios.post('https://lcaapi.acess.co.kr/ExtraClientMaps', payload);
      alert('매핑이 성공적으로 등록되었습니다.');
      handleCloseMappingModal();
      fetchData(); // 데이터 갱신
    } catch (error) {
      console.error('Error registering mapping:', error);
      alert('매핑 등록에 실패했습니다.');
    }
  };

  const handleOpenEditModal = (rowData: ExtraClientMapData) => {
    setEditData(rowData); // 기존 데이터를 수정 모달에 설정
    setEditModalOpen(true);
  };
  
  const handleCloseEditModal = () => {
    setEditData(null);
    setEditModalOpen(false);
  };
  
  const handleEditSubmit = async () => {
    if (!editData || !editData.id || !editData.lciItemName || !editData.clientId) {
      alert('모든 항목을 선택해주세요.');
      return;
    }
  
    try {
      const payload = {
        lciItemName: editData.lciItemName,
        clientId: editData.clientId,
      };
  
      await axios.put(`https://lcaapi.acess.co.kr/ExtraClientMaps/${editData.id}`, payload);
      alert('수정이 완료되었습니다.');
      handleCloseEditModal();
      fetchData(); // 데이터 갱신
    } catch (error) {
      console.error('Error updating mapping:', error);
      alert('수정에 실패했습니다.');
    }
  };

  const handleOpenDeleteModal = (id: number) => {
    setDeleteTargetId(id);
    setDeleteModalOpen(true);
  };
  
  const handleCloseDeleteModal = () => {
    setDeleteTargetId(null);
    setDeleteModalOpen(false);
  };
  
  const handleDelete = async () => {
    if (!deleteTargetId) return;
  
    try {
      await axios.delete(`https://lcaapi.acess.co.kr/ExtraClientMaps/${deleteTargetId}`);
      alert('삭제가 완료되었습니다.');
      handleCloseDeleteModal();
      fetchData(); // 데이터 갱신
    } catch (error) {
      console.error('Error deleting mapping:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const columns: ColumnDef<ExtraClientMapData>[] = [
    {
      accessorKey: 'companyCode',
      header: '업체',
      cell: ({ getValue }) => companyMap[getValue<string>()] || getValue<string>(), 
    },
    { accessorKey: 'lciItemName', header: '품목3' },
    { accessorKey: 'clientName', header: '2차 거래처' },
    {
      id: 'actions',
      header: '수정/삭제',
      cell: ({ row }) => (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => handleOpenEditModal(row.original)}
          >
            수정
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={() => handleOpenDeleteModal(row.original.id)}
          >
            삭제
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable<ExtraClientMapData>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom>
        유가물 2차 거래처 매핑 관리
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <UseCompany onCompanyChange={setSelectedCompany} showAllOption={false} />
        <Button
          variant="contained"
          color="primary"
          style={{ margin: '0 10px' }}
          onClick={handleSearch}
          disabled={!selectedCompany}
        >
          조회
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleOpenMappingModal}
        >
          매핑 등록
        </Button>
      </div>
      <TableContainer
        component={Paper}
        style={{ maxHeight: 570, overflowY: 'auto' }}
        className="custom-scrollbar custom-table"
      >
        <Table stickyHeader>
          <TableHead>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    style={{
                      backgroundColor: '#cfcfcf',
                      color: 'black',
                      position: 'sticky',
                      top: 0,
                      zIndex: 2,
                      textAlign: 'center',
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
                <TableCell colSpan={3} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : hasSearched && data.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={{ textAlign: 'center' }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : hasSearched ? (
              <TableRow>
                <TableCell colSpan={3} align="center" style={{ color: 'red' }}>
                  데이터가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" style={{ color: 'gray' }}>
                  업체를 선택하여 조회를 진행하여 주십시오.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 매핑 등록 모달 */}
      <Dialog open={mappingModalOpen} onClose={handleCloseMappingModal} maxWidth="sm" fullWidth>
        <DialogTitle>매핑 등록</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>업체</Typography>
          <UseCompany onCompanyChange={setSelectedCompany} showAllOption={false} />

          <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>2차 거래처</Typography>
          <FormControl fullWidth>
            <InputLabel id="client-select-label">2차 거래처</InputLabel>
            <Select
              labelId="client-select-label"
              label="2차 거래처"
              value={selectedClientId || ''}
              onChange={(e) => setSelectedClientId(Number(e.target.value))}
            >
              {clientList.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>LCI 항목</Typography>
          <FormControl fullWidth>
            <InputLabel id="lci-select-label">LCI 항목</InputLabel>
            <Select
              labelId="lci-select-label"
              label="LCI 항목"
              value={selectedLciItem || ''}
              onChange={(e) => setSelectedLciItem(e.target.value)}
            >
              {lciItems.map((item) => (
                <MenuItem key={item.name} value={item.name}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMappingModal} color="secondary">
            취소
          </Button>
          <Button onClick={handleRegisterMapping} color="primary">
            등록
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editModalOpen} onClose={handleCloseEditModal} maxWidth="sm" fullWidth>
        <DialogTitle>매핑 수정</DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>업체</Typography>
          <Typography>{editData?.companyCode && companyMap[editData.companyCode]}</Typography>

          <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>2차 거래처</Typography>
          <FormControl fullWidth>
            <InputLabel id="edit-client-select-label">2차 거래처</InputLabel>
            <Select
              labelId="edit-client-select-label"
              label="2차 거래처"
              value={editData?.clientId || ''}
              onChange={(e) => setEditData((prev) => ({ ...prev, clientId: Number(e.target.value) }))}
            >
              {clientList.map((client) => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>LCI 항목</Typography>
          <FormControl fullWidth>
            <InputLabel id="edit-lci-select-label">LCI 항목</InputLabel>
            <Select
              labelId="edit-lci-select-label"
              label="LCI 항목"
              value={editData?.lciItemName || ''}
              onChange={(e) => setEditData((prev) => ({ ...prev, lciItemName: e.target.value }))}
            >
              {lciItems.map((item) => (
                <MenuItem key={item.name} value={item.name}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditModal} color="secondary">
            취소
          </Button>
          <Button onClick={handleEditSubmit} color="primary">
            수정
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteModalOpen} onClose={handleCloseDeleteModal} maxWidth="xs" fullWidth>
        <DialogTitle>삭제 확인</DialogTitle>
        <DialogContent>
          <Typography>정말 삭제하시겠습니까?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} color="secondary">
            취소
          </Button>
          <Button onClick={handleDelete} color="primary">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
