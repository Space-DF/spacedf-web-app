import { toast } from 'sonner'
import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import api from '@/lib/api'

export const useResetPassword = () => {
  const t = useTranslations('signUp')
  const { mutateAsync, isPending } = useMutation<
    void,
    Error,
    { token: string; password: string }
  >({
    mutationFn: async (arg) => {
      return api.post('/api/auth/reset-password', arg)
    },
    onSuccess: () => {
      toast.success(t('password_reset_successful'))
    },
    onError: () => {
      toast.error(t('password_reset_failed'))
    },
  })

  return { trigger: mutateAsync, isMutating: isPending }
}
