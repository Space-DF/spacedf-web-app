'use client'

import SpacedfLogo from '@/components/common/spacedf-logo'
import { DEVICE_FEATURE_SUPPORTED } from '@/constants/device-property'
import { useMapBuilding } from '@/hooks/templates/useMapBuilding'
import { useZoomStrategies } from '@/hooks/templates/useZoomStrategies'
import { useGlobalStore } from '@/stores'
import { Device, useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { FleetTrackingMap } from '@/utils/fleet-tracking-map/map-instance'
import { getMapStyle, groupDeviceByFeature, MapType } from '@/utils/map'
import { useTheme } from 'next-themes'
import { useEffect, useMemo, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { MultiTrackerLayer, WaterLevelLayer } from './device-layer'
import { MapCluster } from './map-cluster'
import { MapControl } from './map-control'
import { ModelType } from './model-type'
import { SelectMapType } from './select-map-type'
import { GlobalOverlayInstance } from '@/utils/fleet-tracking-map/layer-instance/global-overlay-instance'
import { MarkerInstance } from '@/utils/fleet-tracking-map/layer-instance/marker-instance'
import useSWR from 'swr'
import { fetcher } from '@/utils'

const fleetTrackingMap = FleetTrackingMap.getInstance()
const globalOverlayInstance = GlobalOverlayInstance.getInstance()
const markerInstance = MarkerInstance.getInstance()
export default function FleetTracking() {
  const { resolvedTheme } = useTheme()
  const fleetTrackingMapRef = useRef<HTMLDivElement>(null)
  const isFirstHandleZoom = useRef(true)

  const isGlobalLoading = useGlobalStore((state) => state.isGlobalLoading)

  const { updateBooleanState, isMapReady } = useFleetTrackingStore(
    useShallow((state) => ({
      updateBooleanState: state.updateBooleanState,
      isMapReady: state.isMapReady,
    }))
  )

  //stores
  const devices = useDeviceStore(
    useShallow((state) => state.devicesFleetTracking)
  )
  const initializedSuccess = useDeviceStore((state) => state.initializedSuccess)

  const { zoomToSingleDevice, zoomToFitDevices } = useZoomStrategies()
  const { applyMapBuilding, removeMapBuilding } = useMapBuilding()
  const { data: mapboxToken } = useSWR<{ mapbox_token: string }>(
    '/api/mapbox-token',
    fetcher
  )
  const mapType = useFleetTrackingStore((state) => state.mapType)

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
    fleetTrackingMap.setDevices(devices)
  }, [devices])

  useEffect(() => {
    if (
      !fleetTrackingMapRef.current ||
      !initializedSuccess ||
      !mapboxToken?.mapbox_token
    )
      return

    const { style, config } = getMapStyle(
      resolvedMapType,
      resolvedTheme as 'dark' | 'light'
    )

    if (!fleetTrackingMap.isInitialized) {
      fleetTrackingMap.init(
        fleetTrackingMapRef.current,
        {
          style,
          config,
          center: [0, 0],
          zoom: 1,
          pitch: resolvedModelType === '3d' ? 45 : 0,
          antialias: true,
          preserveDrawingBuffer: true,
        },
        mapboxToken.mapbox_token
      )
    }

    if (fleetTrackingMap.isInitialized && !isGlobalLoading) {
      fleetTrackingMap.setContainer(fleetTrackingMapRef.current)
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

    updateBooleanState('isMapReady', true)

    fleetTrackingMap.on('style.load', handleStyleLoad)

    return () => {
      fleetTrackingMap.off('style.load', handleStyleLoad)
      resizeObserver.disconnect()
      if (resizeTimeout) clearTimeout(resizeTimeout)

      // fleetTrackingMap.remove()
      // window.location.reload()
    }
  }, [initializedSuccess, isGlobalLoading, mapboxToken])

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
    if (!isFirstHandleZoom.current || !isMapReady) return

    const handleStrategyZoom = (
      map: mapboxgl.Map,
      devices: Record<string, Device>
    ) => {
      if (!map || !Object.keys(devices).length) return

      isFirstHandleZoom.current = false

      if (Object.keys(devices).length > 1) {
        zoomToFitDevices(devices, map)
      }

      if (Object.keys(devices).length === 1) {
        zoomToSingleDevice(Object.values(devices)[0], map)
      }
    }

    fleetTrackingMap.on('load', (map: mapboxgl.Map) => {
      const devices = fleetTrackingMap.getDevices()
      handleStrategyZoom(map, devices)
    })

    fleetTrackingMap.on('reattach', (map: mapboxgl.Map) => {
      isFirstHandleZoom.current = true
      globalOverlayInstance.destroy()
      markerInstance.remove()
      const devices = fleetTrackingMap.getDevices()
      handleStrategyZoom(map, devices)
    })

    return () => {
      fleetTrackingMap.off('reattach', (map: mapboxgl.Map) => {
        isFirstHandleZoom.current = true
        const devices = fleetTrackingMap.getDevices()
        handleStrategyZoom(map, devices)
      })

      fleetTrackingMap.off('load', (map: mapboxgl.Map) => {
        const devices = fleetTrackingMap.getDevices()
        handleStrategyZoom(map, devices)
      })
    }
  }, [devices, isMapReady])

  const groupedDevices = useMemo(() => {
    return groupDeviceByFeature(Object.values(devices))
  }, [devices])

  const hasTrackerDevices =
    !!groupedDevices[DEVICE_FEATURE_SUPPORTED.LOCATION]?.length
  const hasWaterLevelDevices =
    !!groupedDevices[DEVICE_FEATURE_SUPPORTED.WATER_DEPTH]?.length

  return (
    <div
      className="size-full overflow-hidden relative bg-transparent z-[1]"
      ref={fleetTrackingMapRef}
    >
      <SpacedfLogo />
      <ModelType />
      <SelectMapType />
      <MapControl />
      <MapCluster />

      {hasTrackerDevices && <MultiTrackerLayer />}
      {hasWaterLevelDevices && <WaterLevelLayer />}
    </div>
  )
}
