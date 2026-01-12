import { api } from '@/lib/api'
import { RefreshTokenResponse } from '@/types/auth'
import { useSession } from 'next-auth/react'
import useSWRMutation from 'swr/mutation'

const refreshToken = async (url: string): Promise<RefreshTokenResponse> => {
  return api.post(url)
}

export const useRefreshToken = () => {
  const { update } = useSession()
  return useSWRMutation('/api/auth/refresh-token', (url) => refreshToken(url), {
    onSuccess: (data) => {
      update({ user: data })
    },
  })
}
