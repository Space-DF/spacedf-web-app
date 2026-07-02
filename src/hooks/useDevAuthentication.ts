import { queryKeys } from '@/lib/query-keys'
import { NEXT_PUBLIC_NODE_ENV } from '@/shared/env'
import { fetcher } from '@/utils'
import { useQuery } from '@tanstack/react-query'

const isDev = NEXT_PUBLIC_NODE_ENV === 'development'

const useCheckDevVerification = () => {
  return useQuery({
    queryKey: queryKeys.devVerification.check(),
    queryFn: () =>
      fetcher<{ verified: boolean }>('/api/check-dev-verification'),
    enabled: isDev,
  })
}

export const useDevAuthentication = () => {
  const { data, isLoading } = useCheckDevVerification()
  if (!isDev) {
    return { verified: true }
  }
  return { verified: data?.verified, isLoading }
}
