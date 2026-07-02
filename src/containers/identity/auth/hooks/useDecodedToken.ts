import { TokenInviteMember } from '@/types/token'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export const useDecodedToken = (token: string | null) => {
  return useQuery<TokenInviteMember>({
    queryKey: ['decodedToken', token],
    queryFn: () => api.get<TokenInviteMember>(`/api/auth/token?token=${token}`),
    enabled: !!token,
  })
}
