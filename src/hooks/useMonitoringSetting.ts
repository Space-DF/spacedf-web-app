'use client'

import { queryKeys } from '@/lib/query-keys'
import { useMonitoringSettingStore } from '@/stores/monitoring-setting-store'
import { MonitoringSetting } from '@/types/organization'
import { fetcher } from '@/utils/common'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useSpaceSlug } from './useSpaceSlug'

export const MONITORING_SETTING_ENDPOINT = '/api/organizations/monitoring'

export const useMonitoringSetting = () => {
  const spaceSlug = useSpaceSlug()
  const setSettings = useMonitoringSettingStore((state) => state.setSettings)

  const query = useQuery({
    queryKey: queryKeys.monitoring.list(spaceSlug),
    queryFn: () => fetcher<MonitoringSetting[]>(MONITORING_SETTING_ENDPOINT),
    enabled: !!spaceSlug,
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    setSettings(query.data ?? [])
  }, [query.data, setSettings])

  return query
}
