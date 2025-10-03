import { api } from '@/lib/api'
import { RefreshTokenResponse } from '@/types/auth'
import { useSession } from 'next-auth/react'
import useSWRMutation from 'swr/mutation'

const refreshToken = async (
  url: string,
  { arg }: { arg: string }
): Promise<RefreshTokenResponse> => {
  return api.post(url, { refreshToken: arg })
}

export const useRefreshToken = () => {
  const session = useSession()
  return useSWRMutation(
    '/api/auth/refresh-token',
    (url) => refreshToken(url, { arg: session.data?.user?.refresh as string }),
    {
      onSuccess: (data) => {
        session.update({ user: { ...session.data?.user, ...data } })
      },
    }
  )
}
