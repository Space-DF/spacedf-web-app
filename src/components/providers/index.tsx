import { PropsWithChildren } from "react"
import NextThemeProvider from "./next-theme"
import { buildProvidersTree } from "./provider-tree"

const AppProvider = ({ children }: PropsWithChildren) => {
  const ProviderTree = buildProvidersTree([[NextThemeProvider]])

  return <ProviderTree>{children}</ProviderTree>
}

export default AppProvider
