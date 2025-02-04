// Importing other language files...

import React from 'react'
import { locales } from '@/i18n/request'
import addNewDevice from '../../messages/en/add-new-device.json'
import common from '../../messages/en/common.json'
import dashboard from '../../messages/en/dashboard.json'
import generalSettings from '../../messages/en/general-settings.json'
import languageName from '../../messages/en/language-name.json'
import onboarding from '../../messages/en/onboarding.json'
import signUp from '../../messages/en/sign-up.json'
import space from '../../messages/en/space.json'
import organization from '../../messages/en/organization.json'
import landingPage from '../../messages/en/landing-page.json'
import MapInstance from '@/utils/map-instance'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { LayersList } from 'deck.gl'

type Locale = (typeof locales)[number]

type Messages = {
  addNewDevice: typeof addNewDevice
  common: typeof common
  onboarding: typeof onboarding
  languageName: typeof languageName
  signUp: typeof signUp
  generalSettings: typeof generalSettings
  dashboard: typeof dashboard
  space: typeof space
  organization: typeof organization
  landingPage: typeof landingPage
  // Create a new type by combining all message types
}

export type SVGProps = React.SVGProps<SVGSVGElement>

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}

export type ApiResponse<T = any> = {
  data?: T
  message?: string
  status?: number
  error?: ApiErrorResponse
}

export type DataResponse<T = unknown> = {
  data?: {
    count?: number
    next?: any
    previous?: any
    results?: T[]
  }
  status: number
}

export type ApiErrorResponse = {
  detail: string
  code?: number
} & Record<string, any>

declare global {
  interface Window {
    mapInstance: MapInstance
    cluster: Supercluster<Supercluster.AnyProps, Supercluster.AnyProps>
    devicesMapOverlay: MapboxOverlay
    devicesHistoryOverlay: MapboxOverlay
    mapLayer: LayersList[]
  }
}
