import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, SelectProps, FormControlProps, Box } from '@mui/material';
import { SxProps, Theme } from '@mui/system';

interface ClientTypeData {
  code: string;
  title: string;
  inOutType: 'IN' | 'OUT';
}

interface ClientTypeDropdownProps {
  selectedCode?: string;
  onChangeCode?: (code: string) => void;
  selectedInOutType?: string;
  onInOutTypeChange?: (type: string) => void;
  formControlProps?: FormControlProps;
  selectSx?: SxProps<Theme>;
  selectProps?: SelectProps;
  showClientType?: boolean;
  showInOutType?: boolean;
  showAllOption?: boolean; // 추가된 부분
}

const ClientTypeDropdown: React.FC<ClientTypeDropdownProps> = ({
  selectedCode = '',
  onChangeCode,
  selectedInOutType = '',
  onInOutTypeChange,
  formControlProps,
  selectSx,
  selectProps,
  showClientType = true,
  showInOutType = true,
  showAllOption = true, // 기본값 설정
}) => {
  const [data, setData] = useState<ClientTypeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ClientTypeData[]>('https://lcaapi.acess.co.kr/Clients/types');
        setData(response.data);
      } catch (error) {
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClientTypeChange = (event: SelectChangeEvent<unknown>) => {
    const selectedTitle = event.target.value as string;
    if (selectedTitle === '전체') {
      onChangeCode && onChangeCode('');
    } else {
      const selectedItem = data.find(item => item.title === selectedTitle);
      if (selectedItem) {
        onChangeCode && onChangeCode(selectedItem.code);
      }
    }
  };

  const handleInOutTypeChange = (event: SelectChangeEvent<unknown>) => {
    const selectedType = event.target.value as string;
    onInOutTypeChange && onInOutTypeChange(selectedType);
    onChangeCode && onChangeCode(''); // Reset the client type selection when changing inOutType
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const getInOutTypeLabel = (type: 'IN' | 'OUT') => {
    return type === 'IN' ? '입고' : '출고';
  };

  const uniqueInOutTypes = Array.from(new Set(data.map(item => item.inOutType)));

  const filteredClientTypes = selectedInOutType
    ? data.filter(item => item.inOutType === selectedInOutType)
    : data;

  const clientTypeOptions = showAllOption 
    ? [{ code: '', title: '전체', inOutType: '' }, ...filteredClientTypes]
    : filteredClientTypes;

  return (
    <Box display="flex" gap={2}>
      {showInOutType && (
        <FormControl {...formControlProps}>
          <InputLabel id="inout-type-label">입출고 구분</InputLabel>
          <Select
            labelId="inout-type-label"
            id="inout-type-select"
            value={selectedInOutType}
            label="입출고 구분"
            onChange={handleInOutTypeChange}
            sx={selectSx}
            {...selectProps}
          >
            {showAllOption && (
              <MenuItem value="">전체</MenuItem>
            )}
            {uniqueInOutTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {getInOutTypeLabel(type)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {showClientType && (
        <FormControl {...formControlProps}>
          <InputLabel id="client-type-label">거래처 구분</InputLabel>
          <Select
            labelId="client-type-label"
            id="client-type-select"
            value={data.find(item => item.code === selectedCode)?.title || (showAllOption ? '전체' : '')}
            label="거래처 구분"
            onChange={handleClientTypeChange}
            sx={selectSx}
            {...selectProps}
          >
            {clientTypeOptions.map((item) => (
              <MenuItem key={item.code} value={item.title}>
                {item.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

export default ClientTypeDropdown;