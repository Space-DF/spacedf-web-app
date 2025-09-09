import api from '@/lib/api'
import { DeviceSpace } from '@/types/device-space'
import { useParams } from 'next/navigation'

import useSWR, { SWRConfiguration } from 'swr'

export const SWR_GET_DEVICE_ENDPOINT = '/api/devices'

export function getDevices<T>(url: string): Promise<T> {
  return api.get(url)
}

export function useGetDevices(configs: SWRConfiguration = {}) {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  return useSWR(
    `${SWR_GET_DEVICE_ENDPOINT}${spaceSlug ? `/${spaceSlug}` : ''}`,
    getDevices<DeviceSpace[]>,
    configs
  )
}
