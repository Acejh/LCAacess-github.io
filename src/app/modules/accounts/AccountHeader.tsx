import { FC, useState, useEffect } from 'react'
import { KTIcon } from '../../../_metronic/helpers'
import { ToolbarWrapper } from '../../../_metronic/layout/components/toolbar'
import { Content } from '../../../_metronic/layout/components/content'
import axios from 'axios'

interface IUserDetails {
  name: string;
  role: string;
  email: string;
}

const AccountHeader: FC = () => {
  const [userDetails, setUserDetails] = useState<IUserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('kt-auth-react-v') || '{}').userInfo
      const { companyCode, role } = userInfo

      const response = await axios.get(`https://lcaapi.acess.co.kr/Users?companyCode=${companyCode}&role=${role}`)
      const userData = response.data.list[0]

      setUserDetails({
        name: userData.name,
        role: userData.role,
        email: userData.email,
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

  useEffect(() => {
    const handleStorageChange = () => {
      fetchData();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>
  }

  if (apiError) {
    return <div>Error: {apiError}</div>
  }

  return (
    <>
      <ToolbarWrapper />
      <Content>
        <div className='card mb-5 mb-xl-10'>
          <div className='card-body pt-9 pb-0'>
            <div className='d-flex flex-wrap flex-sm-nowrap mb-3'>
              <div className='me-7 mb-4'>
                {/* <div className='symbol symbol-100px symbol-lg-160px symbol-fixed position-relative'>
                  <img src={toAbsoluteUrl('/media/avatars/blank.png')} alt='Metronic' />
                  <div className='position-absolute translate-middle bottom-0 start-100 mb-6 bg-success rounded-circle border border-4 border-white h-20px w-20px'></div>
                </div> */}
              </div>

              <div className='flex-grow-1'>
                <div className='d-flex justify-content-between align-items-start flex-wrap mb-2'>
                  <div className='d-flex flex-column'>
                    <div className='d-flex align-items-center mb-2'>
                      <a href='#' className='text-gray-800 text-hover-primary fs-2 fw-bolder me-1'>
                        {userDetails?.name}
                      </a>
                      {/* <a href='#'>
                        <KTIcon iconName='verify' className='fs-1 text-primary' />
                      </a> */}
                    </div>

                    <div className='d-flex flex-wrap fw-bold fs-6 mb-4 pe-2'>
                      <a
                        href='#'
                        className='d-flex align-items-center text-gray-500 text-hover-primary me-5 mb-2'
                      >
                        <KTIcon iconName='profile-circle' className='fs-4 me-1' />
                        {userDetails?.role}
                      </a>
                      {/* <a
                        href='#'
                        className='d-flex align-items-center text-gray-500 text-hover-primary me-5 mb-2'
                      >
                        <KTIcon iconName='geolocation' className='fs-4 me-1' />
                        경기도 하남시 미사대로 540
                      </a> */}
                      <a
                        href='#'
                        className='d-flex align-items-center text-gray-500 text-hover-primary mb-2'
                      >
                        <KTIcon iconName='sms' className='fs-4 me-1' />
                        {userDetails?.email}
                      </a>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </Content>
    </>
  )
}

export { AccountHeader }