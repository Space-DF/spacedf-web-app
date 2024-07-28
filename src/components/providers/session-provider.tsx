"use client"

import Identity from "@/containers/identity"
import { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"
import { PropsWithChildren } from "react"

export const NextAuthSessionProvider = ({
  children,
  session,
}: PropsWithChildren & {
  session: Session | null
}) => {
  return (
    <SessionProvider session={session}>
      {children}
      <Identity />
    </SessionProvider>
  )
}
