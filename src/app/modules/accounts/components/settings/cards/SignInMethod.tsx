import { useState, FC, useEffect } from 'react'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import axios from 'axios'
import { Snackbar, Alert } from '@mui/material'
import { getApiUrl } from '../../../../../../main'

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
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })
  const [isFormVisible, setFormVisible] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('kt-auth-react-v') || '{}').userInfo
        const { userName } = userInfo

        if (!userName) {
          setApiError('UserName을 찾을 수 없습니다.')
          return
        }

        setUserName(userName)

        const response = await axios.get(`${getApiUrl}/Users/username/${userName}`)

        if (response.data && response.data.id) {
          setUserId(response.data.id)
          console.log('수정할 userId:', response.data.id)
        } else {
          setApiError('사용자 정보를 찾을 수 없습니다.')
        }
      } catch (error) {
        console.error('API 호출 실패:', error)
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
        const response = await axios.put(`${getApiUrl}/Users/password/${userId}`, {
          userName: userName,
          password: values.currentPassword,
          newPassword: values.newPassword
        })
        console.log('비밀번호 업데이트가 완료되었습니다.', response.data)

        // 성공 알림 표시 및 폼 닫기
        setAlert({
          open: true,
          message: '비밀번호가 성공적으로 변경되었습니다.',
          severity: 'success',
        })
        setFormVisible(false) // 폼 숨김
      } catch (error) {
        console.error('비밀번호 변경중 오류 발생..', error)

        // 실패 알림 표시
        setAlert({
          open: true,
          message: '비밀번호 변경중 오류가 발생했습니다.',
          severity: 'error',
        })
        setApiError('비밀번호 변경중 오류 발생...')
      } finally {
        setLoading(false)
      }
    },
  })

  const handleAlertClose = () => {
    setAlert((prev) => ({ ...prev, open: false }))
  }

  const toggleFormVisibility = () => {
    setFormVisible((prev) => !prev)
  }

  return (
    <div className='card mb-5 mb-xl-10'>
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>

      <div
        className='card-header border-0 cursor-pointer'
        role='button'
        onClick={toggleFormVisibility} // 폼 보이기/숨기기 토글
      >
        <div className='card-title m-0'>
          <h3 className='fw-bolder m-0'>비밀번호 변경</h3>
        </div>
      </div>

      {isFormVisible && ( // 폼 표시 여부에 따라 렌더링
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
      )}
    </div>
  )
}

export { SignInMethod }