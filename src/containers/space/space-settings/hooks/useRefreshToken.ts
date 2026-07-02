import { api } from '@/lib/api'
import { RefreshTokenResponse } from '@/types/auth'
import { useSession } from 'next-auth/react'
import { useMutation } from '@tanstack/react-query'

export const useRefreshToken = () => {
  const { update } = useSession()

  const { mutateAsync, isPending } = useMutation<
    RefreshTokenResponse,
    Error,
    void
  >({
    mutationFn: async () => {
      return api.post('/api/auth/refresh-token')
    },
    onSuccess: (data) => {
      update({ user: data })
    },
  })

  return { trigger: mutateAsync, isMutating: isPending }
}
