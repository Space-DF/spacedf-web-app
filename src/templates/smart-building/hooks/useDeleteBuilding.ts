import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import queryString from 'query-string'
import { toast } from 'sonner'

import { useSpaceSlug } from '@/hooks'
import api from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import { removeBuildingFromListCache } from '@/templates/smart-building/hooks/useBuilding'
import type { Building } from '@/types/building'
import type { PaginationResponse } from '@/types/global'

const deleteBuildingRequest = async (url: string) => api.delete(url)

export const useDeleteBuilding = (buildingId?: string) => {
  const t = useTranslations('smartBuilding')
  const queryClient = useQueryClient()
  const spaceSlugName = useSpaceSlug()

  return useMutation({
    mutationFn: () => {
      if (!buildingId || !spaceSlugName) {
        throw new Error('Missing building or space')
      }
      const url = queryString.stringifyUrl({
        url: `/api/building/${buildingId}`,
        query: { spaceSlug: spaceSlugName },
      })
      return deleteBuildingRequest(url)
    },
    onSuccess: () => {
      if (!buildingId || !spaceSlugName) return

      queryClient.setQueryData<PaginationResponse<Building>>(
        queryKeys.buildings.list(spaceSlugName),
        (current) => removeBuildingFromListCache(current, buildingId)
      )
      toast.success(t('delete_building_success'))
    },
    onError: (error: Error) => {
      toast.error(error?.message || t('delete_building_error'))
    },
  })
}
