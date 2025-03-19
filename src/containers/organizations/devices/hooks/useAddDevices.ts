import { ApiErrorResponse } from '@/types/global'
import useSWRMutation from 'swr/mutation'
import { SWR_GET_DEVICE_ENDPOINT } from './useDevices'
import { EUIDevice } from '../components/add-device/validator'

export async function createDevice(
  url: string,
  { arg }: { arg: EUIDevice['eui'] }
) {
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(arg),
  })

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(JSON.stringify(errorData) || 'Failed to create device')
  }

  return response.json()
}

export const useCreateDevice = (id: string) =>
  useSWRMutation(`${SWR_GET_DEVICE_ENDPOINT}/${id}`, createDevice)
