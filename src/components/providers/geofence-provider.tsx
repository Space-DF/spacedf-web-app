'use client'

import { NavigationEnums } from '@/constants'
import { useLayout } from '@/stores'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'
import type { Geofence } from '@/types/geofence'
import type { PaginationResponse } from '@/types/global'
import { fetcher } from '@/utils'
import { useParams } from 'next/navigation'
import { PropsWithChildren, useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { useShallow } from 'zustand/react/shallow'
import { useBBoxDebounce } from '@/hooks/useBBoxDebounce'
import { useGeofenceMapStore } from '@/stores/geofence-map-store'

const mapInstance = MapInstance.getInstance()

export const GeofenceProvider = ({ children }: PropsWithChildren) => {
  const { spaceSlug } = useParams<{ spaceSlug: string }>()
  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))
  const isGeofencesActive = dynamicLayouts.includes(NavigationEnums.GEOFENCES)

  const bboxDebounced = useBBoxDebounce()

  const swrKey = useMemo(() => {
    if (!spaceSlug || !isGeofencesActive || !bboxDebounced) return null
    const base = `/api/geofence?spaceSlug=${spaceSlug}&offset=0&limit=200`
    return `${base}&bbox=${encodeURIComponent(bboxDebounced)}`
  }, [bboxDebounced, isGeofencesActive, spaceSlug])

  const { data, isLoading } = useSWR<PaginationResponse<Geofence>>(
    swrKey,
    fetcher
  )
  const geofences = useMemo(() => data?.results ?? [], [data?.results])

  const setGeofences = useGeofenceMapStore((s) => s.setGeofences)
  const syncGeofencesToMap = useGeofenceMapStore((s) => s.syncGeofencesToMap)
  const clearRendered = useGeofenceMapStore((s) => s.clearRendered)

  useEffect(() => {
    if (!geofences.length || isLoading) return
    setGeofences(geofences)
    syncGeofencesToMap()
  }, [geofences, setGeofences, syncGeofencesToMap])

  useEffect(() => {
    if (!isGeofencesActive || !geofences.length || isLoading) return

    syncGeofencesToMap()
    const handleMapReady = () => syncGeofencesToMap()
    mapInstance.on('ready', handleMapReady)
    mapInstance.on('style.load', handleMapReady)

    return () => {
      mapInstance.off('ready', handleMapReady)
      mapInstance.off('style.load', handleMapReady)
      clearRendered()
    }
  }, [syncGeofencesToMap, clearRendered, isGeofencesActive])

  return <>{children}</>
}
