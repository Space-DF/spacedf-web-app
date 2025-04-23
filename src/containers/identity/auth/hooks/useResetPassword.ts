import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'
import { useTranslations } from 'next-intl'
const fetcher = async (
  url: string,
  { arg }: { arg: { token: string; password: string } }
) => {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })
  const data = await response.json()
  if (!response.ok) {
    throw data
  }
  return data
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
