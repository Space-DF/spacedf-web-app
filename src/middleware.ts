import { NextRequest, NextResponse } from 'next/server'

import createMiddleware from 'next-intl/middleware'
import { cookies } from 'next/headers'
import { locales } from './i18n/request'
import { Locale } from './types/global'
import { getSubdomain } from './utils'
import { getValidSubdomain } from './utils/subdomain'

// RegExp for public files
const PUBLIC_FILE = /\.(.*)$/ // Files

export default async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()

  if (PUBLIC_FILE.test(url.pathname) || url.pathname.includes('_next')) return

  // Step 1: Use the incoming request (example)
  const defaultLocale = (cookies().get('NEXT_LOCALE')?.value || 'en') as Locale

  let [, locale, ...segments] = request.nextUrl.pathname.split('/')

  const host = request.headers.get('host')

  const isLocaleValid = locales.includes(locale as Locale)

  // If the first segment isn't a valid locale, default to the defaultLocale
  if (!isLocaleValid) {
    locale = defaultLocale
    segments = url.pathname.split('/').filter(Boolean) // Reset segments without locale
  }

  // Step 2: Create and call the next-intl middleware (example)
  const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale,
    // localePrefix: 'as-needed',
  })

  const subdomain = await getValidSubdomain(host)

  // segments = segments.filter((seg) => seg !== subdomain)

  if (subdomain) {
    url.pathname = `/${locale}/${subdomain}/${segments.join('/') || ''}` // Rewrite path for dynamic subdomain
    // let pathWithoutLocale = url.pathname.replace(`/${locale}`, '')

    if (
      locale != null &&
      !segments.length && // No additional path segments
      locales.includes(locale as Locale)
    ) {
      url.pathname = `/${locale}/${subdomain}/digital-twins`
    }
  } else {
    url.pathname = `/${locale}/${segments.join('/') || ''}`
  }

  request.nextUrl.pathname = url.pathname

  // Handle the locale routing
  const response = handleI18nRouting(request)

  response.cookies.set('organization', subdomain || '')

  return response
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', `/(vi|en)/:path*`, '/((?!api|_next|_vercel|.*\\..*).*)'],
}
