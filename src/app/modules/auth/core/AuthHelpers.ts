import axios, { AxiosError, InternalAxiosRequestConfig, AxiosHeaders, AxiosResponse } from 'axios'
import { AuthModel } from './_models'

const AUTH_LOCAL_STORAGE_KEY = 'kt-auth-react-v'

// CustomAxiosRequestConfig 타입 정의 및 InternalAxiosRequestConfig 확장
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const getAuth = (): AuthModel | undefined => {
  if (!localStorage) {
    return undefined
  }

  const lsValue: string | null = localStorage.getItem(AUTH_LOCAL_STORAGE_KEY)
  if (!lsValue) {
    return undefined
  }

  try {
    const auth: AuthModel = JSON.parse(lsValue) as AuthModel
    if (auth) {
      return auth
    }
  } catch (error) {
    console.error('AUTH LOCAL STORAGE PARSE ERROR', error)
  }
  return undefined
}

const setAuth = (auth: AuthModel) => {
  if (!localStorage) {
    return
  }

  try {
    const lsValue = JSON.stringify(auth)
    localStorage.setItem(AUTH_LOCAL_STORAGE_KEY, lsValue)
  } catch (error) {
    console.error('AUTH LOCAL STORAGE SAVE ERROR', error)
  }
}

const removeAuth = () => {
  if (!localStorage) {
    return
  }

  try {
    localStorage.removeItem(AUTH_LOCAL_STORAGE_KEY)
  } catch (error) {
    console.error('AUTH LOCAL STORAGE REMOVE ERROR', error)
  }
}

const logout = () => {
  removeAuth()
  window.location.href = '/auth' // 리디렉션
}

const refreshToken = async (accessToken: string, refreshToken: string): Promise<AuthModel | undefined> => {
  try {
    const response: AxiosResponse<AuthModel> = await axios.post('https://lcaapi.acess.co.kr/Auth/refresh-token', {
      accessToken,
      refreshToken,
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('토큰 재발급 오류 상태 코드:', error.response?.status)
      console.error('토큰 재발급 오류 응답 데이터:', error.response?.data)
      if (error.response?.status === 403) {
        const errorResponseData = error.response.data as { title?: string; message?: string }
        const errorMessage = errorResponseData.title || errorResponseData.message || '알 수 없는 오류 발생'
        console.error('토큰 재발급 실패:', errorMessage)
      }
    } else {
      console.error('토큰 재발급 오류:', error)
    }
    return undefined
  }
}

export function setupAxios(axiosInstance: typeof axios) {
  axiosInstance.defaults.headers.Accept = 'application/json'
  axiosInstance.interceptors.request.use(
    (config: CustomAxiosRequestConfig) => {
      const auth = getAuth()
      if (auth && auth.accessToken) {
        if (config.headers) {
          config.headers.set('Authorization', `Bearer ${auth.accessToken}`)
        } else {
          config.headers = new AxiosHeaders({ Authorization: `Bearer ${auth.accessToken}` })
        }
      }

      return config
    },
    (err: AxiosError) => Promise.reject(err)
  )

  axiosInstance.interceptors.response.use(
    response => response,
    async (error: AxiosError<unknown, CustomAxiosRequestConfig>) => {
      const originalRequest = error.config as CustomAxiosRequestConfig
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true
        const auth = getAuth()
        if (auth) {
          const newAuth = await refreshToken(auth.accessToken, auth.refreshToken)
          if (newAuth) {
            setAuth(newAuth);
            const updatedAuth = {
              ...newAuth,
              userInfo: auth.userInfo,
            }
            setAuth(updatedAuth)
            originalRequest.headers['Authorization'] = `Bearer ${newAuth.accessToken}`
            return axiosInstance(originalRequest)
          } else {
            // 토큰 재발급 실패 시 로그아웃 처리
            logout()
          }
        }
      } else if (error.response?.status === 403) {
        const errorResponseData = error.response?.data as { title?: string; message?: string }
        const errorMessage = errorResponseData?.title || errorResponseData?.message || '알 수 없는 오류 발생'
        console.error('요청이 거부되었습니다:', errorMessage)
        logout()
      }
      return Promise.reject(error)
    }
  )
}

export { getAuth, setAuth, removeAuth, AUTH_LOCAL_STORAGE_KEY }