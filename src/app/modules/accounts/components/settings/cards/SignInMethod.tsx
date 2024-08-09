import { useState, FC, useEffect } from 'react'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import axios from 'axios'

interface IUpdatePassword {
  currentPassword: string;
  newPassword: string;
}

const passwordFormValidationSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('Password is required'),
  newPassword: Yup.string()
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('New password is required'),
})

const SignInMethod: FC = () => {
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('kt-auth-react-v') || '{}').userInfo
        const { companyCode, role, userName } = userInfo

        setUserName(userName)

        const response = await axios.get(`https://lcaapi.acess.co.kr/Users?companyCode=${companyCode}&role=${role}`)
        const userData = response.data.list[0]
        setUserId(userData.id)
      } catch (error) {
        setApiError('Failed to fetch data from API')
      }
    }

    fetchData()
  }, [])

  const formik = useFormik<IUpdatePassword>({
    initialValues: {
      currentPassword: '',
      newPassword: ''
    },
    validationSchema: passwordFormValidationSchema,
    onSubmit: async (values) => {
      if (!userId || !userName) {
        setApiError('User ID or User Name is missing')
        return
      }
      setLoading(true)
      setApiError(null)
      try {
        const response = await axios.put(`https://lcaapi.acess.co.kr/Users/password/${userId}`, {
          userName: userName,
          password: values.currentPassword,
          newPassword: values.newPassword
        })
        console.log('Password update successful', response.data)
      } catch (error) {
        console.error('Failed to update password', error)
        setApiError('Failed to update password')
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <div className='card mb-5 mb-xl-10'>
      <div
        className='card-header border-0 cursor-pointer'
        role='button'
        data-bs-toggle='collapse'
        data-bs-target='#kt_account_signin_method'
      >
        <div className='card-title m-0'>
          <h3 className='fw-bolder m-0'>비밀번호 변경</h3>
        </div>
      </div>

      <div id='kt_account_signin_method' className='collapse show'>
        <div className='card-body border-top p-9'>
          <form onSubmit={formik.handleSubmit} className='form' noValidate>
            <div className='row mb-1'>
              <div className='col-lg-6'>
                <div className='fv-row mb-0'>
                  <label htmlFor='currentPassword' className='form-label fs-6 fw-bolder mb-3'>
                    기존 비밀번호
                  </label>
                  <input
                    type='password'
                    className='form-control form-control-lg form-control-solid'
                    id='currentPassword'
                    {...formik.getFieldProps('currentPassword')}
                  />
                  {formik.touched.currentPassword && formik.errors.currentPassword && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>{formik.errors.currentPassword}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className='col-lg-6'>
                <div className='fv-row mb-0'>
                  <label htmlFor='newPassword' className='form-label fs-6 fw-bolder mb-3'>
                    변경 비밀번호
                  </label>
                  <input
                    type='password'
                    className='form-control form-control-lg form-control-solid'
                    id='newPassword'
                    {...formik.getFieldProps('newPassword')}
                  />
                  {formik.touched.newPassword && formik.errors.newPassword && (
                    <div className='fv-plugins-message-container'>
                      <div className='fv-help-block'>{formik.errors.newPassword}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className='d-flex'>
              <button
                id='kt_password_submit'
                type='submit'
                className='btn btn-primary me-2 px-6'
                disabled={loading}
              >
                {!loading && '비밀번호 변경'}
                {loading && (
                  <span className='indicator-progress' style={{ display: 'block' }}>
                    Please wait...{' '}
                    <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                  </span>
                )}
              </button>
            </div>
            {apiError && (
              <div className='fv-plugins-message-container mt-3'>
                <div className='fv-help-block text-danger'>{apiError}</div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export { SignInMethod }