// Importing other language files...

import global from "../../messages/en/global.json"

import { locales } from "@/i18n"

type Locale = (typeof locales)[number]

type Messages = {
  global: typeof global
  // Create a new type by combining all message types
}

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}
