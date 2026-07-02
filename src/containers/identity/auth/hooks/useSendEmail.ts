import api from '@/lib/api'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'

export const useSendEmail = () => {
  const t = useTranslations('signUp')
  const { mutateAsync, isPending } = useMutation<
    void,
    Error,
    { email: string }
  >({
    mutationFn: async (arg) => {
      return api.post('/api/auth/confirm-email', arg)
    },
    onSuccess: () => {
      toast.success(t('email_sent'))
    },
    onError: () => {
      toast.error(t('email_not_sent'))
    },
  })

  return { trigger: mutateAsync, isMutating: isPending }
}
