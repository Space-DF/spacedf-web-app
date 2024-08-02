"use client"

import { PropsWithChildren } from "react"
import NextThemeProvider from "./next-theme"
import { buildProvidersTree } from "./provider-tree"
import { Session } from "next-auth"
import { NextAuthSessionProvider } from "./session-provider"
import { Toaster } from "@/components/ui/sonner"

// import { Toast, ToastProvider } from "../ui/toast"

const AppProvider = ({
  children,
  session,
}: PropsWithChildren & {
  session: Session | null
}) => {
  const ProviderTree = buildProvidersTree([
    [NextThemeProvider],
    [
      NextAuthSessionProvider,
      {
        session,
      },
    ],
    // [ToastProvider],
  ])

  return (
    <ProviderTree>
      {children}
      <Toaster position="top-right" richColors />
    </ProviderTree>
  )
}

export default AppProvider
