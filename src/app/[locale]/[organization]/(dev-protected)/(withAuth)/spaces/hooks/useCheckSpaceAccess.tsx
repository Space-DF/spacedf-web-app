import { useQuery } from '@tanstack/react-query'
import { useAuthenticated } from '@/hooks/useAuthenticated'
import { queryKeys } from '@/lib/query-keys'
import { CheckSpaceAccessResponse } from '@/types/space'
import { fetcher } from '@/utils'
import { SWR_GET_SPACE_ENDPOINT } from './useGetSpaces'

export function useCheckSpaceAccess(slug?: string) {
  const isAuthenticated = useAuthenticated()

  return useQuery({
    queryKey: queryKeys.spaces.check(slug as string),
    queryFn: () =>
      fetcher<CheckSpaceAccessResponse>(
        `${SWR_GET_SPACE_ENDPOINT}/${slug}/check`
      ),
    enabled: !!slug && isAuthenticated,
    retry: false,
    staleTime: 0,
  })
}
