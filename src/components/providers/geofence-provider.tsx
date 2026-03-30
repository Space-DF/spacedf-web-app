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

  const { setGeofences, syncGeofencesToMap, clearRendered } =
    useGeofenceMapStore(
      useShallow((s) => ({
        setGeofences: s.setGeofences,
        syncGeofencesToMap: s.syncGeofencesToMap,
        clearRendered: s.clearRendered,
      }))
    )

  useEffect(() => {
    if (!geofences.length || isLoading) return
    setGeofences(geofences)
    syncGeofencesToMap()
    return () => {
      clearRendered()
    }
  }, [geofences, setGeofences, syncGeofencesToMap])

  useEffect(() => {
    if (!isGeofencesActive) return

    const handleReady = () => syncGeofencesToMap()
    const handleStyleLoad = () => {
      syncGeofencesToMap()
      const map = mapInstance.getMap()
      map?.once('idle', () => syncGeofencesToMap({ forceRedraw: true }))
    }

    syncGeofencesToMap()
    mapInstance.on('ready', handleReady)
    mapInstance.on('style.load', handleStyleLoad)

    return () => {
      mapInstance.off('ready', handleReady)
      mapInstance.off('style.load', handleStyleLoad)
    }
  }, [syncGeofencesToMap, isGeofencesActive])

  useEffect(() => {
    if (isGeofencesActive) return
    clearRendered()
  }, [isGeofencesActive, clearRendered])

  return <>{children}</>
}
