import { locales } from "./i18n"

import createMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { Locale } from "./types/global"
import { getCookieServer } from "./utils/server-actions"
import { getToken } from "next-auth/jwt"
import { getSubdomain } from "./utils"

export default async function middleware(
  request: NextRequest,
  nextResponse: NextResponse
) {
  const session = await getToken({
    req: request,
  })

  const defaultLocale = "en" as Locale

  const { pathname, hostname, host } = request.nextUrl

  const headerHost = request.headers.get("x-forwarded-host")
  const headerHostSegments = headerHost?.split(".")
  const rootHost = request.nextUrl.host
  console.log({ request })

  // Create and call the next-intl middleware (example)
  const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale,
  })

  // Handle the locale routing
  let response = handleI18nRouting(request)
  let env = "production"
  const organization = getSubdomain(headerHost || "", rootHost || "")

  if (headerHost?.startsWith("dev")) {
    env = "development"
    // organization = (hostname !== "localhost" && headerHostSegments?.[1]) || ""
  }

  response.cookies.set("organization", organization)
  response.cookies.set("env", env)

  //Check if the current path is undefined, "/", or a locale root path (e.g., "/en")
  const isLocaleRootPath = locales.some((locale) => pathname === `/${locale}`)
  const currentLocale = isLocaleRootPath
    ? pathname.replace("/", "")
    : getCookieServer("NEXT_LOCALE", defaultLocale)

  if (!pathname || pathname === "/" || isLocaleRootPath) {
    // Extract the locale from the pathname or use defaultLocale if pathname is "/"
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
