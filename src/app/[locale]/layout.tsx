import AppProvider from '@/components/providers'
import '@/styles/globals.css'
import { Locale } from '@/types/global'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'

import { notFound } from 'next/navigation'

import 'mapbox-gl/dist/mapbox-gl.css'
import { TooltipProvider } from '@/components/ui/tooltip'
import { readSession } from '@/utils/server-actions'

export const metadata: Metadata = {
  title: 'SpaceDF Dashboard - Monitor Real-Time GPS & Device Data in one place',
  description:
    'Manage and monitor all IoT devices in one centralized dashboard. Get real-time data, device status, GPS tracking, digital twins, and more',
  openGraph: {
    images: ['https://d33et8skld5wvq.cloudfront.net/images/spacedf-og.jpg'],
    siteName: 'SpaceDF Digital Twin Dashboard',
  },
  twitter: {
    images: ['https://d33et8skld5wvq.cloudfront.net/images/spacedf-og.jpg'],
  },
  keywords: [
    'IoT dashboard',
    'Real-time GPS tracking',
    'GPS tracking dashboard',
    'Device monitoring dashboard',
    'Centralized dashboard',
    'all-in-one dashboard',
    'Device tracking platform',
    'Device data monitoring',
    'Digital Twins dashboard',
  ],
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
