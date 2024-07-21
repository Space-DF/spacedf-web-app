import { PropsWithChildren } from "react"
import NextThemeProvider from "./next-theme"
import { buildProvidersTree } from "./provider-tree"
import { Session } from "next-auth"
import { NextAuthSessionProvider } from "./session-provider"

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
  ])

  return <ProviderTree>{children}</ProviderTree>
}

export default AppProvider
