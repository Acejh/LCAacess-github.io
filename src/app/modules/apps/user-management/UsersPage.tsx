import {Route, Routes, Outlet, Navigate} from 'react-router-dom'
import {PageLink, PageTitle} from '../../../../_metronic/layout/core'
import {UsersListWrapper} from './users-list/UsersList'

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: '회원사 관리',
    path: '/apps/user-management/users',
    isSeparator: false,
    isActive: false,
  },
  {
    title: '',
    path: '',
    isSeparator: true,
    isActive: false,
  },
]

const UsersPage = () => {
  return (
    <Routes>
      <Route element={<Outlet />}>
        <Route
          path='users'
          element={
            <>
              <PageTitle breadcrumbs={usersBreadcrumbs}>회원사 리스트</PageTitle>
              <UsersListWrapper />
            </>
          }
        />
      </Route>
      <Route index element={<Navigate to='/apps/user-management/users' />} />
    </Routes>
  )
}

export default UsersPage
