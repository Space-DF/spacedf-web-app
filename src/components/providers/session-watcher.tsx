'use client'
import { useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

export function SessionWatcher() {
  const { data: session } = useSession()
  const t = useTranslations('common')
  const router = useRouter()
  useEffect(() => {
    if (session?.user?.error === 'RefreshAccessTokenError') {
      toast.error(t('session_expired'))
      signOut({ redirect: false })
      router.push('/')
    }
  }, [session])

  return null
}
