import { Locale } from '@/types/global'
import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

/**
 * @see: importants!!
 * @tutorial: If adding a new language, please define the language in the array below and also add it to matcher in middleware.ts
 * @tutorial:  If you add a new language file, move to types/global.d.ts in the types folder to define its
 */

export const locales = ['en', 'vi'] as const

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locales.includes(locale as Locale)) notFound()

  // Combine all messages into a single object
  const messages = {
    // Add messages from other language files here

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
    addNewSpace: {
      ...(await import(`../../messages/${locale}/add-new-space.json`)).default,
    },
  }

  // Return merged messages
  return {
    locale,
    messages,
  }
})
