import { FC } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { PrivateRoutes } from './PrivateRoutes';
import { ErrorsPage } from '../modules/errors/ErrorsPage';
import { Logout, AuthPage, useAuth } from '../modules/auth';
import { App } from '../App';
import { Ad_Dashboard } from '../pages/admin-page/Management/Ad_Dashboard';

const { BASE_URL } = import.meta.env;

const AppRoutes: FC = () => {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter basename={BASE_URL}>
      <Routes>
        <Route element={<App />}>
          <Route path='error/*' element={<ErrorsPage />} />
          <Route path='logout' element={<Logout />} />

          {/* 인증된 사용자 */}
          {currentUser ? (
            <>
              <Route path='/*' element={<PrivateRoutes />}>
                <Route path="Ad_Dashboard" element={<Ad_Dashboard />} />
              </Route>
              {/* 기본 경로로 대시보드로 리다이렉트 */}
              <Route index element={<Navigate to='/Ad_Dashboard' />} />
            </>
          ) : (
            <>
              {/* 인증되지 않은 사용자 */}
              <Route path='auth/*' element={<AuthPage />} />
              {/* 모든 기타 경로는 로그인 페이지로 리다이렉트 */}
              <Route path='*' element={<Navigate to='/auth' />} />
            </>
          )}
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export { AppRoutes };