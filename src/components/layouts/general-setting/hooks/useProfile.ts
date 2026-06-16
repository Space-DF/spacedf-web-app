import api from '@/lib/api'
import { Profile } from '@/types/profile'
import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'

export const useProfile = (isAuthenticated = true) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: queryKeys.profile.detail(),
    queryFn: () => api.get<Profile>('/api/me'),
    enabled: isAuthenticated,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  })

  return {
    data,
    isLoading,
    mutate: refetch,
  }
}
