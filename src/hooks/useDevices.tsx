import { Device } from '@/stores/device-store'
import { ApiErrorResponse } from '@/types/global'

import useSWR, { SWRConfiguration } from 'swr'

export type UseGetDeviceResponse = Record<string, Device>

export const SWR_GET_DEVICE_ENDPOINT = '/api/devices'

export async function getDevices<T>(url: string): Promise<T> {
  const response = await fetch(url)

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json()
    throw new Error(JSON.stringify(errorData) || 'Failed to get devices')
  }

  return response.json()
}

export function useGetDevices(configs: SWRConfiguration = {}) {
  return useSWR(
    SWR_GET_DEVICE_ENDPOINT,
    getDevices<UseGetDeviceResponse>,
    configs
  )
}
