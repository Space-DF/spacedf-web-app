import { ThemeProvider } from "next-themes"
import React, { PropsWithChildren } from "react"

const NextThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider attribute="class" enableSystem>
      {children}
    </ThemeProvider>
  )
}

export default NextThemeProvider
