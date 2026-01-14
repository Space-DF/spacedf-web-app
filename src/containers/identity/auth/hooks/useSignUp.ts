import useSWRMutation, { SWRMutationResponse } from 'swr/mutation'
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

const fetcher = async (
  url: string,
  { arg }: { arg: SignUpFormCredentials & { otp: string } }
): Promise<SignUpResponse> => {
  return api.post(url, arg)
}

const useSignUp = (): SWRMutationResponse<
  SignUpResponse,
  Error,
  string,
  SignUpFormCredentials & { otp: string }
> => {
  const t = useTranslations('signUp')
  return useSWRMutation('/api/auth/register', fetcher, {
    onSuccess: (data) => {
      toast.success(t('sign_up_success'))
      return data
    },
    onError: () => {
      toast.error(t('sign_up_failed'))
    },
  })
}

export default useSignUp
