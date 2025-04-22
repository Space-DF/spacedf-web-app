'use client'

import Identity from '@/containers/identity'
import { useGoogleSignIn } from '@/containers/identity/auth/hooks/useGoogleSignIn'
import { Session } from 'next-auth'
import { SessionProvider, signIn } from 'next-auth/react'
import { PropsWithChildren, useCallback, useEffect } from 'react'
import LoadingFullScreen from '../ui/loading-fullscreen'
import { useRouter, useSearchParams } from 'next/navigation'

export const NextAuthSessionProvider = ({
  children,
  session,
}: PropsWithChildren & {
  session: Session | null
}) => {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const { data: googleSignInData, isLoading } = useGoogleSignIn(code)
  const router = useRouter()
  const handleSignIn = useCallback(async () => {
    if (!googleSignInData) return
    await signIn('credentials', {
      redirect: false,
      sigUpSuccessfully: true,
      dataUser: JSON.stringify(googleSignInData),
    })
    router.push('/')
  }, [googleSignInData])

  useEffect(() => {
    handleSignIn()
  }, [handleSignIn])

  if (isLoading) {
    return <LoadingFullScreen className="h-screen" />
  }
  return (
    <SessionProvider session={session}>
      {children}
      <Identity />
    </SessionProvider>
  )
}
