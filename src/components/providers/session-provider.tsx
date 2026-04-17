'use client'

import Identity from '@/containers/identity'
import { useGoogleSignIn } from '@/containers/identity/auth/hooks/useGoogleSignIn'
import { Session } from 'next-auth'
import { SessionProvider, signIn, useSession } from 'next-auth/react'
import { PropsWithChildren, useCallback, useEffect } from 'react'
import LoadingFullScreen from '../ui/loading-fullscreen'
import { useRouter, useSearchParams } from 'next/navigation'
import useJoinSpace from '@/containers/identity/auth/hooks/useJoinSpace'

function SessionReconnectGuard() {
  const { update } = useSession()

  useEffect(() => {
    const handleOnline = () => update()
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [update])

  return null
}

export const NextAuthSessionProvider = ({
  children,
  session,
}: PropsWithChildren & {
  session: Session | null
}) => {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const { trigger: joinSpace } = useJoinSpace()
  const token = searchParams.get('token')
  const { data: googleSignInData, isLoading } = useGoogleSignIn(code)
  const router = useRouter()
  const handleSignIn = useCallback(async () => {
    if (googleSignInData) {
      const result = await signIn('credentials', {
        redirect: false,
        signUpSuccessfully: true,
        dataUser: JSON.stringify(googleSignInData),
      })
      if (!result?.ok) return
      if (token) return await joinSpace(token)
      router.push('/')
    }
  }, [googleSignInData, token, joinSpace, router])

  useEffect(() => {
    handleSignIn()
  }, [handleSignIn])

  if (isLoading) {
    return <LoadingFullScreen className="h-screen" />
  }

  return (
    <SessionProvider session={session}>
      <SessionReconnectGuard />
      {children}
      <Identity />
    </SessionProvider>
  )
}
