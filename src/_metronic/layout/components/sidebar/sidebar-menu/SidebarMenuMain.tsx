import React, { useState, useEffect } from 'react'
import { SidebarMenuItemWithSub } from './SidebarMenuItemWithSub'
import { SidebarMenuItem } from './SidebarMenuItem'

const SidebarMenuMain = () => {
  const [role, setRole] = useState('')

  useEffect(() => {
    const authString = localStorage.getItem('kt-auth-react-v')
    if (!authString) {
      console.error('No auth data found in local storage')
      return
    }

    const auth = JSON.parse(authString)
    const { role } = auth.userInfo

    if (role === 'Admin') {
      setRole('admin')
    } else if (role === 'User') {
      setRole('user')
    }
  }, [])

  return (
    <>
      {role === 'user' && (
        <>
          <div className='menu-item'>
            <div className='menu-content pt-8 pb-2'>
              <span className='menu-section text-muted text-uppercase fs-8 ls-1'>회원사</span>
            </div>
          </div>

          <SidebarMenuItemWithSub
            to='/admin-page/InputManagement'
            title='데이터 관리'
            fontIcon='bi-chat-left'
            icon='message-text-2'
          >
            <SidebarMenuItem to='/AdminClient' title='거래처 관리' hasBullet={true} />
            <SidebarMenuItem to='/CarsControl' title='차량 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_Facility' title='설비 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_UseFacility' title='설비 가동시간 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_Input' title='투입물 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_Effluent' title='수계배출물 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_Waste' title='폐기물 품목-매핑 관리' hasBullet={true} />
          </SidebarMenuItemWithSub>

          <SidebarMenuItemWithSub 
            to='/admin-page/EcoASManagement' 
            title='EcoAS 관리표' 
            fontIcon='bi-chat-left' 
            icon='message-text-2'
          >
          <SidebarMenuItemWithSub to='/admin-page/EcoASManagement' title='수집운반 관리표' fontIcon='bi-chat-left'>
            <SidebarMenuItem to='/CTMBasic' title='수집운반 관리표 원장' hasBullet={true} />
            <SidebarMenuItem to='/CTMDetail' title='수집운반 관리표 상세' hasBullet={true} />
            <SidebarMenuItem to='/CTMWeight' title='수집운반 관리표 실중량' hasBullet={true} />
          </SidebarMenuItemWithSub>
          <SidebarMenuItemWithSub to='/admin-page/EcoASManagement' title='보정 중량' fontIcon='bi-chat-left'>
            <SidebarMenuItem to='/CTMScale' title='관리표별 보정중량' hasBullet={true} />
            <SidebarMenuItem to='/ProductsScale' title='품목별 보정중량' hasBullet={true} />
          </SidebarMenuItemWithSub>
            <SidebarMenuItem to='/SupplyTable' title='공급(유가물) 관리표' hasBullet={true} />
            <SidebarMenuItem to='/DisposalTable' title='폐기 관리표' hasBullet={true} />
            <SidebarMenuItem to='/NonTargetWeights' title='비대상품목 입고량' hasBullet={true} />
            <SidebarMenuItem to='/SupplyScale' title='품목별 유가물 중량' hasBullet={true} />
            <SidebarMenuItem to='/DisposalScale' title='품목별 폐기물 중량' hasBullet={true} />
          </SidebarMenuItemWithSub>

          <SidebarMenuItemWithSub
            to='/admin-page/ProStatus'
            title='데이터 매핑'
            fontIcon='bi-chat-left'
            icon='message-text-2'
          >
            <SidebarMenuItem to='/DataStatus' title='데이터 매핑 현황' hasBullet={true} />
            <SidebarMenuItem to='/CTMapping' title='수집운반 매핑' hasBullet={true} />
            <SidebarMenuItem to='/SupMapping' title='공급(유가물) 매핑' hasBullet={true} />
            <SidebarMenuItem to='/DisMapping' title='폐기 매핑' hasBullet={true} />
          </SidebarMenuItemWithSub>

          <SidebarMenuItemWithSub
            to='/admin-page/AuthManagement'
            title='데이터 처리'
            fontIcon='bi-chat-left'
            icon='message-text-2'
          >
            <SidebarMenuItem to='/GTG_Data' title='GTG 결과' hasBullet={true} />
            <SidebarMenuItem to='/GTG_Data' title='온실효과 배출' hasBullet={true} />
          </SidebarMenuItemWithSub>
        </>
      )}

      {role === 'admin' && (
        <>
          <div className='menu-item'>
            <div className='menu-content pt-8 pb-2'>
              <span className='menu-section text-muted text-uppercase fs-8 ls-1'>관리자</span>
            </div>
          </div>
          <SidebarMenuItemWithSub
            to='/admin-page/InputManagement'
            title='데이터 관리'
            fontIcon='bi-chat-left'
            icon='message-text-2'
          >
            <SidebarMenuItem to='/AdminClient' title='거래처 관리' hasBullet={true} />
            <SidebarMenuItem to='/CarsControl' title='차량 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_Facility' title='설비 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_UseFacility' title='설비 가동시간 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_Input' title='투입물 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_Effluent' title='수계배출물 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_Waste' title='폐기물 품목-매핑 관리' hasBullet={true} />
            <SidebarMenuItem to='/ValuableMapping' title='유가물 품목-매핑 관리' hasBullet={true} />
          </SidebarMenuItemWithSub>

          <SidebarMenuItemWithSub 
            to='/admin-page/EcoASManagement' 
            title='EcoAS 관리표' 
            fontIcon='bi-chat-left' 
            icon='message-text-2'
          >
          <SidebarMenuItemWithSub to='/admin-page/EcoASManagement' title='수집운반 관리표' fontIcon='bi-chat-left'>
            <SidebarMenuItem to='/CTMBasic' title='수집운반 관리표 원장' hasBullet={true} />
            <SidebarMenuItem to='/CTMDetail' title='수집운반 관리표 상세' hasBullet={true} />
            <SidebarMenuItem to='/CTMWeight' title='수집운반 관리표 실중량' hasBullet={true} />
          </SidebarMenuItemWithSub>
          <SidebarMenuItemWithSub to='/admin-page/EcoASManagement' title='보정 중량' fontIcon='bi-chat-left'>
            <SidebarMenuItem to='/CTMScale' title='관리표별 보정중량' hasBullet={true} />
            <SidebarMenuItem to='/ProductsScale' title='품목별 보정중량' hasBullet={true} />
          </SidebarMenuItemWithSub>
            <SidebarMenuItem to='/SupplyTable' title='공급(유가물) 관리표' hasBullet={true} />
            <SidebarMenuItem to='/DisposalTable' title='폐기 관리표' hasBullet={true} />
            <SidebarMenuItem to='/NonTargetWeights' title='비대상품목 입고량' hasBullet={true} />
            <SidebarMenuItem to='/SupplyScale' title='품목별 유가물 중량' hasBullet={true} />
            <SidebarMenuItem to='/DisposalScale' title='품목별 폐기물 중량' hasBullet={true} />
          </SidebarMenuItemWithSub>

          <SidebarMenuItemWithSub
            to='/admin-page/ProStatus'
            title='데이터 매핑'
            fontIcon='bi-chat-left'
            icon='message-text-2'
          >
            <SidebarMenuItem to='/DataStatus' title='데이터 매핑 현황' hasBullet={true} />
            <SidebarMenuItem to='/CTMapping' title='수집운반 매핑' hasBullet={true} />
            <SidebarMenuItem to='/SupMapping' title='공급(유가물) 매핑' hasBullet={true} />
            <SidebarMenuItem to='/DisMapping' title='폐기 매핑' hasBullet={true} />
          </SidebarMenuItemWithSub>

          <SidebarMenuItemWithSub
            to='/admin-page/AuthManagement'
            title='데이터 처리'
            fontIcon='bi-chat-left'
            icon='message-text-2'
          >
            <SidebarMenuItem to='/GTG_Data' title='GTG 결과' hasBullet={true} />
            <SidebarMenuItem to='/GTG_Data' title='온실효과 배출' hasBullet={true} />
          </SidebarMenuItemWithSub>

          <SidebarMenuItemWithSub
            to='/admin-page/AuthManagement'
            title='관리기능'
            fontIcon='bi-chat-left'
            icon='message-text-2'
          >
            <SidebarMenuItem to='/MemberControl' title='사업회원관리' hasBullet={true} />
            <SidebarMenuItem to='/UserControl' title='계정 관리' hasBullet={true} />
            <SidebarMenuItem to='/NoticeControl' title='공지사항 관리' hasBullet={true} />
            <SidebarMenuItem to='/CompositionSet' title='유가물 구성비율 관리' hasBullet={true} />
            <SidebarMenuItem to='/LCI_Item' title='LCI 항목 및 GWP 관리' hasBullet={true} />
          </SidebarMenuItemWithSub>
        </>
      )}
    </>
  )
}

export { SidebarMenuMain }