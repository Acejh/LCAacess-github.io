import React, {Suspense} from 'react'
import {Outlet} from 'react-router-dom'
import {I18nProvider} from '../_metronic/i18n/i18nProvider'
import {LayoutProvider, LayoutSplashScreen} from '../_metronic/layout/core'
import {MasterInit} from '../_metronic/layout/MasterInit'
import {AuthInit} from './modules/auth'
import {ThemeModeProvider} from '../_metronic/partials'
import { ThemeProvider, createTheme } from '@mui/material/styles'

// 글로벌 폰트 크기 설정
const theme = createTheme({
  typography: {
    fontSize: 16, 
  },
})

const App: React.FC = () => {
  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      <I18nProvider>
        <LayoutProvider>
          <ThemeModeProvider>
            <ThemeProvider theme={theme}>
              <AuthInit>
                <Outlet />
                <MasterInit />
              </AuthInit>
            </ThemeProvider>
          </ThemeModeProvider>
        </LayoutProvider>
      </I18nProvider>
    </Suspense>
  )
}

export {App}