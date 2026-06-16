import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import api from '@/lib/api'

const useSendOTP = () => {
  const t = useTranslations('signUp')
  const { mutateAsync, isPending } = useMutation<any, Error, string>({
    mutationFn: async (arg) => {
      return api.post('/api/auth/send-otp', { email: arg })
    },
    onSuccess: () => {
      toast.success(t('send_otp_success'))
    },
    onError: () => {
      toast.error(t('send_otp_error'))
    },
  })

  return { trigger: mutateAsync, isMutating: isPending }
}

export default useSendOTP
