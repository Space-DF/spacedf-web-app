import '@/styles/globals.css'
import { redirect } from '@/i18n/routing'

import { Locale } from '@/types/global'
import React from 'react'
import { auth } from '@/lib/auth'
export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode
  params: { locale: Locale }
}>) {
  const session = await auth()

  if (!session) {
    redirect({ href: '/', locale })
  }

  return children
}
