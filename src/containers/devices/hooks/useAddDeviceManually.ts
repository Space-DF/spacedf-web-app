import { useParams } from 'next/navigation'
import { AddDeviceSchema } from '..'
import useSWRMutation from 'swr/mutation'
import api from '@/lib/api'

const addDeviceManual = async (
  url: string,
  { arg }: { arg: AddDeviceSchema }
) => {
  return api.post(url, arg)
}

export const useAddDeviceManually = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWRMutation(`/api/devices/${spaceSlug}`, addDeviceManual)
}
