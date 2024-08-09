// import {useIntl} from 'react-intl'
// import {KTIcon} from '../../../../helpers'
import {SidebarMenuItemWithSub} from './SidebarMenuItemWithSub'
import {SidebarMenuItem} from './SidebarMenuItem'

const SidebarMenuMain = () => {
  // const intl = useIntl()

  return (
    <>
      {/* <SidebarMenuItem
        to='/dashboard'
        icon='element-11'
        title={intl.formatMessage({id: 'MENU.DASHBOARD'})}
        fontIcon='bi-app-indicator'
      /> */}
      {/* <SidebarMenuItem to='/builder' icon='switch' title='Layout Builder' fontIcon='bi-layers' /> */}
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>회원사</span>
        </div>
      </div>
      <SidebarMenuItemWithSub
        to='/user-page/KeyIn'
        title='회원사 입력'
        fontIcon='bi-archive'
        icon='element-plus'
      >
        <SidebarMenuItem to='/Pro-Products' title='처리제품 정보' hasBullet={true} />
        <SidebarMenuItem to='/Input-Info' title='투입물 정보' hasBullet={true} />
        <SidebarMenuItem
          to='/Pro-Facility'
          title='설비별 처리제품 정보'
          hasBullet={true}
        />
        <SidebarMenuItem
          to='/Effluent'
          title='배출물 정보'
          hasBullet={true}
        />
      </SidebarMenuItemWithSub>
      <SidebarMenuItemWithSub
        to='/user-page/Inquiry'
        title='회원사 조회'
        icon='profile-circle'
        fontIcon='bi-person'
      >
        <SidebarMenuItem to='/MaterialPos' title='유가물 발생 정보' hasBullet={true} />
        <SidebarMenuItem to='/TradeMaterialPos' title='유가물 거래 정보' hasBullet={true} />
        <SidebarMenuItem to='/Waste' title='폐기물 발생 정보' hasBullet={true} />
        <SidebarMenuItem to='/TradeWaste' title='폐기물 처리 정보' hasBullet={true} />
      </SidebarMenuItemWithSub>
      <SidebarMenuItemWithSub to='/user-page/Management' title='회원사 관리' fontIcon='bi-sticky' icon='cross-circle'>
        <SidebarMenuItem to='/ManageClient' title='거래처 관리' hasBullet={true} />
        <SidebarMenuItem to='/ManageVehicle' title='차량 관리' hasBullet={true} />
        <SidebarMenuItem to='/ManageFacility' title='설비 관리' hasBullet={true} />
      </SidebarMenuItemWithSub>
      <div className='menu-item'>
        <div className='menu-content pt-8 pb-2'>
          <span className='menu-section text-muted text-uppercase fs-8 ls-1'>관리자</span>
        </div>
      </div>
      {/* <SidebarMenuItemWithSub
        to='/admin-page'
        title='관리자 조회'
        fontIcon='bi-chat-left'
        icon='message-text-2'
      >
        <SidebarMenuItem to='/Dashboard' title='요약정보' hasBullet={true} />
        <SidebarMenuItem to='/TotalInfo' title='종합정보' hasBullet={true} />
        <SidebarMenuItem to='/ComProducts' title='기업 및 제품정보' hasBullet={true} /> 
      </SidebarMenuItemWithSub> */}

      <SidebarMenuItemWithSub
        to='/admin-page/AuthManagement'
        title='관리기능'
        fontIcon='bi-chat-left'
        icon='message-text-2'
      >
        <SidebarMenuItem to='/MemberControl' title='사업회원관리' hasBullet={true} />
        <SidebarMenuItem to='/UserControl' title='계정 관리' hasBullet={true} />
        <SidebarMenuItem to='/AdminClient' title='거래처 관리' hasBullet={true} />
        <SidebarMenuItem to='/CarsControl' title='차량 관리' hasBullet={true} />
      </SidebarMenuItemWithSub>

      <SidebarMenuItemWithSub
        to='/admin-page/EcoASManagement'
        title='EcoAS 관리표'
        fontIcon='bi-chat-left'
        icon='message-text-2'
      >
        <SidebarMenuItem to='/CTMBasic' title='수집운반 관리표 원장' hasBullet={true} />
        <SidebarMenuItem to='/CTMDetail' title='수집운반 관리표 상세' hasBullet={true} />
        <SidebarMenuItem to='/CTMWeight' title='수집운반 관리표 실중량' hasBullet={true} />
        <SidebarMenuItem to='/SupplyTable' title='공급 관리표' hasBullet={true} />
        <SidebarMenuItem to='/DisposalTable' title='폐기 관리표' hasBullet={true} />
        <SidebarMenuItem to='/CTMScale' title='수집운반 보정중량' hasBullet={true} />
      </SidebarMenuItemWithSub>

      <SidebarMenuItemWithSub
        to='/admin-page/InputManagement'
        title='데이터 관리/조회'
        fontIcon='bi-chat-left'
        icon='message-text-2'
      >
        <SidebarMenuItem to='/Ad_Input' title='투입물 관리' hasBullet={true} />
        <SidebarMenuItem to='/Ad_Facility' title='설비 관리' hasBullet={true} />
        <SidebarMenuItem to='/Ad_UseFacility' title='설비 가동시간 관리' hasBullet={true} />
        <SidebarMenuItem to='/Ad_Waste' title='폐기물 관리' hasBullet={true} />
        <SidebarMenuItem to='/Ad_Effluent' title='배출물 관리' hasBullet={true} />
      </SidebarMenuItemWithSub>

      <SidebarMenuItemWithSub
        to='/admin-page/ProStatus'
        title='데이터 매핑/처리'
        fontIcon='bi-chat-left'
        icon='message-text-2'
      >
        <SidebarMenuItem to='/DataStatus' title='데이터 처리 현황' hasBullet={true} />
        <SidebarMenuItem to='/CTMapping' title='수집운반 매핑' hasBullet={true} />
        <SidebarMenuItem to='/SupMapping' title='공급 매핑' hasBullet={true} />
        <SidebarMenuItem to='/DisMapping' title='폐기 매핑' hasBullet={true} />
      </SidebarMenuItemWithSub>

      {/* <SidebarMenuItemWithSub
        to='/admin-page/Managament'
        title='관리기능'
        fontIcon='bi-chat-left'
        icon='message-text-2'
      >
        
        <SidebarMenuItem to='/Mapping' title='명칭 맵핑' hasBullet={true} /> 
        <SidebarMenuItem to='/apps/chat/private-chat' title='차량관리' hasBullet={true} />
        <SidebarMenuItem to='/apps/user-management/users' title='회원사관리' hasBullet={true} />
      </SidebarMenuItemWithSub> */}
      {/* <SidebarMenuItem
        to='/apps/user-management/users'
        icon='abstract-28'
        title='User management'
        fontIcon='bi-layers'
      /> */}
      {/* <div className='menu-item'>
        <a
          target='_blank'
          className='menu-link'
          href={import.meta.env.VITE_APP_PREVIEW_DOCS_URL + '/changelog'}
        >
          <span className='menu-icon'>
            <KTIcon iconName='code' className='fs-2' />
          </span>
          <span className='menu-title'>Changelog {import.meta.env.VITE_APP_VERSION}</span>
        </a>
      </div> */}
    </>
  )
}

export {SidebarMenuMain}
