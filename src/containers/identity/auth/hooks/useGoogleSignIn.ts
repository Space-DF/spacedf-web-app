import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useEffect } from 'react'

export const useGoogleSignIn = (code: string | null) => {
  const t = useTranslations('signUp')
  const query = useQuery({
    queryKey: ['googleSignIn', code],
    queryFn: () => api.get(`/api/auth/social/google?code=${code}`),
    enabled: !!code,
  })

  useEffect(() => {
    if (query.error) {
      toast.error(t('google_sign_in_failed'))
    }
  }, [query.error, t])

  return query
}
