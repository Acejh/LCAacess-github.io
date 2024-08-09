import { useState, useEffect, FC } from 'react'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

interface IProfileDetails {
  name: string;
  contactPhone: string;
  communications: {
    email: string;
  };
}

const profileDetailsInitValues: IProfileDetails = {
  name: '',
  contactPhone: '',
  communications: {
    email: '',
  },
}

const profileDetailsSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  contactPhone: Yup.string().required('Contact phone is required'),
  communications: Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email is required'),
  }),
})

const ProfileDetails: FC = () => {
  const [data, setData] = useState<IProfileDetails>(profileDetailsInitValues)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('kt-auth-react-v') || '{}').userInfo
      const { companyCode, role } = userInfo

      const response = await axios.get(`https://lcaapi.acess.co.kr/Users?companyCode=${companyCode}&role=${role}`)
      const userData = response.data.list[0]
      setUserId(userData.id)

      setData({
        name: userData.name,
        contactPhone: userData.phoneNumber,
        communications: {
          email: userData.email,
        },
      })
    } catch (error) {
      setApiError('Failed to fetch data from API')
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const formik = useFormik<IProfileDetails>({
    initialValues: data,
    enableReinitialize: true,
    validationSchema: profileDetailsSchema,
    onSubmit: async (values) => {
      setLoading(true)
      try {
        await axios.put(`https://lcaapi.acess.co.kr/Users/${userId}`, {
          name: values.name,
          phoneNumber: values.contactPhone,
          email: values.communications.email,
        })
        setData(values)
        
        // Update localStorage
        const updatedUserInfo = {
          ...JSON.parse(localStorage.getItem('kt-auth-react-v') || '{}'),
          userInfo: {
            ...JSON.parse(localStorage.getItem('kt-auth-react-v') || '{}').userInfo,
            name: values.name,
            contactPhone: values.contactPhone,
            email: values.communications.email 
          }
        };
        localStorage.setItem('kt-auth-react-v', JSON.stringify(updatedUserInfo));
        
        navigate('/crafted/account/overview') 
      } catch (error) {
        setApiError('Failed to update data')
      } finally {
        setLoading(false)
      }
    },
  })

  if (apiError) {
    return <div>Error: {apiError}</div>
  }

  return (
    <div className='card mb-5 mb-xl-10'>
      <div
        className='card-header border-0 cursor-pointer'
        role='button'
        data-bs-toggle='collapse'
        data-bs-target='#kt_account_profile_details'
        aria-expanded='true'
        aria-controls='kt_account_profile_details'
      >
        <div className='card-title m-0'>
          <h3 className='fw-bolder m-0'>프로필 상세</h3>
        </div>
      </div>

      <div id='kt_account_profile_details' className='collapse show'>
        <form onSubmit={formik.handleSubmit} noValidate className='form'>
          <div className='card-body border-top p-9'>
            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-bold fs-6'>이름</label>
              <div className='col-lg-8'>
                <div className='fv-row'>
                  <input
                    type='text'
                    className='form-control form-control-lg form-control-solid'
                    placeholder='Name'
                    {...formik.getFieldProps('name')}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>{formik.errors.name}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label fw-bold fs-6'>
                <span className='required'>전화번호</span>
              </label>

              <div className='col-lg-8 fv-row'>
                <input
                  type='tel'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Phone number'
                  {...formik.getFieldProps('contactPhone')}
                />
                {formik.touched.contactPhone && formik.errors.contactPhone && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.contactPhone}</div>
                  </div>
                )}
              </div>
            </div>

            <div className='row mb-6'>
              <label className='col-lg-4 col-form-label required fw-bold fs-6'>이메일</label>
              <div className='col-lg-8 fv-row'>
                <input
                  type='email'
                  className='form-control form-control-lg form-control-solid'
                  placeholder='Email'
                  {...formik.getFieldProps('communications.email')}
                />
                {formik.touched.communications?.email && formik.errors.communications?.email && (
                  <div className='fv-plugins-message-container'>
                    <div className='fv-help-block'>{formik.errors.communications.email}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='card-footer d-flex justify-content-end py-6 px-9'>
            <button type='submit' className='btn btn-primary' disabled={loading}>
              {!loading && '변경사항 저장'}
              {loading && (
                <span className='indicator-progress' style={{ display: 'block' }}>
                  Please wait...{' '}
                  <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export { ProfileDetails }