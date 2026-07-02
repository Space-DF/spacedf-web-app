import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { SignUpFormCredentials } from '..'
import api from '@/lib/api'

interface SignUpResponse {
  message: string
  user: {
    id: string
    first_name: string
    last_name: string
    email: string
  }
  refresh: string
  access: string
  default_space: string
}

const useSignUp = () => {
  const t = useTranslations('signUp')
  const { mutateAsync, isPending } = useMutation<
    SignUpResponse,
    Error,
    SignUpFormCredentials & { otp: string }
  >({
    mutationFn: async (arg) => {
      return api.post<SignUpResponse>('/api/auth/register', arg)
    },
    onSuccess: () => {
      toast.success(t('sign_up_success'))
    },
    onError: () => {
      toast.error(t('sign_up_failed'))
    },
  })

  return { trigger: mutateAsync, isMutating: isPending }
}

export default useSignUp
