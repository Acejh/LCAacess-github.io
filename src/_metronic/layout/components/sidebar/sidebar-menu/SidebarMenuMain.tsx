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
            icon='plus-circle'
          >
            <SidebarMenuItem to='/AdminClient' title='거래처 관리' hasBullet={true} />
            <SidebarMenuItem to='/CarsControl' title='차량 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_Facility' title='설비 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_UseFacility' title='설비 가동시간 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_Input' title='투입물 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_Effluent' title='수계배출물 관리' hasBullet={true} />
            <SidebarMenuItem to='/WasteMapping' title='폐기물 처리품목&middot;방법 관리' hasBullet={true} />
          </SidebarMenuItemWithSub>

          <SidebarMenuItemWithSub 
            to='/admin-page/EcoASManagement' 
            title='EcoAS 관리표' 
            fontIcon='bi-chat-left' 
            icon='note-2'
          >
            <SidebarMenuItemWithSub to='/admin-page/EcoASManagement' title='입고 관리표' fontIcon='bi-chat-left'>
              <SidebarMenuItem to='/CTMBasic' title='수집운반 관리표 원장' hasBullet={true} />
              <SidebarMenuItem to='/CTMScale' title='관리표별 중량' hasBullet={true} />
              <SidebarMenuItem to='/ProductsScale' title='세부제품 월별 중량' hasBullet={true} />
              <SidebarMenuItem to='/NonTargetWeights' title='비대상품목 입고량' hasBullet={true} />
              {/* <SidebarMenuItem to='/CTMDetail' title='수집운반 관리표 상세' hasBullet={true} />
              <SidebarMenuItem to='/CTMWeight' title='수집운반 관리표 실중량' hasBullet={true} /> */}
            </SidebarMenuItemWithSub>
            <SidebarMenuItemWithSub to='/admin-page/EcoASManagement' title='출고 관리표' fontIcon='bi-chat-left'>
              <SidebarMenuItem to='/SupplyTable' title='유가물 관리표' hasBullet={true} />
              <SidebarMenuItem to='/DisposalTable' title='폐기물 관리표' hasBullet={true} />
              <SidebarMenuItem to='/SupplyScale' title='품목별 유가물 중량' hasBullet={true} />
              <SidebarMenuItem to='/DisposalScale' title='품목별 폐기물 중량' hasBullet={true} />
            </SidebarMenuItemWithSub>
          </SidebarMenuItemWithSub>

          <SidebarMenuItemWithSub
            to='/admin-page/ProStatus'
            title='데이터 입력 현황'
            fontIcon='bi-chat-left'
            icon='technology-4'
          >
            <SidebarMenuItem to='/DataStatus' title='데이터 입력 현황' hasBullet={true} />
            {/* <SidebarMenuItem to='/CTMapping' title='수집운반 매핑' hasBullet={true} /> */}
            {/* <SidebarMenuItem to='/SupMapping' title='공급(유가물) 매핑' hasBullet={true} />
            <SidebarMenuItem to='/DisMapping' title='폐기 매핑' hasBullet={true} /> */}
          </SidebarMenuItemWithSub>

          <SidebarMenuItemWithSub
            to='/admin-page/AuthManagement'
            title='데이터 처리'
            fontIcon='bi-chat-left'
            icon='verify'
          >
            <SidebarMenuItem to='/GTG_Data' title='GTG 결과' hasBullet={true} />
            {/* <SidebarMenuItem to='/LCI_Data' title='LCA 결과' hasBullet={true} /> */}
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
            icon='plus-circle'
          >
            <SidebarMenuItem to='/AdminClient' title='거래처 관리' hasBullet={true} />
            <SidebarMenuItem to='/CarsControl' title='차량 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_Facility' title='설비 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_UseFacility' title='설비 가동시간 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_Input' title='투입물 관리' hasBullet={true} />
            <SidebarMenuItem to='/Ad_Effluent' title='수계배출물 관리' hasBullet={true} />
            <SidebarMenuItem to='/WasteMapping' title='폐기물 처리품목&middot;방법 관리' hasBullet={true} />
            <SidebarMenuItem to='/ValuableMapping' title='유가물 품목&middot;매핑 관리' hasBullet={true} />
            <SidebarMenuItem to='/ClientMap' title='유가물 2차 거래처 매핑 관리' hasBullet={true} />
            <SidebarMenuItem to='/ValuableDeduction' title='유가물 차감량 관리' hasBullet={true} />
          </SidebarMenuItemWithSub>

          <SidebarMenuItemWithSub 
            to='/admin-page/EcoASManagement' 
            title='EcoAS 관리표' 
            fontIcon='bi-chat-left' 
            icon='note-2'
          >
            <SidebarMenuItemWithSub to='/admin-page/EcoASManagement' title='입고 관리표' fontIcon='bi-chat-left'>
              <SidebarMenuItem to='/CTMBasic' title='수집운반 관리표 원장' hasBullet={true} />
              <SidebarMenuItem to='/CTMDetail' title='수집운반 관리표 상세' hasBullet={true} />
              <SidebarMenuItem to='/CTMWeight' title='수집운반 관리표 실중량' hasBullet={true} />
              <SidebarMenuItem to='/CTMScale' title='관리표별 중량' hasBullet={true} />
              <SidebarMenuItem to='/ProductsScale' title='세부제품 월별 중량' hasBullet={true} />
              <SidebarMenuItem to='/NonTargetWeights' title='비대상품목 입고량' hasBullet={true} />
            </SidebarMenuItemWithSub>
            <SidebarMenuItemWithSub to='/admin-page/EcoASManagement' title='출고 관리표' fontIcon='bi-chat-left'>
              <SidebarMenuItem to='/SupplyTable' title='유가물 관리표' hasBullet={true} />
              <SidebarMenuItem to='/DisposalTable' title='폐기물 관리표' hasBullet={true} />
              <SidebarMenuItem to='/SupplyScale' title='품목별 유가물 중량' hasBullet={true} />
              <SidebarMenuItem to='/DisposalScale' title='품목별 폐기물 중량' hasBullet={true} />
            </SidebarMenuItemWithSub>
          </SidebarMenuItemWithSub>

          <SidebarMenuItemWithSub
            to='/admin-page/ProStatus'
            title='데이터 매핑'
            fontIcon='bi-chat-left'
            icon='technology-4'
          >
            <SidebarMenuItem to='/DataStatus' title='데이터 매핑 현황' hasBullet={true} />
            <SidebarMenuItem to='/CTMapping' title='수집운반 매핑' hasBullet={true} />
            <SidebarMenuItem to='/SupMapping' title='유가물 매핑' hasBullet={true} />
            <SidebarMenuItem to='/DisMapping' title='폐기물 매핑' hasBullet={true} />
          </SidebarMenuItemWithSub>

          <SidebarMenuItemWithSub
            to='/admin-page/AuthManagement'
            title='데이터 처리'
            fontIcon='bi-chat-left'
            icon='verify'
          >
            <SidebarMenuItem to='/GTG_Data' title='GTG 결과' hasBullet={true} />
            <SidebarMenuItem to='/LCI_Data' title='LCA 결과(종합,사업회원)' hasBullet={true} />
            <SidebarMenuItem to='/LCI_Com_Data' title='LCA 결과(품목)' hasBullet={true} />
          </SidebarMenuItemWithSub>

          <SidebarMenuItemWithSub
            to='/admin-page/AuthManagement'
            title='관리자 관리'
            fontIcon='bi-chat-left'
            icon='setting-2'
          >
            <SidebarMenuItemWithSub to='/admin-page/Management' title='기준정보 관리' fontIcon='bi-chat-left'>
              <SidebarMenuItem to='/CompositionSet' title='출고 구성비율 관리' hasBullet={true} />
              <SidebarMenuItem to='/LCI_Item' title='LCI 항목 및 GWP 관리' hasBullet={true} />
            </SidebarMenuItemWithSub>
            <SidebarMenuItemWithSub to='/admin-page/Management' title='기타 관리' fontIcon='bi-chat-left'>
              <SidebarMenuItem to='/MemberControl' title='사업회원 기본 정보' hasBullet={true} />
              <SidebarMenuItem to='/UserControl' title='계정 관리' hasBullet={true} />
              <SidebarMenuItem to='/NoticeControl' title='공지사항 관리' hasBullet={true} />
            </SidebarMenuItemWithSub>
          </SidebarMenuItemWithSub>
        </>
      )}
    </>
  )
}

export { SidebarMenuMain }