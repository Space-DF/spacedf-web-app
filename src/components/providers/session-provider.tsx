"use client"

import { Session } from "next-auth"
import { SessionProvider, signIn, useSession } from "next-auth/react"
import { PropsWithChildren } from "react"

export const NextAuthSessionProvider = ({
  children,
  session,
}: PropsWithChildren & {
  session: Session | null
}) => {
  return <SessionProvider session={session}>{children}</SessionProvider>
}
