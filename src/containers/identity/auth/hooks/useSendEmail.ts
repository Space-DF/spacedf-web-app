import api from '@/lib/api'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import useSWRMutation from 'swr/mutation'

const fetcher = async (url: string, { arg }: { arg: { email: string } }) => {
  return api.post(url, arg)
}

export const useSendEmail = () => {
  const t = useTranslations('signUp')
  return useSWRMutation('/api/auth/confirm-email', fetcher, {
    onSuccess: () => {
      toast.success(t('email_sent'))
    },
    onError: () => {
      toast.error(t('email_not_sent'))
    },
  })
}
