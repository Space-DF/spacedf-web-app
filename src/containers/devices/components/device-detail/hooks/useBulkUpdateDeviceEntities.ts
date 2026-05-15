'use client'

import api from '@/lib/api'
import { queryKeys } from '@/lib/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import queryString from 'query-string'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

/** Matches SDK `BulkUpdateEntitiesParams` for `/api/spaces/entities` PUT body. */
export type BulkUpdateEntitiesPayload = {
  visible_entity_ids: string[]
  hidden_entity_ids: string[]
}

async function bulkUpdateEntities(
  spaceSlug: string,
  payload: BulkUpdateEntitiesPayload
) {
  const url = queryString.stringifyUrl({
    url: '/api/spaces/entities',
    query: { spaceSlug },
  })
  return api.put<{ message: string }>(url, payload)
}

export function useBulkUpdateDeviceEntities() {
  const t = useTranslations('addNewDevice')
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: BulkUpdateEntitiesPayload) => {
      if (!spaceSlug) throw new Error('Missing space')
      return bulkUpdateEntities(spaceSlug, payload)
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...queryKeys.deviceEntities.all, spaceSlug],
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.devices.all,
        }),
      ])
      toast.success(t('entities_saved_successfully'))
    },
    onError: (error: Error) => {
      toast.error(error?.message || t('entities_save_failed'))
    },
  })
}
