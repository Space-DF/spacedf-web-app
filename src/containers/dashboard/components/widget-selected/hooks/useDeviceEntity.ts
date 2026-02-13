import { Entity } from '@/types/entity'
import { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

export const useDeviceEntity = (entityType: string, search?: string) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWR(
    spaceSlug
      ? `/api/spaces/entities?type=${entityType}&spaceSlug=${spaceSlug}&search=${search ?? ''}`
      : null,
    fetcher<PaginationResponse<Entity>>
  )
}
