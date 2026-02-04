'use client'

import { Toaster } from '@/components/ui/sonner'
import { Session } from 'next-auth'
import { PropsWithChildren } from 'react'
import { SWRDevTools } from 'swr-devtools'
import { DeviceProvider } from './device-provider'
import NextThemeProvider from './next-theme'
import { NextAuthSessionProvider } from './session-provider'
import SWRProvider from './swr-provider'
import { AuthDemoProvider } from './authdemo-provider'

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
            <AuthDemoProvider>
              <DeviceProvider>{children}</DeviceProvider>
            </AuthDemoProvider>
          </SWRProvider>
          <Toaster position="top-right" richColors />
        </NextAuthSessionProvider>
      </NextThemeProvider>
    </SWRDevTools>
  )
}

export default AppProvider
