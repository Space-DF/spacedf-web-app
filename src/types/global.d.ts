// Importing other language files...

import React from 'react'
import { locales } from '@/i18n/request'
import addNewDevice from '../../messages/en/add-new-device.json'
import common from '../../messages/en/common.json'
import languageName from '../../messages/en/language-name.json'
import onboarding from '../../messages/en/onboarding.json'
import signUp from '../../messages/en/sign-up.json'

type Locale = (typeof locales)[number]

type Messages = {
  addNewDevice: typeof addNewDevice
  common: typeof common
  onboarding: typeof onboarding
  languageName: typeof languageName
  signUp: typeof signUp
  // Create a new type by combining all message types
}

export type SVGProps = React.SVGProps<SVGSVGElement>

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}

export type ApiResponse<T = any> = {
  data?: T
  error?: {
    detail: string
    code: string
  }
  message: string
  status: number
}
