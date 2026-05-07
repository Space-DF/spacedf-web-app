'use client'

import Identity from '@/containers/identity'
import { useGoogleSignIn } from '@/containers/identity/auth/hooks/useGoogleSignIn'
import { Session } from 'next-auth'
import { SessionProvider, signIn, useSession } from 'next-auth/react'
import { PropsWithChildren, useCallback, useEffect } from 'react'
import LoadingFullScreen from '../ui/loading-fullscreen'
import { useRouter, useSearchParams } from 'next/navigation'
import useJoinSpace from '@/containers/identity/auth/hooks/useJoinSpace'
import { useSubscribeNotification } from '@/hooks/useSubscribeNotification'
import { useAuthenticated } from '@/hooks/useAuthenticated'
import { useMounted } from '@/hooks'

function NotificationPermissionOnEnter() {
  const isAuthenticated = useAuthenticated()
  const { registerServiceWorker } = useSubscribeNotification()
  const mounted = useMounted()

  useEffect(() => {
    if (!isAuthenticated || !mounted) return

    const permission =
      typeof Notification !== 'undefined' ? Notification.permission : 'default'

    if (permission === 'denied') return

    registerServiceWorker()
  }, [isAuthenticated, registerServiceWorker, mounted])

  return null
}

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
  const { registerServiceWorker } = useSubscribeNotification()
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
      await registerServiceWorker()
      router.push('/')
    }
  }, [googleSignInData, token, joinSpace, router, registerServiceWorker])

  useEffect(() => {
    handleSignIn()
  }, [handleSignIn])

  if (isLoading) {
    return <LoadingFullScreen className="h-screen" />
  }

  return (
    <SessionProvider session={session}>
      <SessionReconnectGuard />
      <NotificationPermissionOnEnter />
      {children}
      <Identity />
    </SessionProvider>
  )
}
