import useSWRMutation, { SWRMutationResponse } from 'swr/mutation'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { SignUpFormCredentials } from '..'

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
) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  })

  const data = await res.json()

  if (!res.ok) {
    throw data
  }

  return data
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
