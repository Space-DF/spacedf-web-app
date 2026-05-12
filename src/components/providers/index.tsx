'use client'

import { Toaster } from '@/components/ui/sonner'
import { Session } from 'next-auth'
import { PropsWithChildren } from 'react'
import { SWRDevTools } from 'swr-devtools'
import NextThemeProvider from './next-theme'
import { NextAuthSessionProvider } from './session-provider'
import SWRProvider from './swr-provider'
import { AuthDemoProvider } from './authdemo-provider'
import { DeviceProvider } from './device-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

const AppProvider = ({
  children,
  session,
}: PropsWithChildren & {
  session: Session | null
}) => {
  return (
    <SWRDevTools>
      <QueryClientProvider client={queryClient}>
        <ReactQueryDevtools />
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
      </QueryClientProvider>
    </SWRDevTools>
  )
}

export default AppProvider
