import { ApiErrorResponse } from '@/types/global'
import useSWR from 'swr'
import { EUIDevice } from '../components/add-device/validator'

export const SWR_GET_DEVICE_ENDPOINT = '/api/console/organization/devices'

export async function getDevices(
  url: string
): Promise<{ data: EUIDevice['eui'] }> {
  const response = await fetch(url)

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(JSON.stringify(errorData) || 'Failed to update space')
  }

  return response.json()
}

export const useDevices = (id: string) =>
  useSWR(`${SWR_GET_DEVICE_ENDPOINT}/${id}`, getDevices)
