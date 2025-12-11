import { NextRequest, NextResponse } from 'next/server'

import createMiddleware from 'next-intl/middleware'
import { cookies } from 'next/headers'
import { locales } from './i18n/request'
import { Locale } from './types/global'
import { getValidSubdomain } from './utils/subdomain'
import { readSession } from './utils/server-actions'

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

  if (!subdomain) {
    const demoUrl = `${request.nextUrl.protocol}//demo.${request.nextUrl.host}`

    return NextResponse.redirect(demoUrl, 308)
  }

  const userIsAuthenticated = await readSession()

  const publicRoutes = ['', 'invitation']

  const pathAfterSubdomain = segments.join('/')
  const isPublicRoute = publicRoutes.includes(pathAfterSubdomain)
  const isApiRoute = segments[0] === 'api'

  if (!userIsAuthenticated && !isPublicRoute && !isApiRoute) {
    const loginUrl = new URL(`/${locale}`, request.nextUrl.origin)
    return NextResponse.redirect(loginUrl)
  }

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
