import AppProvider from '@/components/providers'
import '@/styles/globals.css'
import { Locale } from '@/types/global'
import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'

import { notFound } from 'next/navigation'

import 'mapbox-gl/dist/mapbox-gl.css'
import { auth } from '@/lib/auth'
import { TooltipProvider } from '@/components/ui/tooltip'

export const metadata: Metadata = {
  title: 'SpaceDF',
  description:
    'SpaceDF is a ready-to-use IoT platform that lets you connect, manage, and control all your devices from one dashboard - No code & minimum setup. Easily turn it into a white-label solution, ready to launch under your own brand!',
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

  const session = await auth()

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
