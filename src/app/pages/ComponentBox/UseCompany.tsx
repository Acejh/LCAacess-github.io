import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { Autocomplete, TextField, FormControlProps, FormControl } from '@mui/material';
import { SxProps, Theme } from '@mui/system';
import { getApiUrl } from '../../../main';

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
  showGeneralOption?: boolean; // 종합 옵션 추가
  sx?: SxProps<Theme>;
  selectSx?: SxProps<Theme>;
  selectedCompany?: Company | null;
  label?: string; // label prop 추가
  disabled?: boolean; // 외부에서 비활성화 여부 설정
}

const UseCompany: React.FC<UseCompanyProps> = ({
  onCompanyChange,
  onCompanyListChange,
  showAllOption = true,
  showGeneralOption = false,
  sx,
  selectSx,
  label = "업체 선택", // 기본값 설정
  disabled = false, // 기본값 설정
  ...rest
}) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const hasFetchedData = useRef(false);

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await axios.get(`${getApiUrl}/Companies`);
      const companies: Company[] = response.data.list;

      if (showGeneralOption) {
        const generalCompany = {
          id: -2,
          code: 'ALL',
          name: '종합',
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
          updatedAt: null,
        };
        companies.unshift(generalCompany);
        setSelectedCompany(generalCompany);
        onCompanyChange(generalCompany);
      } else if (showAllOption) {
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
          updatedAt: null,
        };
        companies.unshift(allCompany);
        setSelectedCompany(allCompany);
        onCompanyChange(allCompany);
      }

      setCompanies(companies);

      if (onCompanyListChange) {
        onCompanyListChange(companies);
      }

      const authString = localStorage.getItem('kt-auth-react-v');
      if (authString) {
        const auth = JSON.parse(authString);
        const userInfo = auth.userInfo;
        if (userInfo && userInfo.role === 'User') {
          const userCompany = companies.find((company: Company) => company.code === userInfo.companyCode);
          setSelectedCompany(userCompany || null);
          onCompanyChange(userCompany || null);
        }
      }
    } catch (error) {
      console.error('There was an error fetching the data!', error);
    }
  }, [showAllOption, showGeneralOption, onCompanyListChange, onCompanyChange]);

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

  const isDisabled = disabled || isUserRole; // 외부 disabled와 내부 조건 결합

  return (
    <FormControl
      sx={{
        width: '300px',
        marginRight: '10px',
        position: isUserRole ? 'absolute' : 'relative',
        opacity: isDisabled ? 0 : 1, // 비활성화 시 투명도 적용
        pointerEvents: isDisabled ? 'none' : 'auto', // 비활성화 시 클릭 차단
        ...sx,
      }}
      {...rest}
    >
      <Autocomplete
        id="company-select"
        options={companies}
        getOptionLabel={(option) => option.name}
        value={selectedCompany}
        onChange={handleChange}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
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
              readOnly: isDisabled,
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
        disableClearable={isDisabled}
        disabled={isDisabled}
      />
    </FormControl>
  );
};

export default UseCompany;
