'use client'

import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

import { queryKeys } from '@/lib/query-keys'
import api from '@/lib/api'
import { useGlobalStore } from '@/stores'
import { DeviceDataOriginal } from '@/types/device'
import { useMoveDeviceStore } from '@/stores/template/move-device'

export type BulkUpdateDevicePositionsArg = {
  id: string
  position: { x: number; y: number; z: number }
}[]

async function bulkUpdateDevicePositions(
  spaceSlug: string,
  arg: BulkUpdateDevicePositionsArg
): Promise<BulkUpdateDevicePositionsArg> {
  return api.put<BulkUpdateDevicePositionsArg>(`/api/devices/${spaceSlug}`, arg)
}

export function useBulkUpdateDevicePositions() {
  const t = useTranslations('smartBuilding')
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((s) => s.currentSpace)
  const spaceSlugName = spaceSlug || currentSpace?.slug_name || ''
  const queryClient = useQueryClient()

  const resetMoveDeviceStore = useMoveDeviceStore((state) => state.reset)

  return useMutation({
    mutationFn: async (arg: BulkUpdateDevicePositionsArg) => {
      return bulkUpdateDevicePositions(spaceSlugName, arg)
    },
    onSuccess: async (data) => {
      queryClient.setQueriesData<InfiniteData<DeviceDataOriginal[]>>(
        { queryKey: queryKeys.devices.all },
        (oldData) => {
          if (!oldData) return oldData
          const positionMap = new Map<
            string,
            { x: number; y: number; z: number }
          >()
          data?.forEach((item) => {
            positionMap.set(item.id, item.position)
          })

          return {
            ...oldData,
            pages: oldData.pages.map((page) =>
              page.map((device) => {
                if (positionMap.has(device.id)) {
                  return {
                    ...device,
                    position: positionMap.get(device.id)!,
                  }
                }
                return device
              })
            ),
          }
        }
      )
      resetMoveDeviceStore()
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.all })
    },
    onError: (error) => {
      toast.error(error?.message || t('assign_device_error'))
    },
  })
}
