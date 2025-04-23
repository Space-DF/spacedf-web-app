export type TokenInviteMember = {
  email_receiver: string
  org_slug_name: string
  space_slug_name: string
  salt: string
  space_role_id: string
  exp: number
}
export type AccessTokenPayload = {
  space: string
  exp: string
  iat: string
  iss: string
  permissions: string[]
}
