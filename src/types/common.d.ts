import { IdentityStepEnum } from "@/constants"
import { FullResponse } from "@/lib/fecth"

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
  id: number
  email: string
  first_name?: string
  last_name?: string
}

// export interface APIResponse<TResponse = any> extends FullResponse<T> {
//   response: {
//     Message: string
//   } & T
// }

export type APIResponse<TResponse = any> = FullResponse<TResponse>
