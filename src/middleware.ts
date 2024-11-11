import { NextRequest, NextResponse } from 'next/server'

import createMiddleware from 'next-intl/middleware'
import { locales } from './i18n/request'
import { Locale } from './types/global'
import { getSubdomain } from './utils'
import { notFound } from 'next/navigation'

export default async function middleware(request: NextRequest) {
  // Step 1: Use the incoming request (example)
  const defaultLocale = (request.headers.get('x-your-custom-locale') ||
    'en') as Locale

  const [, locale, ...segments] = request.nextUrl.pathname.split('/')

  const headerHost = request.headers.get('x-forwarded-host')
  const rootHost = request.nextUrl.host

  // Step 2: Create and call the next-intl middleware (example)
  const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale,
  })

  if (locale != null && !segments.length) {
    request.nextUrl.pathname = `/${locale}/onboarding`
  }

  // Handle the locale routing
  const response = handleI18nRouting(request)
  let env = 'production'
  const organization = getSubdomain(headerHost || '', rootHost || '')

  if (headerHost?.startsWith('dev')) {
    env = 'development'
  }

  response.cookies.set('organization', organization)
  response.cookies.set('env', env)

  return response
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', `/(vi|en)/:path*`, '/((?!api|_next|_vercel|.*\\..*).*)'],
}
