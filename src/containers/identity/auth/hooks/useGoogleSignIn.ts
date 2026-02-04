import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import useSWR from 'swr'
import { fetcher } from '@/utils'

export const useGoogleSignIn = (code: string | null) => {
  const t = useTranslations('signUp')
  return useSWR(code ? `/api/auth/social/google?code=${code}` : null, fetcher, {
    onError: () => {
      toast.error(t('google_sign_in_failed'))
    },
  })
}
