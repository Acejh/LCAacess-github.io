export interface UserInfo {
  userName: string
  name: string
  companyCode: string
  companyName: string
  role: string
}

export interface AuthModel {
  userInfo: UserInfo
  accessToken: string
  refreshToken: string
  refreshTokenExpiryTime: string
}

export interface UserModel {
  userName: string
  name: string
  email?: string
  role: string
  companyName: string
}