
import { FC } from 'react'
import {KTIcon, toAbsoluteUrl} from '../../../_metronic/helpers'
// import {Link} from 'react-router-dom'
// import {Dropdown1} from '../../../_metronic/partials'
// import {useLocation} from 'react-router'
import { ToolbarWrapper } from '../../../_metronic/layout/components/toolbar'
import { Content } from '../../../_metronic/layout/components/content'

const AccountHeader: FC = () => {
  // const location = useLocation()

  return (
    <>
      <ToolbarWrapper />
      <Content>
        <div className='card mb-5 mb-xl-10'>
          <div className='card-body pt-9 pb-0'>
            <div className='d-flex flex-wrap flex-sm-nowrap mb-3'>
              <div className='me-7 mb-4'>
                <div className='symbol symbol-100px symbol-lg-160px symbol-fixed position-relative'>
                  <img src={toAbsoluteUrl('/media/avatars/300-1.jpg')} alt='Metronic' />
                  <div className='position-absolute translate-middle bottom-0 start-100 mb-6 bg-success rounded-circle border border-4 border-white h-20px w-20px'></div>
                </div>
              </div>

              <div className='flex-grow-1'>
                <div className='d-flex justify-content-between align-items-start flex-wrap mb-2'>
                  <div className='d-flex flex-column'>
                    <div className='d-flex align-items-center mb-2'>
                      <a href='#' className='text-gray-800 text-hover-primary fs-2 fw-bolder me-1'>
                        아담
                      </a>
                      <a href='#'>
                        <KTIcon iconName='verify' className='fs-1 text-primary' />
                      </a>
                    </div>

                    <div className='d-flex flex-wrap fw-bold fs-6 mb-4 pe-2'>
                      <a
                        href='#'
                        className='d-flex align-items-center text-gray-500 text-hover-primary me-5 mb-2'
                      >
                        <KTIcon iconName='profile-circle' className='fs-4 me-1' />
                        회원사
                      </a>
                      <a
                        href='#'
                        className='d-flex align-items-center text-gray-500 text-hover-primary me-5 mb-2'
                      >
                        <KTIcon iconName='geolocation' className='fs-4 me-1' />
                        경기도 하남시 미사대로 540
                      </a>
                      <a
                        href='#'
                        className='d-flex align-items-center text-gray-500 text-hover-primary mb-2'
                      >
                        <KTIcon iconName='sms' className='fs-4 me-1' />
                        acess.co.kr
                      </a>
                    </div>
                  </div>

                  
                </div>

                {/* <div className='d-flex flex-wrap flex-stack'>
                  <div className='d-flex flex-column flex-grow-1 pe-8'>
                    <div className='d-flex flex-wrap'>
                      <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3'>
                        <div className='d-flex align-items-center'>
                          <KTIcon iconName='arrow-up' className='fs-3 text-success me-2' />
                          <div className='fs-2 fw-bolder'>4500$</div>
                        </div>

                        <div className='fw-bold fs-6 text-gray-500'>Earnings</div>
                      </div>

                      <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3'>
                        <div className='d-flex align-items-center'>
                          <KTIcon iconName='arrow-down' className='fs-3 text-danger me-2' />
                          <div className='fs-2 fw-bolder'>75</div>
                        </div>

                        <div className='fw-bold fs-6 text-gray-500'>Projects</div>
                      </div>

                      <div className='border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3'>
                        <div className='d-flex align-items-center'>
                          <KTIcon iconName='arrow-up' className='fs-3 text-success me-2' />
                          <div className='fs-2 fw-bolder'>60%</div>
                        </div>

                        <div className='fw-bold fs-6 text-gray-500'>Success Rate</div>
                      </div>
                    </div>
                  </div>

                  <div className='d-flex align-items-center w-200px w-sm-300px flex-column mt-3'>
                    <div className='d-flex justify-content-between w-100 mt-auto mb-2'>
                      <span className='fw-bold fs-6 text-gray-500'>프로필 완성도</span>
                      <span className='fw-bolder fs-6'>50%</span>
                    </div>
                    <div className='h-5px mx-3 w-100 bg-light mb-3'>
                      <div
                        className='bg-success rounded h-5px'
                        role='progressbar'
                        style={{width: '50%'}}
                      ></div>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>

            {/* <div className='d-flex overflow-auto h-55px'>
              <ul className='nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bolder flex-nowrap'>
                <li className='nav-item'>
                  <Link
                    className={
                      `nav-link text-active-primary me-6 ` +
                      (location.pathname === '/crafted/account/overview' && 'active')
                    }
                    to='/crafted/account/overview'
                  >
                    Overview
                  </Link>
                </li>
                <li className='nav-item'>
                  <Link
                    className={
                      `nav-link text-active-primary me-6 ` +
                      (location.pathname === '/crafted/account/settings' && 'active')
                    }
                    to='/crafted/account/settings'
                  >
                    Settings
                  </Link>
                </li>
              </ul>
            </div> */}
          </div>
        </div>
      </Content>
    </>
  )
}

export {AccountHeader}
