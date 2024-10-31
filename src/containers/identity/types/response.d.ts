import { APIResponse, SpaceUser } from '@/types/common'

export type SignUpResponse = {
  message: string
  access: string
  refresh: string
  user: SpaceUser
}
