'use client'

import { useDeviceStore } from '@/stores/device-store'
import { getMapStyle, MapType } from '@/utils/map'
import { FleetTrackingMap } from '@/utils/fleet-tracking-map/map-instance'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { ModelType } from './model-type'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { SelectMapType } from './select-map-type'
import { MapControl } from './map-control'
import { useZoomStrategies } from '@/hooks/templates/useZoomStrategies'
import { useMapBuilding } from '@/hooks/templates/useMapBuilding'
import { MapCluster } from './map-cluster'
import { DeviceLayers } from './device-layers'
import { TestDevice } from './test-device'

const fleetTrackingMap = FleetTrackingMap.getInstance()
export default function FleetTracking() {
  const { resolvedTheme } = useTheme()
  const fleetTrackingMapRef = useRef<HTMLDivElement>(null)
  const isFirstHandleZoom = useRef(true)

  //stores
  const { devices, devicesIds } = useDeviceStore(
    useShallow((state) => ({
      devices: state.devices,
      devicesIds: Object.keys(state.devices),
    }))
  )
  const { initializedSuccess } = useDeviceStore(
    useShallow((state) => ({
      initializedSuccess: state.initializedSuccess,
    }))
  )

  const { zoomToSingleDevice, zoomToFitDevices } = useZoomStrategies()
  const { applyMapBuilding, removeMapBuilding } = useMapBuilding()

  const { mapType } = useFleetTrackingStore(
    useShallow((state) => ({
      mapType: state.mapType,
    }))
  )

  const resolvedMapType = useMemo(() => {
    return (
      (localStorage.getItem('fleet-tracking:mapType') as MapType) || 'default'
    )
  }, [])

  const resolvedModelType = useMemo(() => {
    return (
      (localStorage.getItem('fleet-tracking:modelType') as '2d' | '3d') || '2d'
    )
  }, [])

  useEffect(() => {
    if (!fleetTrackingMapRef.current || !initializedSuccess) return

    const { style, config } = getMapStyle(
      resolvedMapType,
      resolvedTheme as 'dark' | 'light'
    )

    if (!fleetTrackingMap.isInitialized) {
      console.log('init map')

      fleetTrackingMap.init(fleetTrackingMapRef.current, {
        style,
        config,
        center: [0, 0],
        zoom: 1,
        pitch: resolvedModelType === '3d' ? 90 : 0,
        antialias: true,
        preserveDrawingBuffer: true,
      })
    }
    const handleStyleLoad = (map: mapboxgl.Map) => {
      if (resolvedMapType === 'default') {
        applyMapBuilding(map)
      }
    }

    const map = fleetTrackingMap?.getMap()

    let resizeTimeout: NodeJS.Timeout | null = null

    const resizeObserver = new ResizeObserver(() => {
      if (resizeTimeout) clearTimeout(resizeTimeout)
      if (map?.getContainer()?.style) {
        map.getContainer().style.animationDuration = '0.5s'
        map.getContainer().style.opacity = '0.5'
        map.getContainer().style.filter = 'blur(10px)'
        map.getContainer().style.zIndex = '100'
      }

      resizeTimeout = setTimeout(() => {
        fleetTrackingMap.resize()

        if (map?.getContainer()?.style) {
          map.getContainer().style.animationDuration = '0.5s'
          map.getContainer().style.opacity = '1'
          map.getContainer().style.filter = 'blur(0px)'
          map.getContainer().style.zIndex = '0'
        }
      }, 200)
    })

    resizeObserver.observe(fleetTrackingMapRef.current)

    fleetTrackingMap.on('style.load', handleStyleLoad)

    return () => {
      fleetTrackingMap.off('style.load', handleStyleLoad)
      resizeObserver.disconnect()
      if (resizeTimeout) clearTimeout(resizeTimeout)

      fleetTrackingMap.remove()
    }
  }, [initializedSuccess])

  useEffect(() => {
    if (!fleetTrackingMap.isInitialized) return

    const handleStyleLoad = (map: mapboxgl.Map) => {
      if (!map) return

      if (mapType === 'default') {
        applyMapBuilding(map)
      } else {
        removeMapBuilding(map)
      }
    }

    const { style, config } = getMapStyle(
      mapType || 'default',
      resolvedTheme as 'dark' | 'light'
    )

    fleetTrackingMap.updateStyle(style, config)
    fleetTrackingMap.on('style.load', handleStyleLoad)

    return () => {
      fleetTrackingMap.off('style.load', handleStyleLoad)
    }
  }, [mapType, resolvedTheme])

  useEffect(() => {
    console.log({ devices })
    if (!isFirstHandleZoom.current) return

    const handleStrategyZoom = (map: mapboxgl.Map) => {
      if (!map) return

      isFirstHandleZoom.current = false

      if (devicesIds.length > 1) {
        zoomToFitDevices(devices, map)
      }

      if (devicesIds.length === 1) {
        zoomToSingleDevice(Object.values(devices)[0], map)
      }
    }

    fleetTrackingMap.on('load', handleStrategyZoom)

    return () => {
      fleetTrackingMap.off('load', handleStrategyZoom)
    }
  }, [devices])

  return (
    <div
      className="size-full overflow-hidden relative bg-transparent z-[1]"
      ref={fleetTrackingMapRef}
    >
      <ModelType />
      <SelectMapType />
      <MapControl />
      <MapCluster />
      <DeviceLayers />
      <TestDevice />
    </div>
  )
}
