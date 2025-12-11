import { Entity } from '@/types/entity'
import { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils'
import useSWR from 'swr'

export const useDeviceEntity = (entityType: string) => {
  return useSWR(
    `/api/spaces/entities?type=${entityType}`,
    fetcher<PaginationResponse<Entity>>
  )
}
