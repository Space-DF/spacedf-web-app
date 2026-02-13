import { IdentityStepEnum } from '@/constants'

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

export type MakeRequired<T> = {
  [K in keyof T]-?: T[K]
}

export type TransFunction = (
  key: string,
  params?: Record<string, any>
) => string
