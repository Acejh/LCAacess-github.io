import { FC } from 'react'
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom'
import { PrivateRoutes } from './PrivateRoutes'
import { ErrorsPage } from '../modules/errors/ErrorsPage'
import { Logout, AuthPage, useAuth } from '../modules/auth'
import { App } from '../App'

const { BASE_URL } = import.meta.env

const AppRoutes: FC = () => {
  const { currentUser } = useAuth()

  return (
    <BrowserRouter basename={BASE_URL}>
      <Routes>
        <Route element={<App />}>
          <Route path='error/*' element={<ErrorsPage />} />
          <Route path='logout' element={<Logout />} />
          {currentUser ? (
            <>
              <Route path='/*' element={<PrivateRoutes />} />
              {currentUser.role === 'Admin' ? (
                <Route index element={<Navigate to='/Ad_Dashboard' />} />
              ) : (
                <Route index element={<Navigate to='/Dashboard' />} />
              )}
            </>
          ) : (
            <>
              <Route path='auth/*' element={<AuthPage />} />
              <Route path='*' element={<Navigate to='/auth' />} />
            </>
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export { AppRoutes }