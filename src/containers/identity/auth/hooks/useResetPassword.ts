import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'
import { useTranslations } from 'next-intl'
import api from '@/lib/api'
const fetcher = async (
  url: string,
  { arg }: { arg: { token: string; password: string } }
) => {
  return api.post(url, arg)
}

export const useResetPassword = () => {
  const t = useTranslations('signUp')
  return useSWRMutation('/api/auth/reset-password', fetcher, {
    onSuccess: () => {
      toast.success(t('password_reset_successful'))
    },
    onError: () => {
      toast.error(t('password_reset_failed'))
    },
  })
}
