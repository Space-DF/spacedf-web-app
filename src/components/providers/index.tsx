'use client'

import { Toaster } from '@/components/ui/sonner'
import { Session } from 'next-auth'
import { PropsWithChildren } from 'react'
import NextThemeProvider from './next-theme'
import { NextAuthSessionProvider } from './session-provider'
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
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
      <NextThemeProvider>
        <NextAuthSessionProvider session={session}>
          <AuthDemoProvider>
            <DeviceProvider>{children}</DeviceProvider>
          </AuthDemoProvider>
          <Toaster position="top-right" richColors />
        </NextAuthSessionProvider>
      </NextThemeProvider>
    </QueryClientProvider>
  )
}

export default AppProvider
