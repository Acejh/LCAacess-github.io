import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Autocomplete, TextField, FormControlProps, FormControl } from '@mui/material';
import { SxProps, Theme } from '@mui/system';

export interface Company {
  id: number;
  code: string;
  name: string;
  bizNo: string;
  ecoasCode: string;
  zipCode: string;
  address: string;
  addressDetail: string | null;
  managerName: string;
  tel: string;
  longitude: number;
  latitude: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
}

interface UseCompanyProps extends FormControlProps {
  onCompanyChange: (company: Company | null) => void;
  onCompanyListChange?: (companies: Company[]) => void; 
  showAllOption?: boolean;
  sx?: SxProps<Theme>;
  selectSx?: SxProps<Theme>;
  selectedCompany?: Company | null;
}

const UseCompany: React.FC<UseCompanyProps> = ({ onCompanyChange, onCompanyListChange, showAllOption = true, sx, selectSx, ...rest }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const hasFetchedData = useRef(false);

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await axios.get('https://lcaapi.acess.co.kr/Companies');
      const sortedCompanies: Company[] = response.data.list.sort((a: Company, b: Company) =>
        a.name.localeCompare(b.name)
      );
  
      if (showAllOption) {
        const allCompany = {
          id: -1,
          code: '',
          name: '전체',
          bizNo: '',
          ecoasCode: '',
          zipCode: '',
          address: '',
          addressDetail: null,
          managerName: '',
          tel: '',
          longitude: 0,
          latitude: 0,
          createdBy: '',
          createdAt: '',
          updatedBy: null,
          updatedAt: null
        };
        sortedCompanies.unshift(allCompany);
        setSelectedCompany(allCompany); // "전체"를 기본 선택값으로 설정
        onCompanyChange(allCompany); // "전체"를 외부로도 전달
      }
  
      setCompanies(sortedCompanies);
  
      if (onCompanyListChange) {
        onCompanyListChange(sortedCompanies);
      }
  
      const authString = localStorage.getItem('kt-auth-react-v');
      if (authString) {
        const auth = JSON.parse(authString);
        const userInfo = auth.userInfo;
        if (userInfo && userInfo.role === 'User') {
          const userCompany = sortedCompanies.find((company: Company) => company.code === userInfo.companyCode);
          setSelectedCompany(userCompany || null);
          onCompanyChange(userCompany || null);
        }
      }
    } catch (error) {
      console.error('There was an error fetching the data!', error);
    }
  }, [showAllOption, onCompanyListChange, onCompanyChange]);

  useEffect(() => {
    if (!hasFetchedData.current) {
      fetchCompanies();
      hasFetchedData.current = true;
    }
  }, [fetchCompanies]);

  const handleChange = useCallback((event: React.SyntheticEvent, value: Company | null) => {
    setSelectedCompany(value);
    onCompanyChange(value);
  }, [onCompanyChange]);

  const authString = localStorage.getItem('kt-auth-react-v');
  let isUserRole = false;
  if (authString) {
    const auth = JSON.parse(authString);
    const userInfo = auth.userInfo;
    if (userInfo && userInfo.role === 'User') {
      isUserRole = true;
    }
  }

  return (
    <FormControl sx={{ width: '300px', marginRight: '10px', position: isUserRole ? 'absolute' : 'relative', opacity: isUserRole ? 0 : 1, pointerEvents: isUserRole ? 'none' : 'auto', ...sx }} {...rest}>
      <Autocomplete
        id="company-select"
        options={companies}
        getOptionLabel={(option) => option.name}
        value={selectedCompany}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label="사업회원 선택"
            variant="outlined"
            sx={{ 
              '& .MuiInputBase-root': {
                height: '45px',
              },
              '& .MuiOutlinedInput-input': {
                padding: '10px 14px',
              },
              '& .Mui-disabled': {
                backgroundColor: '#f0f0f0',
                pointerEvents: 'none',
              },
              ...selectSx, 
            }}
            InputProps={{
              ...params.InputProps,
              readOnly: isUserRole,
            }}
          />
        )}
        sx={{ 
          '& .MuiAutocomplete-inputRoot': {
            padding: '2px',
            minHeight: '40px',
          },
          ...selectSx, 
        }}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        noOptionsText="옵션이 없습니다."
        disableClearable={isUserRole}
        disabled={isUserRole}
      />
    </FormControl>
  );
};

export default UseCompany;