'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { toast } from 'sonner'

import api from '@/lib/api'
import { useGlobalStore } from '@/stores'

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
    onSuccess: async () => {
      toast.success(t('assign_device_success'))
      queryClient.invalidateQueries({ queryKey: ['devices'] })
    },
    onError: (error) => {
      toast.error(error?.message || t('assign_device_error'))
    },
  })
}
