import { IdentityStepEnum } from "@/constants"

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
