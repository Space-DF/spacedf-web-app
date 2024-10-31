'use client'

import { Toaster } from '@/components/ui/sonner'
import { Session } from 'next-auth'
import { PropsWithChildren } from 'react'
import NextThemeProvider from './next-theme'
import { NextAuthSessionProvider } from './session-provider'

const AppProvider = ({
  children,
  session,
}: PropsWithChildren & {
  session: Session | null
}) => {
  return (
    <NextAuthSessionProvider session={session}>
      <NextThemeProvider>
        {children}
        <Toaster position="top-right" richColors />
      </NextThemeProvider>
    </NextAuthSessionProvider>
  )
}

export default AppProvider
