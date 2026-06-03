import AppProvider from '@/components/providers'
import '@/styles/globals.css'
import { Locale } from '@/types/global'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'

import { notFound } from 'next/navigation'

import 'maplibre-gl/dist/maplibre-gl.css'
import { TooltipProvider } from '@/components/ui/tooltip'
import { readSession } from '@/utils/server-actions'
import { buildMetadata } from '@/utils'
import { headers } from 'next/headers'
import { getValidSubdomain } from '@/utils/subdomain'
import { checkSlugName } from '@/lib/organizations'
export async function generateMetadata(): Promise<Metadata> {
  const host = headers().get('host') || 'localhost'
  const org = await getValidSubdomain(host)

  const defaultMetadata = {
    title:
      'SpaceDF Dashboard - Monitor Real-Time GPS & Device Data in one place',
    description:
      'Manage and monitor all IoT devices in one centralized dashboard. Get real-time data, device status, GPS tracking, digital twins, and more',
    siteName: 'SpaceDF Digital Twin Dashboard',
  }

  const defaultFavicon = {
    light: '/favicon.ico',
    dark: '/favicon-dark.ico',
  }

  if (!org) {
    return buildMetadata(defaultMetadata, defaultFavicon)
  }

  const orgResult = await checkSlugName(org)

  if (!orgResult.isValid || !orgResult.setting) {
    return buildMetadata(defaultMetadata, defaultFavicon)
  }

  const { site_title, site_description, brand_name, themes } = orgResult.setting

  const lightTheme = themes?.find((t) => t.theme_key === 'light') || themes?.[0]
  const darkTheme = themes?.find((t) => t.theme_key === 'dark')

  const favicon = {
    light:
      lightTheme?.url_favicon || darkTheme?.url_favicon || defaultFavicon.light,
    dark:
      darkTheme?.url_favicon || lightTheme?.url_favicon || defaultFavicon.dark,
  }

  return buildMetadata(
    {
      title:
        site_title ||
        (brand_name
          ? `${brand_name} - SpaceDF Dashboard`
          : defaultMetadata.title),

      description: site_description || defaultMetadata.description,

      siteName: brand_name || defaultMetadata.siteName,
    },
    favicon
  )
}
export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode
  params: { locale: Locale }
}>) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()

  const session = await readSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <AppProvider session={session}>
            <TooltipProvider>{children}</TooltipProvider>
          </AppProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
