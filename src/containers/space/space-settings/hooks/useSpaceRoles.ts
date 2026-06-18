import { queryKeys } from '@/lib/query-keys'
import { PaginationResponse } from '@/types/global'
import { SpaceRole } from '@/types/space'
import { fetcher } from '@/utils'
import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'

export const useSpaceRoles = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useQuery({
    queryKey: queryKeys.spaces.roles(spaceSlug),
    queryFn: () =>
      fetcher<PaginationResponse<SpaceRole>>(`/api/spaces/${spaceSlug}/roles`),
    enabled: !!spaceSlug,
  })
}
