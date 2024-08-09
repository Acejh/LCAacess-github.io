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

const AuthContext = createContext<AuthContextProps>(initAuthContextPropsState);

const useAuth = () => {
  return useContext(AuthContext);
};

const AuthProvider: FC<WithChildren> = ({ children }) => {
  const [auth, setAuthState] = useState<AuthModel | undefined>(getAuth());
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>();

  useEffect(() => {
    const storedAuth = getAuth();
    if (storedAuth) {
      setAuthState(storedAuth);
      setCurrentUser(storedAuth.userInfo);
    }
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
    setCurrentUser(undefined);
    removeAuth();
  };

  return (
    <AuthContext.Provider value={{ auth, saveAuth, currentUser, setCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const AuthInit: FC<WithChildren> = ({ children }) => {
  const { auth, logout, setCurrentUser } = useAuth();
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  useEffect(() => {
    if (auth && auth.accessToken) {
      setCurrentUser(auth.userInfo);
    } else {
      logout();
      setShowSplashScreen(false);
    }
    setShowSplashScreen(false);
  }, [auth, logout, setCurrentUser]);

  return showSplashScreen ? <LayoutSplashScreen /> : <>{children}</>;
};

export { AuthProvider, AuthInit, useAuth };