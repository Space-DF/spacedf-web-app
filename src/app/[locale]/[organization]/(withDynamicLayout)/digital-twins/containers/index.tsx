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
import SpacedfLogo from '@/components/common/spacedf-logo'

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

    // At low zooms, complete a revolution every two minutes.
    const secondsPerRevolution = 240
    // Above zoom level 5, do not rotate.
    const maxSpinZoom = 5
    // Rotate at intermediate speeds between zoom levels 3 and 5.
    const slowSpinZoom = 3

    let userInteracting = false
    const spinEnabled = true

    function spinGlobe() {
      const zoom = map?.getZoom()
      if (!zoom) return
      if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution
        if (zoom > slowSpinZoom) {
          // Slow spinning at higher zooms
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom)
          distancePerSecond *= zoomDif
        }
        const center = map?.getCenter()
        if (!center) return
        center.lng -= distancePerSecond
        // Smoothly animate the map over one second.
        // When this animation is complete, it calls a 'moveend' event.
        map?.easeTo({ center, duration: 1000, easing: (n) => n })
      }
    }

    // Pause spinning on interaction
    map?.on('mousedown', () => {
      userInteracting = true
    })
    map?.on('dragstart', () => {
      userInteracting = true
    })

    // When animation is complete, start spinning if there is no ongoing interaction
    map?.on('moveend', () => {
      spinGlobe()
    })

    spinGlobe()

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
      <SpacedfLogo />
      <div
        ref={mapContainerRef}
        className="w-full h-full absolute inset-0"
        id="map-container"
      />

      {renderDevices()}
    </>
  )
}
