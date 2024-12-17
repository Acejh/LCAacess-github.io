import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Content } from '../../../../_metronic/layout/components/content'
import axios from 'axios'
import { getApiUrl } from '../../../../main'

interface UserProfile {
  name: string;
  phoneNumber: string;
  email: string;
  companyName: string;
}

export function Overview() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      // 로컬스토리지에서 사용자 정보를 가져옵니다.
      const userInfo = JSON.parse(localStorage.getItem('kt-auth-react-v') || '{}').userInfo
      const { userName } = userInfo
  
      if (!userName) {
        setApiError('UserName을 찾을 수 없습니다.')
        setLoading(false)
        return
      }
  
      // 수정된 GET API 호출
      const response = await axios.get(`${getApiUrl}/Users/username/${userName}`)
      const userData = response.data
  
      setUserProfile({
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        companyName: userData.companyName,
      })
      setLoading(false)
    } catch (error) {
      setApiError('Failed to fetch data from API')
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (apiError) {
    return <div>Error: {apiError}</div>
  }

  return (
    <Content>
      <div className='card mb-5 mb-xl-10' id='kt_profile_details_view'>
        <div className='card-header cursor-pointer'>
          <div className='card-title m-0'>
            <h3 className='fw-bolder m-0'>프로필 정보</h3>
          </div>

          <Link to='/crafted/account/settings' className='btn btn-primary align-self-center'>
            프로필 편집
          </Link>
        </div>

        <div className='card-body p-9'>
          <div className='row mb-7'>
            <label className='col-lg-4 fw-bold text-muted'>이름</label>
            <div className='col-lg-8'>
              <span className='fw-bolder fs-6 text-gray-900'>{userProfile?.name}</span>
            </div>
          </div>

          <div className='row mb-7'>
            <label className='col-lg-4 fw-bold text-muted'>
              전화번호
            </label>
            <div className='col-lg-8 d-flex align-items-center'>
              <span className='fw-bolder fs-6 me-2'>{userProfile?.phoneNumber}</span>
            </div>
          </div>

          <div className='row mb-7'>
            <label className='col-lg-4 fw-bold text-muted'>이메일</label>
            <div className='col-lg-8'>
              <a href='#' className='fw-bold fs-6 text-gray-900 text-hover-primary'>
                {userProfile?.email}
              </a>
            </div>
          </div>

          <div className='row mb-7'>
            <label className='col-lg-4 fw-bold text-muted'>회사 명</label>
            <div className='col-lg-8'>
              <a href='#' className='fw-bold fs-6 text-gray-900 text-hover-primary'>
                {userProfile?.companyName}
              </a>
            </div>
          </div>
        </div>
      </div>
    </Content>
  )
}