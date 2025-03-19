import { ApiErrorResponse } from '@/types/global'
import { EUIDevice } from '../components/add-device/validator'
import { SWR_GET_DEVICE_ENDPOINT } from './useDevices'
import useSWRMutation from 'swr/mutation'

export async function updateDevices(
  url: string,
  { arg }: { arg: EUIDevice['eui'][0] }
): Promise<{ data: EUIDevice['eui'] }> {
  const response = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(arg),
  })

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(JSON.stringify(errorData) || 'Failed to update space')
  }

  return response.json()
}

export const useUpdateDevice = (id: string) =>
  useSWRMutation(`${SWR_GET_DEVICE_ENDPOINT}/${id}`, updateDevices)
