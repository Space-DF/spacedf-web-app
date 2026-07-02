import { queryKeys } from '@/lib/query-keys'
import { PaginationResponse } from '@/types/global'
import { Member } from '@/types/members'
import { fetcher } from '@/utils'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

export const useSpaceMembers = (
  pageIndex: number = 0,
  limit: number = 10,
  search: string = ''
) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  const queryResult = useQuery({
    queryKey: queryKeys.spaces.members(spaceSlug, { pageIndex, limit, search }),
    queryFn: () =>
      fetcher<PaginationResponse<Member>>(
        `/api/spaces/${spaceSlug}/members?pageIndex=${pageIndex}&limit=${limit}&search=${search}`
      ),
    enabled: !!spaceSlug,
  })

  return {
    ...queryResult,
    mutate: queryResult.refetch,
  }
}
