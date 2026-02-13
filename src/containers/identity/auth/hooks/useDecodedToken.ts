import { TokenInviteMember } from '@/types/token'
import useSWR from 'swr'
import { fetcher } from '@/utils'

export const useDecodedToken = (token: string | null) =>
  useSWR<TokenInviteMember>(
    token ? `/api/auth/token?token=${token}` : null,
    fetcher
  )
