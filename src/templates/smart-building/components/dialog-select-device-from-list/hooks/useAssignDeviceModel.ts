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

export type AssignDeviceModelArg = {
  deviceId: string
  buildingId: string
  position?: { x: number; y: number; z: number }
}

type PatchDeviceResponse = {
  deviceId: string
  buildingId: string
  position?: { x: number; y: number; z: number }
}

async function assignDeviceToBuilding(
  spaceSlug: string,
  arg: AssignDeviceModelArg
): Promise<PatchDeviceResponse> {
  const { deviceId, buildingId, position } = arg
  return api.patch<PatchDeviceResponse>(
    `/api/devices/${spaceSlug}/${deviceId}`,
    {
      building: buildingId,
      ...(position ? { position } : {}),
    }
  )
}

export function useAssignDeviceModel() {
  const t = useTranslations('smartBuilding')
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const currentSpace = useGlobalStore((s) => s.currentSpace)
  const spaceSlugName = spaceSlug || currentSpace?.slug_name || ''
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (arg: AssignDeviceModelArg) => {
      return assignDeviceToBuilding(spaceSlugName, arg)
    },
    onSuccess: async (_, variables) => {
      toast.success(t('assign_device_success'))
      queryClient.setQueriesData<InfiniteData<DeviceDataOriginal[]>>(
        { queryKey: queryKeys.devices.list() },
        (oldData) => {
          if (!oldData || !oldData.pages) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page) =>
              page.map((device) => {
                if (device.id === variables.deviceId) {
                  return {
                    ...device,
                    building: device.building
                      ? {
                          ...device.building,
                          id: variables.buildingId,
                        }
                      : {
                          id: variables.buildingId,
                          name: '',
                          description: '',
                          location: {},
                        },
                    position: variables.position || device.position,
                  }
                }
                return device
              })
            ),
          }
        }
      )
      queryClient.invalidateQueries({ queryKey: queryKeys.devices.all })
    },
    onError: (error) => {
      toast.error(error?.message || t('assign_device_error'))
    },
  })
}
