import { locales } from "./i18n"

import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { Locale } from "./types/global"

export default async function middleware(request: NextRequest) {
  const defaultLocale = "en" as Locale

  // Extract the pathname from the request
  const { pathname } = request.nextUrl

  // Step 2: Create and call the next-intl middleware (example)
  const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale,
    // localeDetection: false,
    // alternateLinks: false,
  })

  // Handle the locale routing
  let response = handleI18nRouting(request)

  // Step 3: Check if the current path is undefined, "/", or a locale root path (e.g., "/en")
  const isLocaleRootPath = locales.some((locale) => pathname === `/${locale}`)
  if (!pathname || pathname === "/" || isLocaleRootPath) {
    // Extract the locale from the pathname or use defaultLocale if pathname is "/"
    const currentLocale = isLocaleRootPath
      ? pathname.replace("/", "")
      : defaultLocale

    // Redirect to "/onboarding" with the current locale
    const redirectUrl = `/${currentLocale}/onboarding`
    response = NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  return response
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    "/",
    `/(vi|en)/:path*`,
    "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
}
