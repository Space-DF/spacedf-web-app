import { getRequestConfig } from "next-intl/server"
import { notFound } from "next/navigation"
import { Locale } from "./types/global"

/**
 * @see: importants!!
 * @tutorial: If adding a new language, please define the language in the array below and also add it to matcher in middleware.ts
 * @tutorial:  If you add a new language file, move to types/global.d.ts in the types folder to define its
 */

export const locales = ["en", "vi"] as const

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound()

  // Combine all messages into a single object
  const messages = {
    // Add messages from other language files here

    common: {
      ...(await import(`../messages/${locale}/common.json`)).default,
    },
  }

  // Return merged messages
  return {
    messages,
  }
})
