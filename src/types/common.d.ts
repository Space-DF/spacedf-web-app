import { IdentityStepEnum } from '@/constants'
import { FullResponse } from '@/lib/fecth'

export type CommonModalProps = {
  open: boolean
  setOpen?: (open: boolean) => void
}

export type TSpace = {
  id: string
  title: string
  count_device?: number
  thumbnail?: string
}

export type IdentityStep = `${IdentityStepEnum}`

export type SpaceUser = {
  id: string
  email: string
  first_name?: string
  last_name?: string
  company_name?: string
  avatar?: string
}

// export interface APIResponse<TResponse = any> extends FullResponse<T> {
//   response: {
//     Message: string
//   } & T
// }

export type APIResponse<TResponse = any> = FullResponse<TResponse>

export type TransFunction = (
  key: string,
  params?: Record<string, any>
) => string
