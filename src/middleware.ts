import { NextRequest, NextResponse } from 'next/server'

import createMiddleware from 'next-intl/middleware'
import { defaultLocale, locales } from './i18n/request'
import { Locale } from './types/global'
import { getValidSubdomain } from './utils/subdomain'
import { readSession } from './utils/server-actions'
import { jwtDecrypt } from 'jose'
import { NEXT_PUBLIC_NODE_ENV, SPACEDF_DEV_SECRET } from './shared/env'
import * as jose from 'jose'

// RegExp for public files
const PUBLIC_FILE = /\.(.*)$/ // Files

const PUBLIC_ROUTES = ['', 'invitation', 'protected']
const ORGANIZATION_INDEX_PATH = 'digital-twins'

const handleI18nRouting = createMiddleware({ locales, defaultLocale })

const isLocale = (value?: string): value is Locale =>
  locales.includes(value as Locale)

export default async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()

  if (PUBLIC_FILE.test(url.pathname) || url.pathname.includes('_next')) return

  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  const preferredLocale = isLocale(cookieLocale) ? cookieLocale : defaultLocale

  let [, locale, ...segments] = request.nextUrl.pathname.split('/')
  const host = request.headers.get('host')

  // If the first segment isn't a valid locale, default to the preferredLocale
  if (!isLocale(locale)) {
    locale = preferredLocale
    segments = url.pathname.split('/').filter(Boolean) // Reset segments without locale
  }

  const isDev = NEXT_PUBLIC_NODE_ENV === 'development'
  const isLocal = host?.includes('localhost:')

  if (isDev && !isLocal) {
    const devToken = request.cookies.get('dev-token')
    let decodedDevToken: jose.JWTPayload | null = null
    if (devToken?.value && SPACEDF_DEV_SECRET) {
      try {
        const secret = jose.base64url.decode(SPACEDF_DEV_SECRET)
        const { payload } = await jwtDecrypt(devToken.value, secret)
        decodedDevToken = payload
      } catch {
        decodedDevToken = null
      }
    }

    const isProtectedRoute = request.nextUrl.pathname === `/${locale}/protected`
    const hasValidToken =
      decodedDevToken?.hasAccessDev &&
      (!decodedDevToken?.exp || decodedDevToken.exp >= Date.now() / 1000)

    if (!hasValidToken && !isProtectedRoute) {
      return NextResponse.redirect(new URL(`/${locale}/protected`, url))
    }

    if (hasValidToken && isProtectedRoute) {
      return NextResponse.redirect(new URL(`/${locale}`, url))
    }
  }
  if (!isDev && request.nextUrl.pathname === `/${locale}/protected`) {
    return NextResponse.redirect(new URL(`/${locale}`, url))
  }

  const subdomain = await getValidSubdomain(host)
  if (!subdomain) {
    const demoUrl = `${request.nextUrl.protocol}//demo.${url.host}`

    return NextResponse.redirect(demoUrl, 308)
  }

  const userIsAuthenticated = await readSession()

  const pathAfterSubdomain = segments.join('/')
  const isPublicRoute = PUBLIC_ROUTES.includes(pathAfterSubdomain)
  const isApiRoute = segments[0] === 'api'

  if (!userIsAuthenticated && !isPublicRoute && !isApiRoute) {
    url.pathname = `/${locale}`
    return NextResponse.redirect(url)
  }

  const publicUrl = new URL(request.url)
  publicUrl.pathname = `/${locale}${segments.length ? `/${segments.join('/')}` : ''}`

  const i18nResponse = handleI18nRouting(
    new NextRequest(publicUrl, { headers: request.headers })
  )
  if (i18nResponse.headers.has('location')) return i18nResponse

  const internalUrl = request.nextUrl.clone()
  internalUrl.pathname = `/${locale}/${subdomain}/${
    segments.join('/') || ORGANIZATION_INDEX_PATH
  }`

  const response = NextResponse.rewrite(internalUrl, {
    headers: i18nResponse.headers,
  })
  response.cookies.set('organization', subdomain)
  return response
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', `/(vi|en)/:path*`, '/((?!api|_next|_vercel|.*\\..*).*)'],
}
