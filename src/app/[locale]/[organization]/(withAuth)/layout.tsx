import '@/styles/globals.css'

import { Locale } from '@/types/global'
import React from 'react'
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
  params: { locale: Locale }
}>) {
  return children
}
