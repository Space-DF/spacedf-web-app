import { ApiErrorResponse } from '@/types/global'
import { SWR_GET_DEVICE_ENDPOINT } from './useDevices'
import useSWRMutation from 'swr/mutation'

export async function deleteDevice(
  url: string,
  { arg }: { arg: { id: string } }
): Promise<void> {
  const response = await fetch(url, {
    method: 'DELETE',
    body: JSON.stringify(arg),
  })

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(JSON.stringify(errorData) || 'Failed to update space')
  }

  return response.json()
}

export const useDeleteDevice = (id: string) =>
  useSWRMutation(`${SWR_GET_DEVICE_ENDPOINT}/${id}`, deleteDevice)
