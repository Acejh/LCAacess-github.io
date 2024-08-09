import {ProfileDetails} from './cards/ProfileDetails'
import {SignInMethod} from './cards/SignInMethod'
import {DeactivateAccount} from './cards/DeactivateAccount'
import { Content } from '../../../../../_metronic/layout/components/content'

export function Settings() {
  return (
    <Content>
      <ProfileDetails />
      <SignInMethod />
      <DeactivateAccount />
    </Content>
  )
}
