import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'

interface SocialAuthResponse {
  redirectUrl: string
}

export const useSocialAuth = () => {
  const { mutateAsync, isPending } = useMutation<
    SocialAuthResponse,
    Error,
    { provider: 'google' | 'apple' }
  >({
    mutationFn: (arg) =>
      api.post<SocialAuthResponse>('/api/auth/social', {
        provider: arg.provider,
        callback_url: typeof window !== 'undefined' ? window.location.href : '',
      }),
  })

  return { trigger: mutateAsync, isMutating: isPending }
}
