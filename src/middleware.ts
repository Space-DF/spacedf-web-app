import { locales } from './i18n/request'
import { getToken } from 'next-auth/jwt'
import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { Locale } from './types/global'
import { getSubdomain } from './utils'

export default async function middleware(
  request: NextRequest,
  nextResponse: NextResponse,
) {
  const session = await getToken({
    req: request,
  })

  // Step 1: Use the incoming request (example)
  const defaultLocale = (request.headers.get('x-your-custom-locale') ||
    'en') as Locale

  const { pathname } = request.nextUrl
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
  let response = handleI18nRouting(request)
  let env = 'production'
  const organization = getSubdomain(headerHost || '', rootHost || '')

  if (headerHost?.startsWith('dev')) {
    env = 'development'
    // organization = (hostname !== "localhost" && headerHostSegments?.[1]) || ""
  }

  response.cookies.set('organization', organization)
  response.cookies.set('env', env)

  return response
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', `/(vi|en)/:path*`, '/((?!api|_next|_vercel|.*\\..*).*)'],
}
