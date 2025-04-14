import { TokenInviteMember } from '@/types/token'
import useSWR from 'swr'

const fetcher = async (url: string | null) => {
  if (!url) return null
  const res = await fetch(url)
  const response = await res.json()
  if (!res.ok) {
    throw response
  }
  return response
}

export const useDecodedToken = (token: string | null) =>
  useSWR<TokenInviteMember>(
    token ? `/api/auth/token?token=${token}` : null,
    fetcher
  )
