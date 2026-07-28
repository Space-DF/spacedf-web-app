import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/query-keys'
import { Dashboard } from '@/types/dashboard'
import { useParams } from 'next/navigation'
import { useGlobalStore } from '@/stores'
import { fetcher } from '@/utils'

export const useDashboard = (search?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const spaceSlugName = currentSpace?.slug_name || spaceSlug

  const queryResult = useQuery<Dashboard[]>({
    queryKey: queryKeys.dashboards.list(spaceSlugName, search),
    queryFn: () =>
      fetcher<Dashboard[]>(
        `/api/dashboard/${spaceSlugName}?search=${search ?? ''}`
      ),
    enabled: !!spaceSlugName,
  })

  return queryResult
}
