export enum AuthTypeEnum {
  FORGET_PASSWORD = 'forget-password',
}

export type RefreshTokenResponse = {
  access: string
  refresh: string
}
