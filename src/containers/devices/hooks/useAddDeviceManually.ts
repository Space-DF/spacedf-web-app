import { useParams } from 'next/navigation'
import useSWRMutation from 'swr/mutation'
import api from '@/lib/api'
import { AddDeviceSchema } from '../components/add-device-dialog/schema'

interface AddDeviceManualPayload extends AddDeviceSchema {
  position?: {
    x: number
    y: number
    z: number
  }
  building?: string
}

const addDeviceManual = async (
  url: string,
  { arg }: { arg: AddDeviceManualPayload }
) => {
  return api.post(url, arg)
}

export const useAddDeviceManually = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWRMutation(`/api/devices/${spaceSlug}`, addDeviceManual)
}
