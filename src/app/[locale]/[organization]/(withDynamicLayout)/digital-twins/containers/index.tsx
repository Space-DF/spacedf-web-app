'use client'

import { useMounted } from '@/hooks'
import { useDeviceStore } from '@/stores/device-store'
import MapInstance from '@/utils/map-instance'
import { useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { getMapStyle } from '@/components/ui/select-map-type'
import { MapType } from '@/stores'
import mapboxgl from 'mapbox-gl'
import { useTheme } from 'next-themes'
import { useDraw3DBuilding } from '../hooks/useDraw3DBuilding'
import { useMapGroupCluster } from '../hooks/useMapGroupCluster'
import { Device } from './device'

const mapInstanceGlobal = MapInstance.getInstance()

export const DigitalTwinsContainer = () => {
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const { theme, systemTheme } = useTheme()

  const isMounted = useMounted()
  //   const { loadMapGroupCluster } = useMapGroupCluster()
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  const { devices, initializedSuccess, setDeviceSelected } = useDeviceStore(
    useShallow((state) => ({
      devices: state.devices,
      initializedSuccess: state.initializedSuccess,
      setDeviceSelected: state.setDeviceSelected,
    }))
  )

  const { startDrawBuilding } = useDraw3DBuilding()
  const { loadMapGroupCluster, updateClusters } = useMapGroupCluster()

  const currentTheme = (theme === 'system' ? systemTheme : theme) as
    | 'dark'
    | 'light'

  useEffect(() => {
    if (initializedSuccess && isMounted) {
      renderMaps()
    }
  }, [initializedSuccess, isMounted, JSON.stringify(devices)])

  const renderMaps = () => {
    if (!mapContainerRef.current || window.mapInstance) return

    const mapType = localStorage.getItem('map_type') as MapType

    mapInstanceGlobal.initializeMap({
      container: mapContainerRef.current,
    })

    window.mapInstance = mapInstanceGlobal
    const map = mapInstanceGlobal.getMapInstance()

    map?.setStyle(getMapStyle(mapType, currentTheme).style, {
      config: getMapStyle(mapType, currentTheme).config,
      diff: true,
    } as any)

    map?.on('load', async () => {
      loadMapGroupCluster()

      setIsMapLoaded(true)

      if (mapType === 'default') {
        startDrawBuilding()
      }

      map.addControl(new mapboxgl.NavigationControl())

      zoomToFirstDevice()

      map.on('move', () => {
        updateClusters()
      })

      map.on('zoom', () => {
        const zoomLevel = map.getZoom()
        if (zoomLevel <= 10) {
          setDeviceSelected('')
          if (map.getSource('realtime-trip')) {
            map.removeLayer('realtime-trip')
            map.removeSource('realtime-trip')
          }
        }
        updateClusters()
      })
    })
  }

  const zoomToFirstDevice = () => {
    const firstDevice = devices[Object.keys(devices)[1]]

    const map = mapInstanceGlobal.getMapInstance()

    map?.flyTo({
      center: firstDevice.latestLocation as [number, number],
      zoom: 16,
      pitch: 45,
    })
  }

  const renderDevices = () => {
    const deviceIds = Object.keys(devices)

    if (!deviceIds.length || !isMapLoaded) return

    return deviceIds.map((deviceId) => (
      <Device key={deviceId} deviceId={deviceId} />
    ))
  }

  return (
    <>
      <div
        ref={mapContainerRef}
        className="w-full h-full absolute inset-0"
        id="map-container"
      />

      {renderDevices()}
    </>
  )
}
