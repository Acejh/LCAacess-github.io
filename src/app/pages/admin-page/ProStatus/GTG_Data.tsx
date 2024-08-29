import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Select,
  MenuItem,
  Typography,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';

type Company = {
  code: string;
  name: string;
};

export function GTG_Data() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchParams, setSearchParams] = useState({
    year: '',
    month: '',
    company: null as Company | null,
  });

  useEffect(() => {
    // API 호출로 회사 데이터를 가져옵니다.
    axios.get('https://api.example.com/companies')
      .then(response => {
        setCompanies(response.data.list);
      })
      .catch(error => {
        console.error('Error fetching companies:', error);
      });
  }, []);

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    setSearchParams((prev) => ({ ...prev, year: event.target.value }));
  };

  const handleMonthChange = (event: SelectChangeEvent<string>) => {
    setSearchParams((prev) => ({ ...prev, month: event.target.value }));
  };

  const handleCompanyChange = (company: Company | null) => {
    setSearchParams((prev) => ({ ...prev, company }));
  };

  const handleSearch = () => {
    if (!searchParams.company) {
      alert("사업회원을 선택하여주십시오");
      return;
    }
    // 데이터 검색 로직 추가
    console.log('Searching with params:', searchParams);
  };

  return (
    <div style={{ margin: '0 30px' }}>
      <Typography variant="h5" gutterBottom style={{ marginBottom: '10px' }}>
        GTG 결과
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <FormControl style={{ marginRight: '10px' }}>
          <InputLabel id="company-label">사업회원</InputLabel>
          <Select
            labelId="company-label"
            id="company-select"
            value={searchParams.company ? searchParams.company.code : ''}
            label="사업회원"
            onChange={(event) => {
              const selectedCompany = companies.find(c => c.code === event.target.value) || null;
              handleCompanyChange(selectedCompany);
            }}
            style={{ width: '200px' }}
            sx={{ height: '45px' }}
          >
            <MenuItem value="">전체</MenuItem>
            {companies.map((company) => (
              <MenuItem key={company.code} value={company.code}>
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl style={{ marginRight: '10px' }}>
          <InputLabel id="year-label">연도</InputLabel>
          <Select
            labelId="year-label"
            id="year-select"
            value={searchParams.year}
            label="연도"
            onChange={handleYearChange}
            style={{ width: '100px' }}
            sx={{ height: '45px' }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 120,
                },
              },
            }}
          >
            <MenuItem value="">전체</MenuItem>
            {Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()).map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl style={{ marginRight: '10px' }}>
          <InputLabel id="month-label">월</InputLabel>
          <Select
            labelId="month-label"
            id="month-select"
            value={searchParams.month}
            label="월"
            onChange={handleMonthChange}
            style={{ width: '100px' }}
            sx={{ height: '45px' }}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: 120,
                },
              },
            }}
          >
            <MenuItem value="">전체</MenuItem>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
              <MenuItem key={month} value={String(month)}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          style={{ height: '35px', margin: '0 10px', padding: '0 10px', fontSize: '14px' }}
          onClick={handleSearch}
        >
          조회
        </Button>
      </div>

      <TableContainer component={Paper} style={{ maxHeight: 545, overflowY: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          backgroundColor: '#cfcfcf',
                        }}>
              <TableCell colSpan={4}>제품군</TableCell>
              <TableCell colSpan={5}>온도교환기기</TableCell>
              <TableCell colSpan={4}>디스플레이기기</TableCell>
              <TableCell colSpan={8}>통신사무기기</TableCell>
              <TableCell colSpan={36}>일반기기</TableCell>
              <TableCell>태양광 패널</TableCell>
            </TableRow>
            <TableRow style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          position: 'sticky',
                          top: -5,
                          backgroundColor: '#cfcfcf',
                          zIndex: 1,
                        }}>
              <TableCell colSpan={4}>주식회사 동북권자원순환센터</TableCell>
              <TableCell>냉장고</TableCell>
              <TableCell>전기정수기</TableCell>
              <TableCell>자동판매기(온도교환기능)</TableCell>
              <TableCell>에어컨</TableCell>
              <TableCell>제습기</TableCell>
              <TableCell>텔레비전</TableCell>
              <TableCell>모니터</TableCell>
              <TableCell>노트북</TableCell>
              <TableCell>내비게이션</TableCell>
              <TableCell>컴퓨터</TableCell>
              <TableCell>복사기</TableCell>
              <TableCell>프린터</TableCell>
              <TableCell>팩시밀리</TableCell>
              <TableCell>스캐너</TableCell>
              <TableCell>빔프로젝터</TableCell>
              <TableCell>유무선공유기</TableCell>
              <TableCell>이동전화단말기</TableCell>
              <TableCell>세탁기</TableCell>
              <TableCell>러닝머신</TableCell>
              <TableCell>전기안마기</TableCell>
              <TableCell>전기오븐</TableCell>
              <TableCell>전자레인지</TableCell>
              <TableCell>음식물처리기</TableCell>
              <TableCell>식기건조기·식기세척기</TableCell>
              <TableCell>전기비데</TableCell>
              <TableCell>공기청정기</TableCell>
              <TableCell>전기히터</TableCell>
              <TableCell>오디오</TableCell>
              <TableCell>전기밥솥</TableCell>
              <TableCell>연수기</TableCell>
              <TableCell>가습기</TableCell>
              <TableCell>전기다리미</TableCell>
              <TableCell>선풍기</TableCell>
              <TableCell>믹서</TableCell>
              <TableCell>청소기</TableCell>
              <TableCell>비디오플레이어</TableCell>
              <TableCell>토스트기</TableCell>
              <TableCell>전기주전자</TableCell>
              <TableCell>전기온수기</TableCell>
              <TableCell>전기프라이팬</TableCell>
              <TableCell>헤어드라이어</TableCell>
              <TableCell>감시카메라</TableCell>
              <TableCell>식품건조기</TableCell>
              <TableCell>족욕기</TableCell>
              <TableCell>재봉틀</TableCell>
              <TableCell>영상게임기</TableCell>
              <TableCell>제빵기</TableCell>
              <TableCell>튀김기</TableCell>
              <TableCell>커피메이커</TableCell>
              <TableCell>약탕기</TableCell>
              <TableCell>탈수기</TableCell>
              <TableCell>자동판매기(온도교환기능 외)</TableCell>
              <TableCell>일반기기혼합</TableCell>
              <TableCell>태양광 패널</TableCell>
            </TableRow>
            <TableRow style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          backgroundColor: '#cfcfcf',
                        }}>
              <TableCell colSpan={4}>처리비율</TableCell>
              <TableCell>60.30%</TableCell>
              <TableCell>0.21%</TableCell>
              <TableCell>0.02%</TableCell>
              <TableCell>2.30%</TableCell>
              <TableCell>0.02%</TableCell>
              <TableCell>9.34%</TableCell>
              <TableCell>0.44%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.16%</TableCell>
              <TableCell>0.39%</TableCell>
              <TableCell>0.56%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>21.61%</TableCell>
              <TableCell>0.06%</TableCell>
              <TableCell>0.14%</TableCell>
              <TableCell>0.06%</TableCell>
              <TableCell>0.43%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.08%</TableCell>
              <TableCell>0.01%</TableCell>
              <TableCell>0.03%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.03%</TableCell>
              <TableCell>0.07%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.01%</TableCell>
              <TableCell>0.01%</TableCell>
              <TableCell>0.12%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.01%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>0.00%</TableCell>
              <TableCell>3.56%</TableCell>
              <TableCell>0.00%</TableCell>
            </TableRow>
            <TableRow style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          position: 'sticky',
                          top: 45,
                          backgroundColor: '#cfcfcf',
                          zIndex: 1,
                        }}>
              <TableCell >구분</TableCell>
              <TableCell>Flow</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>처리중량</TableCell>
              <TableCell>16,567,264.03</TableCell>
              <TableCell>57,803.21</TableCell>
              <TableCell>6,584.97</TableCell>
              <TableCell>632,408.84</TableCell>
              <TableCell>6,638.94</TableCell>
              <TableCell>2,565,748.30</TableCell>
              <TableCell>120,277.69</TableCell>
              <TableCell>869.08</TableCell>
              <TableCell>0.94</TableCell>
              <TableCell>42,973.48</TableCell>
              <TableCell>107,673.32</TableCell>
              <TableCell>155,009.07</TableCell>
              <TableCell>1,131.51</TableCell>
              <TableCell>48.60</TableCell>
              <TableCell>369.97</TableCell>
              <TableCell>2.03</TableCell>
              <TableCell>-</TableCell>
              <TableCell>5,936,515.22</TableCell>
              <TableCell>15,166.18</TableCell>
              <TableCell>37,376.59</TableCell>
              <TableCell>15,684.89</TableCell>
              <TableCell>118,387.81</TableCell>
              <TableCell>303.90</TableCell>
              <TableCell>21,551.14</TableCell>
              <TableCell>1,992.51</TableCell>
              <TableCell>9,211.38</TableCell>
              <TableCell>758.04</TableCell>
              <TableCell>7,160.87</TableCell>
              <TableCell>18,682.22</TableCell>
              <TableCell>41.32</TableCell>
              <TableCell>504.28</TableCell>
              <TableCell>941.23</TableCell>
              <TableCell>4,011.65</TableCell>
              <TableCell>1,931.64</TableCell>
              <TableCell>32,721.40</TableCell>
              <TableCell>586.54</TableCell>
              <TableCell>248.06</TableCell>
              <TableCell>651.73</TableCell>
              <TableCell>932.48</TableCell>
              <TableCell>1,255.11</TableCell>
              <TableCell>345.67</TableCell>
              <TableCell>0.76</TableCell>
              <TableCell>150.34</TableCell>
              <TableCell>7.75</TableCell>
              <TableCell>5.56</TableCell>
              <TableCell>54.07</TableCell>
              <TableCell>77.43</TableCell>
              <TableCell>2,062.28</TableCell>
              <TableCell>763.69</TableCell>
              <TableCell>15.68</TableCell>
              <TableCell>254.84</TableCell>
              <TableCell>-</TableCell>
              <TableCell>978,017.73</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
          </TableHead>
          <TableBody style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            <TableRow>
              <TableCell>투입물</TableCell>
              <TableCell>전력</TableCell>
              <TableCell>kWh</TableCell>
              <TableCell>2,014,924.77</TableCell>
              <TableCell>1,873,360.34</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>21,806.27</TableCell>
              <TableCell>1,022.24</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>118,735.92</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>투입물</TableCell>
              <TableCell>경유</TableCell>
              <TableCell>kg</TableCell>
              <TableCell>43,410.99</TableCell>
              <TableCell>26,178.31</TableCell>
              <TableCell>91.34</TableCell>
              <TableCell>10.41</TableCell>
              <TableCell>999.28</TableCell>
              <TableCell>10.49</TableCell>
              <TableCell>4,054.20</TableCell>
              <TableCell>190.05</TableCell>
              <TableCell>1.37</TableCell>
              <TableCell>0.00</TableCell>
              <TableCell>67.90</TableCell>
              <TableCell>170.14</TableCell>
              <TableCell>244.93</TableCell>
              <TableCell>1.79</TableCell>
              <TableCell>0.08</TableCell>
              <TableCell>0.58</TableCell>
              <TableCell>0.00</TableCell>
              <TableCell>-</TableCell>
              <TableCell>9,380.42</TableCell>
              <TableCell>23.96</TableCell>
              <TableCell>59.06</TableCell>
              <TableCell>24.78</TableCell>
              <TableCell>187.07</TableCell>
              <TableCell>0.48</TableCell>
              <TableCell>34.05</TableCell>
              <TableCell>3.15</TableCell>
              <TableCell>14.56</TableCell>
              <TableCell>1.20</TableCell>
              <TableCell>11.32</TableCell>
              <TableCell>29.52</TableCell>
              <TableCell>0.07</TableCell>
              <TableCell>0.80</TableCell>
              <TableCell>1.49</TableCell>
              <TableCell>6.34</TableCell>
              <TableCell>3.05</TableCell>
              <TableCell>51.70</TableCell>
              <TableCell>0.93</TableCell>
              <TableCell>0.39</TableCell>
              <TableCell>1.03</TableCell>
              <TableCell>1.47</TableCell>
              <TableCell>1.98</TableCell>
              <TableCell>0.55</TableCell>
              <TableCell>0.00</TableCell>
              <TableCell>0.24</TableCell>
              <TableCell>0.01</TableCell>
              <TableCell>0.01</TableCell>
              <TableCell>0.09</TableCell>
              <TableCell>0.12</TableCell>
              <TableCell>3.26</TableCell>
              <TableCell>1.21</TableCell>
              <TableCell>0.02</TableCell>
              <TableCell>0.40</TableCell>
              <TableCell>-</TableCell>
              <TableCell>1,545.39</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>투입물</TableCell>
              <TableCell>등유</TableCell>
              <TableCell>kg</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>투입물</TableCell>
              <TableCell>상수</TableCell>
              <TableCell>m3</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>투입물</TableCell>
              <TableCell>공업용수</TableCell>
              <TableCell>m3</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>투입물</TableCell>
              <TableCell>지하수</TableCell>
              <TableCell>m3</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell>
              <TableCell>-</TableCell> 
            </TableRow>
              <TableCell>연료사용</TableCell> {/* 1 */}
              <TableCell>Carbon dioxide, fossil</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>135,856.97</TableCell> {/* 4 */}
              <TableCell>81,926.40</TableCell> {/* 5 */}
              <TableCell>285.84</TableCell> {/* 6 */}
              <TableCell>32.56</TableCell> {/* 7 */}
              <TableCell>3,127.31</TableCell> {/* 8 */}
              <TableCell>32.83</TableCell> {/* 9 */}
              <TableCell>12,687.82</TableCell> {/* 10 */}
              <TableCell>594.78</TableCell> {/* 11 */}
              <TableCell>4.30</TableCell> {/* 12 */}
              <TableCell>0.00</TableCell> {/* 13 */}
              <TableCell>212.51</TableCell> {/* 14 */}
              <TableCell>532.45</TableCell> {/* 15 */}
              <TableCell>766.53</TableCell> {/* 16 */}
              <TableCell>5.60</TableCell> {/* 17 */}
              <TableCell>0.24</TableCell> {/* 18 */}
              <TableCell>1.83</TableCell> {/* 19 */}
              <TableCell>0.01</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>29,356.52</TableCell> {/* 22 */}
              <TableCell>75.00</TableCell> {/* 23 */}
              <TableCell>184.83</TableCell> {/* 24 */}
              <TableCell>77.56</TableCell> {/* 25 */}
              <TableCell>585.44</TableCell> {/* 26 */}
              <TableCell>1.50</TableCell> {/* 27 */}
              <TableCell>106.57</TableCell> {/* 28 */}
              <TableCell>9.85</TableCell> {/* 29 */}
              <TableCell>45.55</TableCell> {/* 30 */}
              <TableCell>3.75</TableCell> {/* 31 */}
              <TableCell>35.41</TableCell> {/* 32 */}
              <TableCell>92.39</TableCell> {/* 33 */}
              <TableCell>0.20</TableCell> {/* 34 */}
              <TableCell>2.49</TableCell> {/* 35 */}
              <TableCell>4.65</TableCell> {/* 36 */}
              <TableCell>19.84</TableCell> {/* 37 */}
              <TableCell>9.55</TableCell> {/* 38 */}
              <TableCell>161.81</TableCell> {/* 39 */}
              <TableCell>2.90</TableCell> {/* 40 */}
              <TableCell>1.23</TableCell> {/* 41 */}
              <TableCell>3.22</TableCell> {/* 42 */}
              <TableCell>4.61</TableCell> {/* 43 */}
              <TableCell>6.21</TableCell> {/* 44 */}
              <TableCell>1.71</TableCell> {/* 45 */}
              <TableCell>0.00</TableCell> {/* 46 */}
              <TableCell>0.74</TableCell> {/* 47 */}
              <TableCell>0.04</TableCell> {/* 48 */}
              <TableCell>0.03</TableCell> {/* 49 */}
              <TableCell>0.27</TableCell> {/* 50 */}
              <TableCell>0.38</TableCell> {/* 51 */}
              <TableCell>10.20</TableCell> {/* 52 */}
              <TableCell>3.78</TableCell> {/* 53 */}
              <TableCell>0.08</TableCell> {/* 54 */}
              <TableCell>1.26</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>4,836.37</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            <TableRow>
              <TableCell>연료사용</TableCell> {/* 1 */}
              <TableCell>Carbon monoxide, fossil</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>18.52</TableCell> {/* 4 */}
              <TableCell>11.17</TableCell> {/* 5 */}
              <TableCell>0.04</TableCell> {/* 6 */}
              <TableCell>0.00</TableCell> {/* 7 */}
              <TableCell>0.43</TableCell> {/* 8 */}
              <TableCell>0.00</TableCell> {/* 9 */}
              <TableCell>1.73</TableCell> {/* 10 */}
              <TableCell>0.08</TableCell> {/* 11 */}
              <TableCell>0.00</TableCell> {/* 12 */}
              <TableCell>0.00</TableCell> {/* 13 */}
              <TableCell>0.03</TableCell> {/* 14 */}
              <TableCell>0.07</TableCell> {/* 15 */}
              <TableCell>0.10</TableCell> {/* 16 */}
              <TableCell>0.00</TableCell> {/* 17 */}
              <TableCell>0.00</TableCell> {/* 18 */}
              <TableCell>0.00</TableCell> {/* 19 */}
              <TableCell>0.00</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>4.00</TableCell> {/* 22 */}
              <TableCell>0.01</TableCell> {/* 23 */}
              <TableCell>0.03</TableCell> {/* 24 */}
              <TableCell>0.01</TableCell> {/* 25 */}
              <TableCell>0.08</TableCell> {/* 26 */}
              <TableCell>0.00</TableCell> {/* 27 */}
              <TableCell>0.01</TableCell> {/* 28 */}
              <TableCell>0.00</TableCell> {/* 29 */}
              <TableCell>0.01</TableCell> {/* 30 */}
              <TableCell>0.00</TableCell> {/* 31 */}
              <TableCell>0.00</TableCell> {/* 32 */}
              <TableCell>0.01</TableCell> {/* 33 */}
              <TableCell>0.00</TableCell> {/* 34 */}
              <TableCell>0.00</TableCell> {/* 35 */}
              <TableCell>0.00</TableCell> {/* 36 */}
              <TableCell>0.00</TableCell> {/* 37 */}
              <TableCell>0.00</TableCell> {/* 38 */}
              <TableCell>0.02</TableCell> {/* 39 */}
              <TableCell>0.00</TableCell> {/* 40 */}
              <TableCell>0.00</TableCell> {/* 41 */}
              <TableCell>0.00</TableCell> {/* 42 */}
              <TableCell>0.00</TableCell> {/* 43 */}
              <TableCell>0.00</TableCell> {/* 44 */}
              <TableCell>0.00</TableCell> {/* 45 */}
              <TableCell>0.00</TableCell> {/* 46 */}
              <TableCell>0.00</TableCell> {/* 47 */}
              <TableCell>0.00</TableCell> {/* 48 */}
              <TableCell>0.00</TableCell> {/* 49 */}
              <TableCell>0.00</TableCell> {/* 50 */}
              <TableCell>0.00</TableCell> {/* 51 */}
              <TableCell>0.00</TableCell> {/* 52 */}
              <TableCell>0.00</TableCell> {/* 53 */}
              <TableCell>0.00</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>0.66</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
              <TableCell>연료사용</TableCell> {/* 1 */}
              <TableCell>Dinitrogen monoxide</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>1.11</TableCell> {/* 4 */}
              <TableCell>0.67</TableCell> {/* 5 */}
              <TableCell>0.00</TableCell> {/* 6 */}
              <TableCell>0.00</TableCell> {/* 7 */}
              <TableCell>0.03</TableCell> {/* 8 */}
              <TableCell>0.00</TableCell> {/* 9 */}
              <TableCell>0.10</TableCell> {/* 10 */}
              <TableCell>0.00</TableCell> {/* 11 */}
              <TableCell>0.00</TableCell> {/* 12 */}
              <TableCell>0.00</TableCell> {/* 13 */}
              <TableCell>0.00</TableCell> {/* 14 */}
              <TableCell>0.01</TableCell> {/* 15 */}
              <TableCell>0.00</TableCell> {/* 16 */}
              <TableCell>0.00</TableCell> {/* 17 */}
              <TableCell>0.00</TableCell> {/* 18 */}
              <TableCell>0.00</TableCell> {/* 19 */}
              <TableCell>0.00</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>0.24</TableCell> {/* 22 */}
              <TableCell>0.00</TableCell> {/* 23 */}
              <TableCell>0.00</TableCell> {/* 24 */}
              <TableCell>0.00</TableCell> {/* 25 */}
              <TableCell>0.00</TableCell> {/* 26 */}
              <TableCell>0.00</TableCell> {/* 27 */}
              <TableCell>0.00</TableCell> {/* 28 */}
              <TableCell>0.00</TableCell> {/* 29 */}
              <TableCell>0.00</TableCell> {/* 30 */}
              <TableCell>0.00</TableCell> {/* 31 */}
              <TableCell>0.00</TableCell> {/* 32 */}
              <TableCell>0.00</TableCell> {/* 33 */}
              <TableCell>0.00</TableCell> {/* 34 */}
              <TableCell>0.00</TableCell> {/* 35 */}
              <TableCell>0.00</TableCell> {/* 36 */}
              <TableCell>0.00</TableCell> {/* 37 */}
              <TableCell>0.00</TableCell> {/* 38 */}
              <TableCell>0.00</TableCell> {/* 39 */}
              <TableCell>0.00</TableCell> {/* 40 */}
              <TableCell>0.00</TableCell> {/* 41 */}
              <TableCell>0.00</TableCell> {/* 42 */}
              <TableCell>0.00</TableCell> {/* 43 */}
              <TableCell>0.00</TableCell> {/* 44 */}
              <TableCell>0.00</TableCell> {/* 45 */}
              <TableCell>0.00</TableCell> {/* 46 */}
              <TableCell>0.00</TableCell> {/* 47 */}
              <TableCell>0.00</TableCell> {/* 48 */}
              <TableCell>0.00</TableCell> {/* 49 */}
              <TableCell>0.00</TableCell> {/* 50 */}
              <TableCell>0.00</TableCell> {/* 51 */}
              <TableCell>0.00</TableCell> {/* 52 */}
              <TableCell>0.00</TableCell> {/* 53 */}
              <TableCell>0.00</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>0.04</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            <TableRow>
              <TableCell>연료사용</TableCell> {/* 1 */}
              <TableCell>Methane, fossil</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>5.56</TableCell> {/* 4 */}
              <TableCell>3.35</TableCell> {/* 5 */}
              <TableCell>0.01</TableCell> {/* 6 */}
              <TableCell>0.00</TableCell> {/* 7 */}
              <TableCell>0.13</TableCell> {/* 8 */}
              <TableCell>0.00</TableCell> {/* 9 */}
              <TableCell>0.52</TableCell> {/* 10 */}
              <TableCell>0.02</TableCell> {/* 11 */}
              <TableCell>0.00</TableCell> {/* 12 */}
              <TableCell>0.00</TableCell> {/* 13 */}
              <TableCell>0.01</TableCell> {/* 14 */}
              <TableCell>0.02</TableCell> {/* 15 */}
              <TableCell>0.03</TableCell> {/* 16 */}
              <TableCell>0.00</TableCell> {/* 17 */}
              <TableCell>0.00</TableCell> {/* 18 */}
              <TableCell>0.00</TableCell> {/* 19 */}
              <TableCell>0.00</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>1.20</TableCell> {/* 22 */}
              <TableCell>0.00</TableCell> {/* 23 */}
              <TableCell>0.01</TableCell> {/* 24 */}
              <TableCell>0.00</TableCell> {/* 25 */}
              <TableCell>0.02</TableCell> {/* 26 */}
              <TableCell>0.00</TableCell> {/* 27 */}
              <TableCell>0.00</TableCell> {/* 28 */}
              <TableCell>0.00</TableCell> {/* 29 */}
              <TableCell>0.00</TableCell> {/* 30 */}
              <TableCell>0.00</TableCell> {/* 31 */}
              <TableCell>0.00</TableCell> {/* 32 */}
              <TableCell>0.00</TableCell> {/* 33 */}
              <TableCell>0.00</TableCell> {/* 34 */}
              <TableCell>0.00</TableCell> {/* 35 */}
              <TableCell>0.00</TableCell> {/* 36 */}
              <TableCell>0.01</TableCell> {/* 37 */}
              <TableCell>0.00</TableCell> {/* 38 */}
              <TableCell>0.00</TableCell> {/* 39 */}
              <TableCell>0.00</TableCell> {/* 40 */}
              <TableCell>0.00</TableCell> {/* 41 */}
              <TableCell>0.00</TableCell> {/* 42 */}
              <TableCell>0.00</TableCell> {/* 43 */}
              <TableCell>0.00</TableCell> {/* 44 */}
              <TableCell>0.00</TableCell> {/* 45 */}
              <TableCell>0.00</TableCell> {/* 46 */}
              <TableCell>0.00</TableCell> {/* 47 */}
              <TableCell>0.00</TableCell> {/* 48 */}
              <TableCell>0.00</TableCell> {/* 49 */}
              <TableCell>0.00</TableCell> {/* 50 */}
              <TableCell>0.00</TableCell> {/* 51 */}
              <TableCell>0.00</TableCell> {/* 52 */}
              <TableCell>0.00</TableCell> {/* 53 */}
              <TableCell>0.00</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>0.20</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
              <TableCell>연료사용</TableCell> {/* 1 */}
              <TableCell>Nitrogen oxides</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>9.26</TableCell> {/* 4 */}
              <TableCell>5.58</TableCell> {/* 5 */}
              <TableCell>0.02</TableCell> {/* 6 */}
              <TableCell>0.00</TableCell> {/* 7 */}
              <TableCell>0.21</TableCell> {/* 8 */}
              <TableCell>0.00</TableCell> {/* 9 */}
              <TableCell>0.86</TableCell> {/* 10 */}
              <TableCell>0.04</TableCell> {/* 11 */}
              <TableCell>0.00</TableCell> {/* 12 */}
              <TableCell>0.00</TableCell> {/* 13 */}
              <TableCell>0.01</TableCell> {/* 14 */}
              <TableCell>0.04</TableCell> {/* 15 */}
              <TableCell>0.05</TableCell> {/* 16 */}
              <TableCell>0.00</TableCell> {/* 17 */}
              <TableCell>0.00</TableCell> {/* 18 */}
              <TableCell>0.00</TableCell> {/* 19 */}
              <TableCell>0.00</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>2.00</TableCell> {/* 22 */}
              <TableCell>0.01</TableCell> {/* 23 */}
              <TableCell>0.01</TableCell> {/* 24 */}
              <TableCell>0.01</TableCell> {/* 25 */}
              <TableCell>0.04</TableCell> {/* 26 */}
              <TableCell>0.00</TableCell> {/* 27 */}
              <TableCell>0.01</TableCell> {/* 28 */}
              <TableCell>0.00</TableCell> {/* 29 */}
              <TableCell>0.00</TableCell> {/* 30 */}
              <TableCell>0.00</TableCell> {/* 31 */}
              <TableCell>0.00</TableCell> {/* 32 */}
              <TableCell>0.00</TableCell> {/* 33 */}
              <TableCell>0.00</TableCell> {/* 34 */}
              <TableCell>0.00</TableCell> {/* 35 */}
              <TableCell>0.00</TableCell> {/* 36 */}
              <TableCell>0.01</TableCell> {/* 37 */}
              <TableCell>0.00</TableCell> {/* 38 */}
              <TableCell>0.00</TableCell> {/* 39 */}
              <TableCell>0.00</TableCell> {/* 40 */}
              <TableCell>0.00</TableCell> {/* 41 */}
              <TableCell>0.00</TableCell> {/* 42 */}
              <TableCell>0.00</TableCell> {/* 43 */}
              <TableCell>0.00</TableCell> {/* 44 */}
              <TableCell>0.00</TableCell> {/* 45 */}
              <TableCell>0.00</TableCell> {/* 46 */}
              <TableCell>0.00</TableCell> {/* 47 */}
              <TableCell>0.00</TableCell> {/* 48 */}
              <TableCell>0.00</TableCell> {/* 49 */}
              <TableCell>0.00</TableCell> {/* 50 */}
              <TableCell>0.00</TableCell> {/* 51 */}
              <TableCell>0.00</TableCell> {/* 52 */}
              <TableCell>0.00</TableCell> {/* 53 */}
              <TableCell>0.00</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>0.33</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            <TableRow>
              <TableCell>연료사용</TableCell> {/* 1 */}
              <TableCell>NMVOC</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>370.44</TableCell> {/* 4 */}
              <TableCell>223.39</TableCell> {/* 5 */}
              <TableCell>0.78</TableCell> {/* 6 */}
              <TableCell>0.09</TableCell> {/* 7 */}
              <TableCell>8.53</TableCell> {/* 8 */}
              <TableCell>0.09</TableCell> {/* 9 */}
              <TableCell>34.60</TableCell> {/* 10 */}
              <TableCell>1.62</TableCell> {/* 11 */}
              <TableCell>0.01</TableCell> {/* 12 */}
              <TableCell>0.00</TableCell> {/* 13 */}
              <TableCell>0.58</TableCell> {/* 14 */}
              <TableCell>1.45</TableCell> {/* 15 */}
              <TableCell>2.09</TableCell> {/* 16 */}
              <TableCell>0.02</TableCell> {/* 17 */}
              <TableCell>0.00</TableCell> {/* 18 */}
              <TableCell>0.00</TableCell> {/* 19 */}
              <TableCell>0.00</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>80.05</TableCell> {/* 22 */}
              <TableCell>0.20</TableCell> {/* 23 */}
              <TableCell>0.50</TableCell> {/* 24 */}
              <TableCell>0.21</TableCell> {/* 25 */}
              <TableCell>1.60</TableCell> {/* 26 */}
              <TableCell>0.00</TableCell> {/* 27 */}
              <TableCell>0.29</TableCell> {/* 28 */}
              <TableCell>0.03</TableCell> {/* 29 */}
              <TableCell>0.12</TableCell> {/* 30 */}
              <TableCell>0.01</TableCell> {/* 31 */}
              <TableCell>0.10</TableCell> {/* 32 */}
              <TableCell>0.25</TableCell> {/* 33 */}
              <TableCell>0.00</TableCell> {/* 34 */}
              <TableCell>0.01</TableCell> {/* 35 */}
              <TableCell>0.01</TableCell> {/* 36 */}
              <TableCell>0.05</TableCell> {/* 37 */}
              <TableCell>0.03</TableCell> {/* 38 */}
              <TableCell>0.44</TableCell> {/* 39 */}
              <TableCell>0.01</TableCell> {/* 40 */}
              <TableCell>0.00</TableCell> {/* 41 */}
              <TableCell>0.01</TableCell> {/* 42 */}
              <TableCell>0.01</TableCell> {/* 43 */}
              <TableCell>0.02</TableCell> {/* 44 */}
              <TableCell>0.00</TableCell> {/* 45 */}
              <TableCell>0.00</TableCell> {/* 46 */}
              <TableCell>0.00</TableCell> {/* 47 */}
              <TableCell>0.00</TableCell> {/* 48 */}
              <TableCell>0.00</TableCell> {/* 49 */}
              <TableCell>0.00</TableCell> {/* 50 */}
              <TableCell>0.03</TableCell> {/* 51 */}
              <TableCell>0.01</TableCell> {/* 52 */}
              <TableCell>0.00</TableCell> {/* 53 */}
              <TableCell>0.00</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>13.19</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
              <TableCell>배출물</TableCell> {/* 1 */}
              <TableCell>수계배출물</TableCell> {/* 2 */}
              <TableCell>m3</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>CD-ROM</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>410.00</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>47.01</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>23.21</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>339.78</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>CPU</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>8.00</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>0.10</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>7.90</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>DY(CRT)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>22,320.00</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>21,558.26</TableCell> {/* 9 */}
              <TableCell>761.74</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>고무</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>181,060.00</TableCell> {/* 4 */}
              <TableCell>148,783.45</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>30,436.39</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>24.78</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>261.33</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>0.02</TableCell> {/* 31 */}
              <TableCell>0.43</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>0.00</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>0.03</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>0.03</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>1,553.53</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>고철</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>11,424,480.00</TableCell> {/* 4 */}
              <TableCell>6,529,324.69</TableCell> {/* 5 */}
              <TableCell>14,223.49</TableCell> {/* 6 */}
              <TableCell>8,077.50</TableCell> {/* 7 */}
              <TableCell>222,939.96</TableCell> {/* 8 */}
              <TableCell>155.52</TableCell> {/* 9 */}
              <TableCell>989,373.35</TableCell> {/* 10 */}
              <TableCell>63,538.75</TableCell> {/* 11 */}
              <TableCell>113.60</TableCell> {/* 12 */}
              <TableCell>0.12</TableCell> {/* 13 */}
              <TableCell>38,304.01</TableCell> {/* 14 */}
              <TableCell>92,927.11</TableCell> {/* 15 */}
              <TableCell>68,167.24</TableCell> {/* 16 */}
              <TableCell>453.95</TableCell> {/* 17 */}
              <TableCell>6.48</TableCell> {/* 18 */}
              <TableCell>68.52</TableCell> {/* 19 */}
              <TableCell>0.53</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>2,907,101.84</TableCell> {/* 22 */}
              <TableCell>13,429.50</TableCell> {/* 23 */}
              <TableCell>21,539.73</TableCell> {/* 24 */}
              <TableCell>12,981.47</TableCell> {/* 25 */}
              <TableCell>89,619.17</TableCell> {/* 26 */}
              <TableCell>59.46</TableCell> {/* 27 */}
              <TableCell>10,210.56</TableCell> {/* 28 */}
              <TableCell>267.91</TableCell> {/* 29 */}
              <TableCell>1,036.58</TableCell> {/* 30 */}
              <TableCell>381.92</TableCell> {/* 31 */}
              <TableCell>3,913.42</TableCell> {/* 32 */}
              <TableCell>5,068.60</TableCell> {/* 33 */}
              <TableCell>2.20</TableCell> {/* 34 */}
              <TableCell>36.38</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>1,424.41</TableCell> {/* 37 */}
              <TableCell>127.04</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>344.57</TableCell> {/* 40 */}
              <TableCell>176.23</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>813.41</TableCell> {/* 43 */}
              <TableCell>1,618.43</TableCell> {/* 44 */}
              <TableCell>123.78</TableCell> {/* 45 */}
              <TableCell>0.16</TableCell> {/* 46 */}
              <TableCell>30.45</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>4.90</TableCell> {/* 49 */}
              <TableCell>16.68</TableCell> {/* 50 */}
              <TableCell>44.50</TableCell> {/* 51 */}
              <TableCell>710.43</TableCell> {/* 52 */}
              <TableCell>75.89</TableCell> {/* 53 */}
              <TableCell>4.64</TableCell> {/* 54 */}
              <TableCell>59.80</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>325,581.10</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>구리</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>212,780.00</TableCell> {/* 4 */}
              <TableCell>152,353.24</TableCell> {/* 5 */}
              <TableCell>286.57</TableCell> {/* 6 */}
              <TableCell>13.85</TableCell> {/* 7 */}
              <TableCell>9,507.66</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>679.88</TableCell> {/* 10 */}
              <TableCell>50.13</TableCell> {/* 11 */}
              <TableCell>4.21</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>580.40</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>45,471.63</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>86.75</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>421.69</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>74.98</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>0.71</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>3,248.30</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>기타비철</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>125,272.00</TableCell> {/* 4 */}
              <TableCell>70,374.98</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>2,513.47</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>115.59</TableCell> {/* 10 */}
              <TableCell>10.29</TableCell> {/* 11 */}
              <TableCell>25.35</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>125.94</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>13,285.71</TableCell> {/* 22 */}
              <TableCell>10.83</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>225.75</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>1,315.84</TableCell> {/* 29 */}
              <TableCell>0.35</TableCell> {/* 30 */}
              <TableCell>4.62</TableCell> {/* 31 */}
              <TableCell>162.11</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>406.66</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>28.82</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>0.17</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>36,665.52</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>기판</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>243,990.00</TableCell> {/* 4 */}
              <TableCell>67,830.64</TableCell> {/* 5 */}
              <TableCell>1,300.11</TableCell> {/* 6 */}
              <TableCell>12.06</TableCell> {/* 7 */}
              <TableCell>3,968.31</TableCell> {/* 8 */}
              <TableCell>55.96</TableCell> {/* 9 */}
              <TableCell>75,658.35</TableCell> {/* 10 */}
              <TableCell>2,438.65</TableCell> {/* 11 */}
              <TableCell>56.47</TableCell> {/* 12 */}
              <TableCell>0.14</TableCell> {/* 13 */}
              <TableCell>3,814.50</TableCell> {/* 14 */}
              <TableCell>2,135.85</TableCell> {/* 15 */}
              <TableCell>5,303.68</TableCell> {/* 16 */}
              <TableCell>69.61</TableCell> {/* 17 */}
              <TableCell>1.15</TableCell> {/* 18 */}
              <TableCell>46.44</TableCell> {/* 19 */}
              <TableCell>0.43</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>55,995.46</TableCell> {/* 22 */}
              <TableCell>68.05</TableCell> {/* 23 */}
              <TableCell>94.79</TableCell> {/* 24 */}
              <TableCell>165.10</TableCell> {/* 25 */}
              <TableCell>1,070.88</TableCell> {/* 26 */}
              <TableCell>4.12</TableCell> {/* 27 */}
              <TableCell>231.80</TableCell> {/* 28 */}
              <TableCell>136.18</TableCell> {/* 29 */}
              <TableCell>176.30</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>572.33</TableCell> {/* 32 */}
              <TableCell>728.93</TableCell> {/* 33 */}
              <TableCell>0.36</TableCell> {/* 34 */}
              <TableCell>11.05</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>7.22</TableCell> {/* 37 */}
              <TableCell>6.13</TableCell> {/* 38 */}
              <TableCell>221.46</TableCell> {/* 39 */}
              <TableCell>72.13</TableCell> {/* 40 */}
              <TableCell>6.74</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>2.34</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>0.05</TableCell> {/* 46 */}
              <TableCell>1.72</TableCell> {/* 47 */}
              <TableCell>0.14</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>6.89</TableCell> {/* 50 */}
              <TableCell>1.63</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>1.72</TableCell> {/* 53 */}
              <TableCell>0.27</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>21,713.87</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>냉매</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>9,122.00</TableCell> {/* 4 */}
              <TableCell>7,630.29</TableCell> {/* 5 */}
              <TableCell>26.65</TableCell> {/* 6 */}
              <TableCell>3.03</TableCell> {/* 7 */}
              <TableCell>1,458.97</TableCell> {/* 8 */}
              <TableCell>3.06</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>목재</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>6,730.00</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>328.96</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>6,401.04</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>배터리</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>수은함유폐램프</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>3,600.00</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>2,356.84</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>1,243.16</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>스테인리스</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>265,460.00</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>195,462.17</TableCell> {/* 6 */}
              <TableCell>69.62</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>83.13</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>77.85</TableCell> {/* 37 */}
              <TableCell>8,068.24</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>845.11</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>60,853.88</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>실리콘</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>아연</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>4,710.00</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>4.74</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>0.69</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>3,265.10</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>58.70</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>1,380.77</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>알루미늄</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>461,682.00</TableCell> {/* 4 */}
              <TableCell>346,762.87</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>1.13</TableCell> {/* 7 */}
              <TableCell>4,542.49</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>91,223.34</TableCell> {/* 10 */}
              <TableCell>79.61</TableCell> {/* 11 */}
              <TableCell>76.02</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>1,202.69</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>21.36</TableCell> {/* 16 */}
              <TableCell>3.02</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>15.18</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>119.17</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>101.34</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>977.95</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>12.36</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>853.40</TableCell> {/* 33 */}
              <TableCell>0.47</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>12.01</TableCell> {/* 39 */}
              <TableCell>1.57</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>18.81</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>0.08</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>0.98</TableCell> {/* 50 */}
              <TableCell>420.27</TableCell> {/* 51 */}
              <TableCell>5.91</TableCell> {/* 52 */}
              <TableCell>0.22</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>15,229.75</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>오일</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>유리</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>825,170.00</TableCell> {/* 4 */}
              <TableCell>390,858.90</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>6,719.73</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>375,464.14</TableCell> {/* 10 */}
              <TableCell>3,698.90</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>554.53</TableCell> {/* 15 */}
              <TableCell>2,328.35</TableCell> {/* 16 */}
              <TableCell>2.34</TableCell> {/* 17 */}
              <TableCell>6.85</TableCell> {/* 18 */}
              <TableCell>16.45</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>39,296.38</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>264.06</TableCell> {/* 25 */}
              <TableCell>2,101.23</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>93.79</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>11.10</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>3,753.23</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
            <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>작업철</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>737,396.00</TableCell> {/* 4 */}
              <TableCell>131,287.51</TableCell> {/* 5 */}
              <TableCell>2,626.06</TableCell> {/* 6 */}
              <TableCell>142.05</TableCell> {/* 7 */}
              <TableCell>78,533.72</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>4,754.91</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>2,834.46</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>24.38</TableCell> {/* 16 */}
              <TableCell>0.35</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>491,681.28</TableCell> {/* 21 */}
              <TableCell>1,467.46</TableCell> {/* 22 */}
              <TableCell>4,088.79</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>43.30</TableCell> {/* 26 */}
              <TableCell>570.43</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>49.19</TableCell> {/* 32 */}
              <TableCell>0.06</TableCell> {/* 33 */}
              <TableCell>15.82</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>921.09</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>2,519.20</TableCell> {/* 38 */}
              <TableCell>9.26</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>0.49</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>4.68</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>0.74</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>18.02</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>49.97</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>15,752.79</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>전선</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>135,170.00</TableCell> {/* 4 */}
              <TableCell>37,676.36</TableCell> {/* 5 */}
              <TableCell>258.89</TableCell> {/* 6 */}
              <TableCell>38.25</TableCell> {/* 7 */}
              <TableCell>6,111.05</TableCell> {/* 8 */}
              <TableCell>99.24</TableCell> {/* 9 */}
              <TableCell>25,180.65</TableCell> {/* 10 */}
              <TableCell>302.04</TableCell> {/* 11 */}
              <TableCell>7.89</TableCell> {/* 12 */}
              <TableCell>0.00</TableCell> {/* 13 */}
              <TableCell>997.45</TableCell> {/* 14 */}
              <TableCell>1,080.07</TableCell> {/* 15 */}
              <TableCell>1,251.00</TableCell> {/* 16 */}
              <TableCell>19.06</TableCell> {/* 17 */}
              <TableCell>0.17</TableCell> {/* 18 */}
              <TableCell>4.92</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>40,849.57</TableCell> {/* 22 */}
              <TableCell>39.99</TableCell> {/* 23 */}
              <TableCell>487.88</TableCell> {/* 24 */}
              <TableCell>120.09</TableCell> {/* 25 */}
              <TableCell>1,300.14</TableCell> {/* 26 */}
              <TableCell>1.73</TableCell> {/* 27 */}
              <TableCell>233.02</TableCell> {/* 28 */}
              <TableCell>64.01</TableCell> {/* 29 */}
              <TableCell>163.04</TableCell> {/* 30 */}
              <TableCell>35.93</TableCell> {/* 31 */}
              <TableCell>140.18</TableCell> {/* 32 */}
              <TableCell>161.93</TableCell> {/* 33 */}
              <TableCell>0.06</TableCell> {/* 34 */}
              <TableCell>11.09</TableCell> {/* 35 */}
              <TableCell>10.89</TableCell> {/* 36 */}
              <TableCell>46.55</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>1,470.75</TableCell> {/* 39 */}
              <TableCell>1.91</TableCell> {/* 40 */}
              <TableCell>6.61</TableCell> {/* 41 */}
              <TableCell>5.54</TableCell> {/* 42 */}
              <TableCell>5.28</TableCell> {/* 43 */}
              <TableCell>2.93</TableCell> {/* 44 */}
              <TableCell>74.30</TableCell> {/* 45 */}
              <TableCell>0.05</TableCell> {/* 46 */}
              <TableCell>3.17</TableCell> {/* 47 */}
              <TableCell>0.19</TableCell> {/* 48 */}
              <TableCell>0.01</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>0.70</TableCell> {/* 51 */}
              <TableCell>98.01</TableCell> {/* 52 */}
              <TableCell>11.77</TableCell> {/* 53 */}
              <TableCell>0.11</TableCell> {/* 54 */}
              <TableCell>1.76</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>16,793.76</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
            <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>전자부품</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>8.00</TableCell> {/* 4 */}
              <TableCell>1.31</TableCell> {/* 5 */}
              <TableCell>0.23</TableCell> {/* 6 */}
              <TableCell>0.00</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>0.24</TableCell> {/* 16 */}
              <TableCell>0.00</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>0.02</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>0.02</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>0.90</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>5.25</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>종이</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>컴프레셔</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>1,917,590.00</TableCell> {/* 4 */}
              <TableCell>1,764,441.58</TableCell> {/* 5 */}
              <TableCell>13,039.45</TableCell> {/* 6 */}
              <TableCell>291.17</TableCell> {/* 7 */}
              <TableCell>135,165.42</TableCell> {/* 8 */}
              <TableCell>4,652.38</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>토너</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>파워</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>플라스틱(ABS)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>298,800.00</TableCell> {/* 4 */}
              <TableCell>208,999.15</TableCell> {/* 5 */}
              <TableCell>1,149.25</TableCell> {/* 6 */}
              <TableCell>1.22</TableCell> {/* 7 */}
              <TableCell>1,609.21</TableCell> {/* 8 */}
              <TableCell>221.33</TableCell> {/* 9 */}
              <TableCell>5,366.45</TableCell> {/* 10 */}
              <TableCell>1,773.00</TableCell> {/* 11 */}
              <TableCell>1.04</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>145.70</TableCell> {/* 14 */}
              <TableCell>730.66</TableCell> {/* 15 */}
              <TableCell>4,579.38</TableCell> {/* 16 */}
              <TableCell>24.69</TableCell> {/* 17 */}
              <TableCell>1.15</TableCell> {/* 18 */}
              <TableCell>2.23</TableCell> {/* 19 */}
              <TableCell>0.08</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>37,936.41</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>872.94</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>572.29</TableCell> {/* 26 */}
              <TableCell>8.33</TableCell> {/* 27 */}
              <TableCell>312.33</TableCell> {/* 28 */}
              <TableCell>154.05</TableCell> {/* 29 */}
              <TableCell>702.92</TableCell> {/* 30 */}
              <TableCell>15.48</TableCell> {/* 31 */}
              <TableCell>114.65</TableCell> {/* 32 */}
              <TableCell>13.54</TableCell> {/* 33 */}
              <TableCell>0.76</TableCell> {/* 34 */}
              <TableCell>35.86</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>126.90</TableCell> {/* 37 */}
              <TableCell>58.10</TableCell> {/* 38 */}
              <TableCell>1,159.94</TableCell> {/* 39 */}
              <TableCell>4.56</TableCell> {/* 40 */}
              <TableCell>3.70</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>3.73</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>13.44</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>7.62</TableCell> {/* 47 */}
              <TableCell>0.67</TableCell> {/* 48 */}
              <TableCell>0.10</TableCell> {/* 49 */}
              <TableCell>2.05</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>16.85</TableCell> {/* 52 */}
              <TableCell>1.64</TableCell> {/* 53 */}
              <TableCell>0.28</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>32,056.31</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>플라스틱(ABS+PC)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>플라스틱(EVA)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>플라스틱(PA)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>플라스틱(PC)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>플라스틱(PE)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>142.00</TableCell> {/* 4 */}
              <TableCell>141.95</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>0.01</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>0.04</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>플라스틱(PMMA)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>플라스틱(PP)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>108,660.00</TableCell> {/* 4 */}
              <TableCell>34,770.43</TableCell> {/* 5 */}
              <TableCell>42.19</TableCell> {/* 6 */}
              <TableCell>0.75</TableCell> {/* 7 */}
              <TableCell>468.28</TableCell> {/* 8 */}
              <TableCell>11.07</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>65.75</TableCell> {/* 14 */}
              <TableCell>0.25</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>0.83</TableCell> {/* 17 */}
              <TableCell>0.01</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>66,673.65</TableCell> {/* 20 */}
              <TableCell>20.45</TableCell> {/* 21 */}
              <TableCell>189.47</TableCell> {/* 22 */}
              <TableCell>3.66</TableCell> {/* 23 */}
              <TableCell>80.86</TableCell> {/* 24 */}
              <TableCell>1.46</TableCell> {/* 25 */}
              <TableCell>205.57</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>8.11</TableCell> {/* 28 */}
              <TableCell>9.53</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>341.56</TableCell> {/* 31 */}
              <TableCell>0.01</TableCell> {/* 32 */}
              <TableCell>0.77</TableCell> {/* 33 */}
              <TableCell>5.32</TableCell> {/* 34 */}
              <TableCell>10.71</TableCell> {/* 35 */}
              <TableCell>3.77</TableCell> {/* 36 */}
              <TableCell>125.79</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>2.67</TableCell> {/* 39 */}
              <TableCell>8.80</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>0.35</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>0.38</TableCell> {/* 47 */}
              <TableCell>27.07</TableCell> {/* 48 */}
              <TableCell>22.02</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>6.31</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>5,552.13</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>플라스틱(PP+PS)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>플라스틱(PS)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>890,360.00</TableCell> {/* 4 */}
              <TableCell>644,100.96</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>1.71</TableCell> {/* 7 */}
              <TableCell>69,274.33</TableCell> {/* 8 */}
              <TableCell>53.34</TableCell> {/* 9 */}
              <TableCell>156,934.86</TableCell> {/* 10 */}
              <TableCell>1,916.21</TableCell> {/* 11 */}
              <TableCell>4.44</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>436.53</TableCell> {/* 14 */}
              <TableCell>2,207.19</TableCell> {/* 15 */}
              <TableCell>7,319.02</TableCell> {/* 16 */}
              <TableCell>117.78</TableCell> {/* 17 */}
              <TableCell>7.42</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>2,339.78</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>0.05</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>1,269.05</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>31.41</TableCell> {/* 37 */}
              <TableCell>0.73</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>6.05</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>11.78</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>10.45</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>4,316.91</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>플라스틱(PUR)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>2,242,710.00</TableCell> {/* 4 */}
              <TableCell>2,242,597.99</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>112.01</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>플라스틱(PVC)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>플라스틱(SAN)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>플라스틱(미분류)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>6,518,220.00</TableCell> {/* 4 */}
              <TableCell>5,291,332.45</TableCell> {/* 5 */}
              <TableCell>10,839.34</TableCell> {/* 6 */}
              <TableCell>163.73</TableCell> {/* 7 */}
              <TableCell>36,608.42</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>263,530.80</TableCell> {/* 10 */}
              <TableCell>47,618.59</TableCell> {/* 11 */}
              <TableCell>228.13</TableCell> {/* 12 */}
              <TableCell>0.53</TableCell> {/* 13 */}
              <TableCell>19.24</TableCell> {/* 14 */}
              <TableCell>36,803.24</TableCell> {/* 15 */}
              <TableCell>59,687.99</TableCell> {/* 16 */}
              <TableCell>256.15</TableCell> {/* 17 */}
              <TableCell>5.57</TableCell> {/* 18 */}
              <TableCell>239.41</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>670,083.48</TableCell> {/* 22 */}
              <TableCell>1,464.19</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>10,626.91</TableCell> {/* 25 */}
              <TableCell>675.56</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>2,662.88</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>51.31</TableCell> {/* 30 */}
              <TableCell>78.57</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>1,442.28</TableCell> {/* 33 */}
              <TableCell>12.38</TableCell> {/* 34 */}
              <TableCell>82.50</TableCell> {/* 35 */}
              <TableCell>681.08</TableCell> {/* 36 */}
              <TableCell>100.21</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>6,210.36</TableCell> {/* 39 */}
              <TableCell>164.25</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>15.95</TableCell> {/* 42 */}
              <TableCell>220.69</TableCell> {/* 43 */}
              <TableCell>250.36</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>0.69</TableCell> {/* 46 */}
              <TableCell>8.15</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>0.03</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>8.41</TableCell> {/* 51 */}
              <TableCell>79.41</TableCell> {/* 52 */}
              <TableCell>6.21</TableCell> {/* 53 */}
              <TableCell>3.73</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>75,956.81</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>하드디스크</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>470.00</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>16.20</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>444.60</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>0.84</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>8.36</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>호스</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>29,840.00</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>15,923.51</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>84.57</TableCell> {/* 25 */}
              <TableCell>32.67</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>0.77</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>4,275.02</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>0.07</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>9,523.38</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>유가물</TableCell> {/* 1 */}
              <TableCell>휴대폰파쇄품</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>폐기물</TableCell> {/* 1 */}
              <TableCell>기타폐기물(매립)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>74,320.00</TableCell> {/* 4 */}
              <TableCell>44,817.50</TableCell> {/* 5 */}
              <TableCell>156.37</TableCell> {/* 6 */}
              <TableCell>17.81</TableCell> {/* 7 */}
              <TableCell>1,710.78</TableCell> {/* 8 */}
              <TableCell>17.96</TableCell> {/* 9 */}
              <TableCell>6,940.82</TableCell> {/* 10 */}
              <TableCell>325.37</TableCell> {/* 11 */}
              <TableCell>2.35</TableCell> {/* 12 */}
              <TableCell>0.00</TableCell> {/* 13 */}
              <TableCell>116.25</TableCell> {/* 14 */}
              <TableCell>291.28</TableCell> {/* 15 */}
              <TableCell>419.33</TableCell> {/* 16 */}
              <TableCell>3.06</TableCell> {/* 17 */}
              <TableCell>0.13</TableCell> {/* 18 */}
              <TableCell>1.00</TableCell> {/* 19 */}
              <TableCell>0.01</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>16,059.37</TableCell> {/* 22 */}
              <TableCell>41.03</TableCell> {/* 23 */}
              <TableCell>101.11</TableCell> {/* 24 */}
              <TableCell>42.43</TableCell> {/* 25 */}
              <TableCell>320.26</TableCell> {/* 26 */}
              <TableCell>0.82</TableCell> {/* 27 */}
              <TableCell>58.30</TableCell> {/* 28 */}
              <TableCell>5.39</TableCell> {/* 29 */}
              <TableCell>24.92</TableCell> {/* 30 */}
              <TableCell>2.05</TableCell> {/* 31 */}
              <TableCell>19.37</TableCell> {/* 32 */}
              <TableCell>50.54</TableCell> {/* 33 */}
              <TableCell>0.11</TableCell> {/* 34 */}
              <TableCell>1.36</TableCell> {/* 35 */}
              <TableCell>2.55</TableCell> {/* 36 */}
              <TableCell>10.85</TableCell> {/* 37 */}
              <TableCell>5.23</TableCell> {/* 38 */}
              <TableCell>88.52</TableCell> {/* 39 */}
              <TableCell>1.59</TableCell> {/* 40 */}
              <TableCell>0.67</TableCell> {/* 41 */}
              <TableCell>1.76</TableCell> {/* 42 */}
              <TableCell>2.52</TableCell> {/* 43 */}
              <TableCell>3.40</TableCell> {/* 44 */}
              <TableCell>0.94</TableCell> {/* 45 */}
              <TableCell>0.00</TableCell> {/* 46 */}
              <TableCell>0.41</TableCell> {/* 47 */}
              <TableCell>0.02</TableCell> {/* 48 */}
              <TableCell>0.02</TableCell> {/* 49 */}
              <TableCell>0.15</TableCell> {/* 50 */}
              <TableCell>0.21</TableCell> {/* 51 */}
              <TableCell>5.58</TableCell> {/* 52 */}
              <TableCell>2.07</TableCell> {/* 53 */}
              <TableCell>0.04</TableCell> {/* 54 */}
              <TableCell>0.69</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>2,645.72</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>폐기물</TableCell> {/* 1 */}
              <TableCell>기타폐기물(소각)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>폐기물</TableCell> {/* 1 */}
              <TableCell>기타폐기물(열회수)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>폐기물</TableCell> {/* 1 */}
              <TableCell>지정폐기물(매립)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>폐기물</TableCell> {/* 1 */}
              <TableCell>지정폐기물(소각)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>폐기물</TableCell> {/* 1 */}
              <TableCell>지정폐기물(열회수)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>폐기물</TableCell> {/* 1 */}
              <TableCell>폐우레탄(매립)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>폐기물</TableCell> {/* 1 */}
              <TableCell>폐우레탄(소각)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>폐기물</TableCell> {/* 1 */}
              <TableCell>폐우레탄(열회수)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
              <TableCell>폐기물</TableCell> {/* 1 */}
              <TableCell>폐유리(매립)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>325,300.00</TableCell> {/* 4 */}
              <TableCell>196,167.02</TableCell> {/* 5 */}
              <TableCell>684.43</TableCell> {/* 6 */}
              <TableCell>77.97</TableCell> {/* 7 */}
              <TableCell>7,488.13</TableCell> {/* 8 */}
              <TableCell>78.61</TableCell> {/* 9 */}
              <TableCell>30,380.10</TableCell> {/* 10 */}
              <TableCell>1,424.16</TableCell> {/* 11 */}
              <TableCell>10.29</TableCell> {/* 12 */}
              <TableCell>0.01</TableCell> {/* 13 */}
              <TableCell>508.83</TableCell> {/* 14 */}
              <TableCell>1,274.92</TableCell> {/* 15 */}
              <TableCell>1,835.41</TableCell> {/* 16 */}
              <TableCell>13.40</TableCell> {/* 17 */}
              <TableCell>0.58</TableCell> {/* 18 */}
              <TableCell>4.38</TableCell> {/* 19 */}
              <TableCell>0.02</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>70,292.14</TableCell> {/* 22 */}
              <TableCell>179.58</TableCell> {/* 23 */}
              <TableCell>442.56</TableCell> {/* 24 */}
              <TableCell>185.72</TableCell> {/* 25 */}
              <TableCell>1,401.79</TableCell> {/* 26 */}
              <TableCell>3.60</TableCell> {/* 27 */}
              <TableCell>255.18</TableCell> {/* 28 */}
              <TableCell>23.59</TableCell> {/* 29 */}
              <TableCell>109.07</TableCell> {/* 30 */}
              <TableCell>8.98</TableCell> {/* 31 */}
              <TableCell>84.79</TableCell> {/* 32 */}
              <TableCell>221.21</TableCell> {/* 33 */}
              <TableCell>0.49</TableCell> {/* 34 */}
              <TableCell>5.97</TableCell> {/* 35 */}
              <TableCell>11.14</TableCell> {/* 36 */}
              <TableCell>47.50</TableCell> {/* 37 */}
              <TableCell>22.87</TableCell> {/* 38 */}
              <TableCell>387.44</TableCell> {/* 39 */}
              <TableCell>6.95</TableCell> {/* 40 */}
              <TableCell>2.94</TableCell> {/* 41 */}
              <TableCell>7.72</TableCell> {/* 42 */}
              <TableCell>11.04</TableCell> {/* 43 */}
              <TableCell>14.86</TableCell> {/* 44 */}
              <TableCell>4.09</TableCell> {/* 45 */}
              <TableCell>0.01</TableCell> {/* 46 */}
              <TableCell>1.78</TableCell> {/* 47 */}
              <TableCell>0.09</TableCell> {/* 48 */}
              <TableCell>0.07</TableCell> {/* 49 */}
              <TableCell>0.64</TableCell> {/* 50 */}
              <TableCell>0.92</TableCell> {/* 51 */}
              <TableCell>24.42</TableCell> {/* 52 */}
              <TableCell>9.04</TableCell> {/* 53 */}
              <TableCell>0.19</TableCell> {/* 54 */}
              <TableCell>3.02</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>11,580.36</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
            <TableCell>폐기물</TableCell> {/* 1 */}
              <TableCell>폐유리(소각)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
            <TableCell>폐기물</TableCell> {/* 1 */}
              <TableCell>폐유리(열회수)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
            <TableCell>폐기물</TableCell> {/* 1 */}
              <TableCell>폐플라스틱(매립)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
            <TableCell>폐기물</TableCell> {/* 1 */}
              <TableCell>폐플라스틱(소각)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
            <TableCell>폐기물</TableCell> {/* 1 */}
              <TableCell>폐플라스틱(열회수)</TableCell> {/* 2 */}
              <TableCell>kg</TableCell> {/* 3 */}
              <TableCell>-</TableCell> {/* 4 */}
              <TableCell>-</TableCell> {/* 5 */}
              <TableCell>-</TableCell> {/* 6 */}
              <TableCell>-</TableCell> {/* 7 */}
              <TableCell>-</TableCell> {/* 8 */}
              <TableCell>-</TableCell> {/* 9 */}
              <TableCell>-</TableCell> {/* 10 */}
              <TableCell>-</TableCell> {/* 11 */}
              <TableCell>-</TableCell> {/* 12 */}
              <TableCell>-</TableCell> {/* 13 */}
              <TableCell>-</TableCell> {/* 14 */}
              <TableCell>-</TableCell> {/* 15 */}
              <TableCell>-</TableCell> {/* 16 */}
              <TableCell>-</TableCell> {/* 17 */}
              <TableCell>-</TableCell> {/* 18 */}
              <TableCell>-</TableCell> {/* 19 */}
              <TableCell>-</TableCell> {/* 20 */}
              <TableCell>-</TableCell> {/* 21 */}
              <TableCell>-</TableCell> {/* 22 */}
              <TableCell>-</TableCell> {/* 23 */}
              <TableCell>-</TableCell> {/* 24 */}
              <TableCell>-</TableCell> {/* 25 */}
              <TableCell>-</TableCell> {/* 26 */}
              <TableCell>-</TableCell> {/* 27 */}
              <TableCell>-</TableCell> {/* 28 */}
              <TableCell>-</TableCell> {/* 29 */}
              <TableCell>-</TableCell> {/* 30 */}
              <TableCell>-</TableCell> {/* 31 */}
              <TableCell>-</TableCell> {/* 32 */}
              <TableCell>-</TableCell> {/* 33 */}
              <TableCell>-</TableCell> {/* 34 */}
              <TableCell>-</TableCell> {/* 35 */}
              <TableCell>-</TableCell> {/* 36 */}
              <TableCell>-</TableCell> {/* 37 */}
              <TableCell>-</TableCell> {/* 38 */}
              <TableCell>-</TableCell> {/* 39 */}
              <TableCell>-</TableCell> {/* 40 */}
              <TableCell>-</TableCell> {/* 41 */}
              <TableCell>-</TableCell> {/* 42 */}
              <TableCell>-</TableCell> {/* 43 */}
              <TableCell>-</TableCell> {/* 44 */}
              <TableCell>-</TableCell> {/* 45 */}
              <TableCell>-</TableCell> {/* 46 */}
              <TableCell>-</TableCell> {/* 47 */}
              <TableCell>-</TableCell> {/* 48 */}
              <TableCell>-</TableCell> {/* 49 */}
              <TableCell>-</TableCell> {/* 50 */}
              <TableCell>-</TableCell> {/* 51 */}
              <TableCell>-</TableCell> {/* 52 */}
              <TableCell>-</TableCell> {/* 53 */}
              <TableCell>-</TableCell> {/* 54 */}
              <TableCell>-</TableCell> {/* 55 */}
              <TableCell>-</TableCell> {/* 56 */}
              <TableCell>-</TableCell> {/* 57 */}
              <TableCell>-</TableCell> {/* 58 */}
            </TableRow>
            <TableRow>
            </TableRow>
            <TableRow>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}