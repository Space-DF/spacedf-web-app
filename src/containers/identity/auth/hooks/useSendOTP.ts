import useSWRMutation from 'swr/mutation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import api from '@/lib/api'

const fetcher = async (url: string, { arg }: { arg: string }) => {
  return api.post(url, { email: arg })
}

const useSendOTP = () => {
  const t = useTranslations('signUp')
  return useSWRMutation('/api/auth/send-otp', fetcher, {
    onSuccess: () => {
      toast.success(t('send_otp_success'))
    },
    onError: () => {
      toast.error(t('send_otp_error'))
    },
  })
}

export default useSendOTP
