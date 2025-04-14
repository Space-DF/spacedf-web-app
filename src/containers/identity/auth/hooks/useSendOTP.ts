import useSWRMutation from 'swr/mutation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

const fetcher = async (url: string, { arg }: { arg: string }) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: arg }),
  })
  if (!res.ok) {
    throw new Error('Failed to send OTP')
  }
  return res.json()
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
