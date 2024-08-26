import { lazy, FC, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { MasterLayout } from '../../_metronic/layout/MasterLayout'
import TopBarProgress from 'react-topbar-progress-indicator'
import { getCSSVariableValue } from '../../_metronic/assets/ts/_utils'
import { WithChildren } from '../../_metronic/helpers'
import { useAuth } from '../modules/auth' // useAuth 추가

// 기존 페이지 import들
import { InputInfo } from '../pages/user-page/KeyIn/Input'
import { Effluent } from '../pages/user-page/KeyIn/Effluent'
import { ProFacility } from '../pages/user-page/KeyIn/ProFacility'
import { ProProducts } from '../pages/user-page/KeyIn/ProProducts'
import { MaterialPos } from '../pages/user-page/Inquiry/MaterialPos'
import { MaterialPosTrade } from '../pages/user-page/Inquiry/MaterialPosTrade'
import { Waste } from '../pages/user-page/Inquiry/Waste'
import { WasteTrade } from '../pages/user-page/Inquiry/WasteTrade'
import { ManageClient } from '../pages/user-page/Management/ManageClient'
import { ManageFacility } from '../pages/user-page/Management/ManageFacility'
import { ManageVehicle } from '../pages/user-page/Management/ManageVehicle'
import { ComProducts } from '../pages/admin-page/Management/ComProducts'
import { Dashboard } from '../pages/admin-page/Management/Dashboard'
import { Mapping } from '../pages/admin-page/Management/Mapping'
import { TotalInfo } from '../pages/admin-page/Management/TotalInfo'
import { UserControl } from '../pages/admin-page/AuthManagement/AccountControl'
import { MemberControl } from '../pages/admin-page/AuthManagement/MemberControl'
import { DisposalTable } from '../pages/admin-page/EcoASManagement/DisposalTable'
import { SupplyTable } from '../pages/admin-page/EcoASManagement/SupplyTable'
import { CTMDetail } from '../pages/admin-page/EcoASManagement/CTMDetail'
import { CTMWeight } from '../pages/admin-page/EcoASManagement/CTMWeight'
import { CTMBasic } from '../pages/admin-page/EcoASManagement/CTMBasic'
import { AdminClient } from '../pages/admin-page/AuthManagement/AdminClient'
import { CarsControl } from '../pages/admin-page/AuthManagement/CarsControl'
import { CTMScale } from '../pages/admin-page/EcoASManagement/CTMScale'
import { Ad_Effluent } from '../pages/admin-page/InputManagement/KeyIn/Ad_Effluent'
import { Ad_Facility } from '../pages/admin-page/InputManagement/KeyIn/Ad_Facility'
import { Ad_Input } from '../pages/admin-page/InputManagement/KeyIn/Ad_Input'
import { Ad_UseFacility } from '../pages/admin-page/InputManagement/KeyIn/Ad_UseFacility'
import { Ad_Waste } from '../pages/admin-page/InputManagement/KeyIn/Ad_Waste'
import { CTMapping } from '../pages/admin-page/ProStatus/CTMapping'
import { DataStatus } from '../pages/admin-page/ProStatus/DataStatus'
import { SupMapping } from '../pages/admin-page/ProStatus/SupMapping'
import { DisMapping } from '../pages/admin-page/ProStatus/DisMapping'
import { NonTargetWeights } from '../pages/admin-page/EcoASManagement/NonTargetWeights'
import { ProductsScale } from '../pages/admin-page/EcoASManagement/ProductsScale'
import { SupplyScale } from '../pages/admin-page/EcoASManagement/SupplyScale'
import { DisposalScale } from '../pages/admin-page/EcoASManagement/DisposalScale'
import { CompositionSet } from '../pages/admin-page/EcoASManagement/CompositionSet'
import { Ad_Dashboard } from '../pages/admin-page/Management/Ad_Dashboard'
import { Login } from '../modules/auth/components/Login'
import { ForgotPassword } from '../modules/auth/components/ForgotPassword'
import { Registration } from '../modules/auth/components/Registration'
import { NoticeControl } from '../pages/admin-page/AuthManagement/NoticeControl'

const PrivateRoutes = () => {
    const ProfilePage = lazy(() => import('../modules/profile/ProfilePage'))
    const AccountPage = lazy(() => import('../modules/accounts/AccountPage'))
    const WidgetsPage = lazy(() => import('../modules/widgets/WidgetsPage'))
    const UsersPage = lazy(() => import('../modules/apps/user-management/UsersPage'))
  const { currentUser } = useAuth();
  console.log("Current User:", currentUser);

  return (
    <Routes>
      <Route element={<MasterLayout />}>
        {/* 로그인, 회원가입 경로 */}
        <Route path="/Login" element={<Login />} />
        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/Registration" element={<Registration />} />

        {/* 권한 기반 대시보드 라우팅 */}
        {currentUser?.role === 'Admin' ? (
          <Route path="/Dashboard" element={<Ad_Dashboard />} />
        ) : (
          <Route path="/Dashboard" element={<Dashboard />} />
        )}

        {/* 유저 기능 */}
        <Route path="/Input-Info" element={<InputInfo />} />
        <Route path="/Effluent" element={<Effluent />} />
        <Route path="/Pro-Facility" element={<ProFacility />} />
        <Route path="/Pro-Products" element={<ProProducts />} />

        {/* 유저 조회 */}
        <Route path="/MaterialPos" element={<MaterialPos />} />
        <Route path="/TradeMaterialPos" element={<MaterialPosTrade />} />
        <Route path="/Waste" element={<Waste />} />
        <Route path="/TradeWaste" element={<WasteTrade />} />

        {/* 유저 관리 */}
        <Route path="/ManageClient" element={<ManageClient />} />
        <Route path="/ManageFacility" element={<ManageFacility />} />
        <Route path="/ManageVehicle" element={<ManageVehicle />} />

        {/* 관리자 관리 기능 */}
        <Route path='/ComProducts' element={<ComProducts />} />
        <Route path='/Mapping' element={<Mapping />} />
        <Route path='/TotalInfo' element={<TotalInfo />} />
        <Route path='/UserControl' element={<UserControl />} />
        <Route path='/MemberControl' element={<MemberControl />} />
        <Route path='/AdminClient' element={<AdminClient />} />
        <Route path='/CarsControl' element={<CarsControl />} />
        <Route path='/NoticeControl' element={<NoticeControl />} />

        {/* 관리자 관리표 */}
        <Route path='/DisposalTable' element={<DisposalTable />} />
        <Route path='/SupplyTable' element={<SupplyTable />} />
        <Route path='/CTMBasic' element={<CTMBasic />} />
        <Route path='/CTMDetail' element={<CTMDetail />} />
        <Route path='/CTMWeight' element={<CTMWeight />} />
        <Route path='/CTMScale' element={<CTMScale />} />
        <Route path='/NonTargetWeights' element={<NonTargetWeights />} />
        <Route path='/ProductsScale' element={<ProductsScale />} />
        <Route path='/SupplyScale' element={<SupplyScale />} />
        <Route path='/DisposalScale' element={<DisposalScale />} />
        <Route path='/CompositionSet' element={<CompositionSet />} />

        {/* 관리자 사업회원 데이터 관리 */}
        <Route path='/Ad_Effluent' element={<Ad_Effluent />} />
        <Route path='/Ad_Facility' element={<Ad_Facility />} />
        <Route path='/Ad_UseFacility' element={<Ad_UseFacility />} />
        <Route path='/Ad_Input' element={<Ad_Input />} />
        <Route path='/Ad_Waste' element={<Ad_Waste />} />

        {/* 데이터 처리 */}
        <Route path='/DataStatus' element={<DataStatus />} />
        <Route path='/CTMapping' element={<CTMapping />} />
        <Route path='/SupMapping' element={<SupMapping />} />
        <Route path='/DisMapping' element={<DisMapping />} />

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

const SuspensedView: FC<WithChildren> = ({ children }) => {
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

export { PrivateRoutes }