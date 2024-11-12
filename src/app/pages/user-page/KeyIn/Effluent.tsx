import React from 'react'
import axios from 'axios'

export function Effluent() {
  const handleTokenRefresh = async () => {
    const authString = localStorage.getItem('kt-auth-react-v')
    if (!authString) {
      console.error('No auth data found in local storage')
      return
    }

    const auth = JSON.parse(authString)
    const { accessToken, refreshToken } = auth

    if (!accessToken || !refreshToken) {
      console.error('No tokens found in auth data')
      return
    }

    try {
      const response = await axios.post('https://lcaapi.acess.co.kr/Auth/refresh-token', {
        accessToken,
        refreshToken,
      })

      // 재발급 받은 토큰을 로컬 스토리지에 업데이트 (주석 처리)
      auth.accessToken = response.data.accessToken
      auth.refreshToken = response.data.refreshToken
      localStorage.setItem('kt-auth-react-v', JSON.stringify(auth))

    } catch (error) {
      console.error('Error refreshing token', error)
      // 토큰 갱신에 실패하면 로그인 페이지로 리디렉션
      window.location.href = '/auth'
    }
  }

  return (
    <div>
      <h1>Effluent</h1>
      <button onClick={handleTokenRefresh}>Refresh Token</button>
    </div>
  )
}