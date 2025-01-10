/* eslint-disable react-refresh/only-export-components */

import React, { FC, useState, useEffect, createContext, useContext, Dispatch, SetStateAction } from 'react';
import { LayoutSplashScreen } from '../../../../_metronic/layout/core';
import { AuthModel, UserModel } from './_models';
import { getAuth, setAuth, removeAuth } from './AuthHelpers';
import { WithChildren } from '../../../../_metronic/helpers';

type AuthContextProps = {
  auth: AuthModel | undefined;
  saveAuth: (auth: AuthModel | undefined) => void;
  currentUser: UserModel | undefined;
  setCurrentUser: Dispatch<SetStateAction<UserModel | undefined>>;
  logout: () => void;
};

const initAuthContextPropsState = {
  auth: getAuth(),
  saveAuth: () => {},
  currentUser: undefined,
  setCurrentUser: () => {},
  logout: () => {},
};

const AUTH_LOCAL_STORAGE_KEY = 'kt-auth-react-v';

const AuthContext = createContext<AuthContextProps>(initAuthContextPropsState);

const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider: FC<WithChildren> = ({ children }) => {
  const [auth, setAuthState] = useState<AuthModel | undefined>(getAuth());
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>();

  useEffect(() => {
    // 페이지 로드 시 로컬 스토리지에서 인증 정보 가져오기
    const storedAuth = getAuth();
    if (storedAuth) {
      setAuthState(storedAuth);
      setCurrentUser(storedAuth.userInfo);
    }

    // 다른 탭에서 로컬 스토리지 변경 사항 감지
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === AUTH_LOCAL_STORAGE_KEY) {
        const updatedAuth = getAuth();
        if (!updatedAuth) {
          // 다른 탭에서 로그아웃된 경우
          setAuthState(undefined);
          setCurrentUser(undefined);
        } else {
          // 다른 탭에서 로그인된 경우
          setAuthState(updatedAuth);
          setCurrentUser(updatedAuth.userInfo);
        }
      }
    };

    // 페이지 닫기 시에만 로그아웃 처리
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const target = event.currentTarget as Window; // 타입 단언
      if (!target.location.href.includes('/logout')) {
        return;
      }
      removeAuth();
      setCurrentUser(undefined);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const saveAuth = (auth: AuthModel | undefined) => {
    setAuthState(auth);
    if (auth) {
      setAuth(auth);
      setCurrentUser(auth.userInfo);
    } else {
      removeAuth();
      setCurrentUser(undefined);
    }
  };

  const logout = () => {
    saveAuth(undefined);
    removeAuth();
    setCurrentUser(undefined);
  };

  return (
    <AuthContext.Provider value={{ auth, saveAuth, currentUser, setCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

const AuthInit: FC<WithChildren> = ({ children }) => {
  const { auth, logout, setCurrentUser } = useAuth();
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  useEffect(() => {
    if (auth && auth.accessToken) {
      setCurrentUser(auth.userInfo); // auth 정보로 currentUser 설정
    } else {
      logout(); // auth 정보가 없으면 로그아웃 처리
    }
    setShowSplashScreen(false); // 로딩 화면 제거
  }, [auth, logout, setCurrentUser]);

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>;
};

export { AuthProvider, AuthInit, useAuth };