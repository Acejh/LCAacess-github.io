import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, SelectProps, FormControlProps } from '@mui/material';
import { SxProps, Theme } from '@mui/system';

interface InOutType {
  code: string;
  title: string;
  inOutType: 'IN' | 'OUT';
}

interface InOutTypeDropdownProps {
  selectedType: 'IN' | 'OUT';
  onChange: (type: 'IN' | 'OUT') => void;
  formControlProps?: FormControlProps;
  selectSx?: SxProps<Theme>;
  selectProps?: SelectProps;
  showAllOption?: boolean; 
}

const InOutTypeDropdown: React.FC<InOutTypeDropdownProps> = ({ selectedType, onChange, formControlProps, selectSx, selectProps }) => {
  const [data, setData] = useState<InOutType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<InOutType[]>('https://lcaapi.acess.co.kr/Clients/types');
        setData(response.data);
      } catch (error) {
        setError('An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (event: SelectChangeEvent<unknown>) => {
    const selectedType = event.target.value as 'IN' | 'OUT';
    onChange(selectedType);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const getLabel = (type: 'IN' | 'OUT') => {
    return type === 'IN' ? '입고' : '출고';
  };

  // Extract unique inOutType values from the data
  const uniqueInOutTypes = Array.from(new Set(data.map(item => item.inOutType)));

  return (
    <FormControl fullWidth {...formControlProps}>
      <InputLabel id="inout-type-label">입출고 구분</InputLabel>
      <Select
        labelId="inout-type-label"
        id="inout-type-select"
        value={selectedType}
        label="입출고 구분"
        onChange={handleChange}
        sx={selectSx}
        {...selectProps}
      >
        {uniqueInOutTypes.map((type) => (
          <MenuItem key={type} value={type}>
            {getLabel(type)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default InOutTypeDropdown;