// Importing other language files...

import common from '../../messages/en/common.json'
import onboarding from '../../messages/en/onboarding.json'
import languageName from '../../messages/en/language-name.json'

import { locales } from '@/i18n'

type Locale = (typeof locales)[number]

type Messages = {
  common: typeof common
  onboarding: typeof onboarding
  languageName: typeof languageName
  // Create a new type by combining all message types
}

export type SVGProps = React.SVGProps<SVGSVGElement>

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
