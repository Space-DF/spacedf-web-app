import { useParams } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api'
import { AddDeviceSchema } from '../components/add-device-dialog/schema'
import { DeviceDataOriginal } from '@/types/device'

interface AddDeviceManualPayload extends AddDeviceSchema {
  position?: {
    x: number
    y: number
    z: number
  }
  building?: string
}

export const useAddDeviceManually = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()

  const mutation = useMutation<
    DeviceDataOriginal,
    Error,
    AddDeviceManualPayload
  >({
    mutationFn: (arg: AddDeviceManualPayload) =>
      api.post<DeviceDataOriginal>(`/api/devices/${spaceSlug}`, arg),
  })

  return {
    trigger: mutation.mutateAsync,
    isMutating: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
  }
}
