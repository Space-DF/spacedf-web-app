import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'
import type { Locale } from '@/types/global'

/**
 * @see: important!!
 * @tutorial: If adding a new language, please define the language in the array below and also add it to matcher in middleware.ts
 * @tutorial:  If you add a new language file, move to types/global.d.ts in the types folder to define its
 */

export const locales = ['en', 'vi'] as const

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale
  if (!locales.includes(locale as Locale)) notFound()

  // Combine all messages into a single object
  const messages = {
    // Add messages from other language files here

    addNewDevice: {
      ...(await import(`../../messages/${locale}/add-new-device.json`)).default,
    },
    common: {
      ...(await import(`../../messages/${locale}/common.json`)).default,
    },
    onboarding: {
      ...(await import(`../../messages/${locale}/onboarding.json`)).default,
    },
    languageName: {
      ...(await import(`../../messages/${locale}/language-name.json`)).default,
    },
    signUp: {
      ...(await import(`../../messages/${locale}/sign-up.json`)).default,
    },
    generalSettings: {
      ...(await import(`../../messages/${locale}/general-settings.json`))
        .default,
    },
    space: {
      ...(await import(`../../messages/${locale}/space.json`)).default,
    },
    dashboard: {
      ...(await import(`../../messages/${locale}/dashboard.json`)).default,
    },
    geofence: {
      ...(await import(`../../messages/${locale}/geofence.json`)).default,
    },
  }

  // Return merged messages
  return {
    locale,
    messages,
  }
})
