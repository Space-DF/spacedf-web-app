import { authOptions } from '@/lib/auth'
import '@/styles/globals.css'
import { getServerSession } from 'next-auth'
import { redirect } from '@/i18n/routing'

import { Locale } from '@/types/global'
import React from 'react'

export default async function RootLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode
  params: { locale: Locale }
}>) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect({ href: '/', locale })
  }

  return children
}
