import api from '@/lib/api'
import { Device } from '@/stores/device-store'

import useSWR, { SWRConfiguration } from 'swr'

export type UseGetDeviceResponse = Record<string, Device>

export const SWR_GET_DEVICE_ENDPOINT = '/api/devices'

export function getDevices<T>(url: string): Promise<T> {
  return api.get(url)
}

export function useGetDevices(configs: SWRConfiguration = {}) {
  return useSWR(
    SWR_GET_DEVICE_ENDPOINT,
    getDevices<UseGetDeviceResponse>,
    configs
  )
}
