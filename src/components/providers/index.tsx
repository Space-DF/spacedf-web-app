'use client'

import { Toaster } from '@/components/ui/sonner'
import { Session } from 'next-auth'
import { PropsWithChildren } from 'react'
import NextThemeProvider from './next-theme'
import { NextAuthSessionProvider } from './session-provider'
import { MapProvider } from './map-provider'
import SWRProvider from './swr-provider'
import { SWRDevTools } from 'swr-devtools'

const AppProvider = ({
  children,
  session,
}: PropsWithChildren & {
  session: Session | null
}) => {
  return (
    <SWRDevTools>
      <NextThemeProvider>
        <NextAuthSessionProvider session={session}>
          <SWRProvider>
            <MapProvider>{children}</MapProvider>
          </SWRProvider>
          <Toaster position="top-right" richColors />
        </NextAuthSessionProvider>
      </NextThemeProvider>
    </SWRDevTools>
  )
}

export default AppProvider
