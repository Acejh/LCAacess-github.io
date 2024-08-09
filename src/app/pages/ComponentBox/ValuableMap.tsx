import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Autocomplete, CircularProgress, TextField, AutocompleteRenderInputParams } from '@mui/material';

interface ValuableThing {
  id: number;
  title: string;
}

interface ValuableMapProps {
  value: number | null;
  onChange: (value: number | null) => void;  // onChange의 타입을 수정
  menuWidth?: string; 
  fontSize?: string; 
}

const ValuableMap: React.FC<ValuableMapProps> = ({ value, onChange, menuWidth = '200px', fontSize = '14px' }) => {
  const [data, setData] = useState<ValuableThing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ValuableThing[]>('https://lcaapi.acess.co.kr/ValuableThings');
        setData(response.data);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          setError('접근 권한이 없습니다');
        } else {
          setError('데이터를 가져오는 중 에러 발생');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleChange = (event: React.SyntheticEvent<Element, Event>, newValue: ValuableThing | null) => {
    onChange(newValue ? newValue.id : null);
  };

  return (
    <div style={{ width: menuWidth }}>
      <Autocomplete
        value={data.find(item => item.id === value) || null}
        onChange={handleChange}
        options={data}
        getOptionLabel={(option) => option.title}
        renderInput={(params: AutocompleteRenderInputParams) => (
          <TextField 
            {...params} 
            label="유가물 선택" 
            variant="outlined" 
            style={{ fontSize }}
          />
        )}
        style={{ width: '100%' }}
        isOptionEqualToValue={(option, value) => option.id === value.id}
      />
    </div>
  );
};

export default ValuableMap;