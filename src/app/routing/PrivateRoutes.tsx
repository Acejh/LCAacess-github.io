import {lazy, FC, Suspense} from 'react'
import {Route, Routes, Navigate} from 'react-router-dom'
import {MasterLayout} from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import {DashboardWrapper} from '../pages/dashboard/DashboardWrapper'
import {MenuTestPage} from '../pages/MenuTestPage'
import {getCSSVariableValue} from '../../_metronic/assets/ts/_utils'
import {WithChildren} from '../../_metronic/helpers'
import {InputInfo} from '../pages/user-page/KeyIn/Input'
import { Effluent } from '../pages/user-page/KeyIn/Effluent'
import { ProFacility } from '../pages/user-page/KeyIn/ProFacility'
import { ProProducts } from '../pages/user-page/KeyIn/ProProducts'  
import { MaterialPos } from '../pages/user-page/Inquiry/MaterialPos'
import { MaterialPosTrade } from '../pages/user-page/Inquiry/MaterialPosTrade'
import { Waste } from '../pages/user-page/Inquiry/Waste'
import { WasteTrade } from '../pages/user-page/Inquiry/WasteTrade'
import { ManageCustomer } from '../pages/user-page/Management/ManageCustomer'
import { ManageFacility } from '../pages/user-page/Management/ManageFacility'
import { ManageVehicle } from '../pages/user-page/Management/ManageVehicle'
import { ComProducts } from '../pages/admin-page/Management/ComProducts'
import { Dashboard } from '../pages/admin-page/Management/Dashboard'
import { Mapping } from '../pages/admin-page/Management/Mapping'
import { TotalInfo } from '../pages/admin-page/Management/TotalInfo'
import { UserControl } from '../pages/admin-page/AuthManagement/AccountControl'
import { MemberControl } from '../pages/admin-page/AuthManagement/MemberControl'
import { ScrapTable } from '../pages/admin-page/EcoASManagement/ScrapTable'
import { SupplyTable } from '../pages/admin-page/EcoASManagement/SupplyTable'
import { CTMDetail } from '../pages/admin-page/EcoASManagement/CTMDetail'
import { CTMWeight } from '../pages/admin-page/EcoASManagement/CTMWeight'
import { Registration } from '../modules/auth/components/Registration'
import { Login } from '../modules/auth/components/Login'
import { ForgotPassword } from '../modules/auth/components/ForgotPassword'

const PrivateRoutes = () => {
  const ProfilePage = lazy(() => import('../modules/profile/ProfilePage'))
  const AccountPage = lazy(() => import('../modules/accounts/AccountPage'))
  const WidgetsPage = lazy(() => import('../modules/widgets/WidgetsPage'))
  const UsersPage = lazy(() => import('../modules/apps/user-management/UsersPage'))

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* 로그인,회원가입 성공후 대쉬보드로 이동 */}
        <Route path='auth/*' element={<Navigate to='/dashboard' />} />
        {/* 기본 */}
        <Route path="/Login" element={<Login />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/Registration" element={<Registration />} />
        {/* 유저 */} 
        <Route path="/Input-Info" element={<InputInfo />} />
        <Route path="/Effluent" element={<Effluent />} />
        <Route path="/Pro-Facility" element={<ProFacility />} />
        <Route path="/Pro-Products" element={<ProProducts />} />
        {/* 유저 조회 */}
        <Route path="/MaterialPos" element={<MaterialPos />} />
        <Route path="/TradeMaterialPos" element={<MaterialPosTrade/>} />
        <Route path="/Waste" element={<Waste />} />
        <Route path="/TradeWaste" element={<WasteTrade />} />
        {/* 유저 관리 */}
        <Route path="/ManageCustomer" element={<ManageCustomer />} />
        <Route path="/ManageFacility" element={<ManageFacility/>} />
        <Route path="/ManageVehicle" element={<ManageVehicle />} />
        {/* 관리자 관리기능 */}
        <Route path='/ComProducts' element={<ComProducts />} />
        <Route path='/Dashboard' element={<Dashboard />} />
        <Route path='/Mapping' element={<Mapping />} />
        <Route path='/TotalInfo' element={<TotalInfo />} />
        <Route path='/UserControl' element={<UserControl/>} />
        <Route path='/MemberControl' element={<MemberControl/>} />
        {/* 관리자 관리표*/}
        <Route path='/ScrapTable' element={<ScrapTable/>} />
        <Route path='/SupplyTable' element={<SupplyTable/>} />
        <Route path='/CTMDetail' element={<CTMDetail/>} />
        <Route path='/CTMWeight' element={<CTMWeight/>} />
        
        <Route path='dashboard' element={<DashboardWrapper />} />
        <Route path='menu-test' element={<MenuTestPage />} />
        {/* Lazy Modules */}
        <Route
          path='crafted/pages/profile/*'
          element={
            <SuspensedView>
              <ProfilePage />
            </SuspensedView>
          }
        />
        <Route
          path='crafted/widgets/*'
          element={
            <SuspensedView>
              <WidgetsPage />
            </SuspensedView>
          }
        />
        <Route
          path='crafted/account/*'
          element={
            <SuspensedView>
              <AccountPage />
            </SuspensedView>
          }
        />
        <Route
          path='apps/user-management/*'
          element={
            <SuspensedView>
              <UsersPage />
            </SuspensedView>
          }
        />
        {/* Page Not Found */}
        <Route path='*' element={<Navigate to='/error/404' />} />
      </Route>
    </Routes>
  )
}

const SuspensedView: FC<WithChildren> = ({children}) => {
  const baseColor = getCSSVariableValue('--bs-primary')
  TopBarProgress.config({
    barColors: {
      '0': baseColor,
    },
    barThickness: 1,
    shadowBlur: 5,
  })
  return <Suspense fallback={<TopBarProgress />}>{children}</Suspense>
}

export {PrivateRoutes}
