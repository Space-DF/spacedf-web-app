import { useParams } from 'next/navigation'
import { AddDeviceSchema } from '..'
import useSWRMutation from 'swr/mutation'

const addDeviceManual = async (
  url: string,
  { arg }: { arg: AddDeviceSchema }
) => {
  const res = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })
  const response = await res.json()
  if (res.ok) {
    return response
  }
  throw response
}

export const useAddDeviceManually = () => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWRMutation(`/api/devices/${spaceSlug}`, addDeviceManual)
}
