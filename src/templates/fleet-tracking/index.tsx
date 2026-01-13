'use client'

import { DEVICE_FEATURE_SUPPORTED } from '@/constants/device-property'
import { useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingMapStore } from '@/stores/template/fleet-tracking-map'
import { groupDeviceByFeature } from '@/utils/map'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { LocationLayer } from './components/device-layer/location'
import { ViewModeToggle } from './components/view-mode-toggle'
import { MAP_PITCH } from './constant'
import BuildingInstance from './core/building-instance'
import ClusterInstance from './core/cluster-instance'
import MapInstance from './core/map-instance'
import { GlobalDeckGLInstance } from './core/global-layer-instance'
import ControlDataTest from './components/control-data-test'

const mapInstance = MapInstance.getInstance()
const clusterInstance = ClusterInstance.getInstance()
const buildingInstance = BuildingInstance.getInstance()
const globalDeckGLInstance = GlobalDeckGLInstance.getInstance()

export default function FleetTrackingMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const isFirstRun = useRef(true)

  const mapReadyRef = useRef(false)
  const dataReadyRef = useRef(false)

  const {
    initializedSuccess,
    devices,
    locationDevices,
    deviceSelected,
    setDeviceSelected,
  } = useDeviceStore(
    useShallow((state) => {
      const deviceGroup = groupDeviceByFeature(
        Object.values(state.devicesFleetTracking)
      )

      return {
        initializedSuccess: state.initializedSuccess,
        devices: state.devicesFleetTracking,
        locationDevices: deviceGroup[DEVICE_FEATURE_SUPPORTED.LOCATION],
        waterLevelDevices: deviceGroup[DEVICE_FEATURE_SUPPORTED.WATER_DEPTH],
        deviceSelected: state.deviceSelected,
        setDeviceSelected: state.setDeviceSelected,
      }
    })
  )

  const { updateBooleanState, isMapReady, viewMode, isClusterVisible } =
    useFleetTrackingMapStore(
      useShallow((state) => ({
        updateBooleanState: state.updateBooleanState,
        isMapReady: state.isMapReady,
        viewMode: state.viewMode,
        isClusterVisible: state.isClusterVisible,
      }))
    )

  const handleDataReady = useCallback(() => {
    if (!mapReadyRef.current || !dataReadyRef.current) return

    if (isFirstRun.current) {
      const resolvedModelType: '2d' | '3d' = localStorage.getItem(
        'fleet-tracking:modelType'
      ) as '2d' | '3d'

      const pitch = MAP_PITCH[resolvedModelType]

      mapInstance.onStrategyZoom(devices, pitch)

      if (mapInstance.getMap()) {
        globalDeckGLInstance.init(mapInstance.getMap()!)
      }

      updateBooleanState('isMapReady', true)
      isFirstRun.current = false
    }
  }, [devices])

  const handleVisibilityChange = useCallback(
    (isVisible: boolean) => {
      updateBooleanState('isClusterVisible', isVisible)
    },
    [updateBooleanState]
  )

  useEffect(() => {
    if (containerRef.current && !mapInstance.getMap()) {
      mapInstance.init({
        container: containerRef.current,
        theme: resolvedTheme as 'dark' | 'light',
      })
    }

    if (containerRef.current && mapInstance.getMap()) {
      mapInstance.setContainer(containerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!initializedSuccess) return

    dataReadyRef.current = true
    handleDataReady()
  }, [initializedSuccess, handleDataReady])

  useEffect(() => {
    const onMapReady = () => {
      mapReadyRef.current = true
      handleDataReady()
    }

    mapInstance.on('ready', onMapReady)

    return () => {
      mapInstance.off('ready', onMapReady)
    }
  }, [handleDataReady])

  useEffect(() => {
    mapInstance.updateTheme(resolvedTheme as 'dark' | 'light')
    clusterInstance.syncTheme(resolvedTheme as 'dark' | 'light')

    if (isMapReady) {
      requestAnimationFrame(() => {
        clusterInstance.updateClusterData()
        buildingInstance.createBuildingLayer(resolvedTheme as 'dark' | 'light')
      })
    }
  }, [resolvedTheme, isMapReady])

  useEffect(() => {
    if (isMapReady) {
      const map = mapInstance.getMap()

      if (!map) return

      clusterInstance.init(map)
      buildingInstance.init(map, resolvedTheme as 'dark' | 'light')
    }

    return () => {
      clusterInstance.removeClusterLayer()
      buildingInstance.removeBuildingLayer()
      globalDeckGLInstance.destroyGlobalDeckGLLayer()
    }
  }, [isMapReady])

  useEffect(() => {
    if (devices && isMapReady) {
      clusterInstance.syncClusterData(devices)
    }
  }, [devices, isMapReady])

  useEffect(() => {
    clusterInstance.on('visible-change', handleVisibilityChange)

    return () => {
      clusterInstance.off('visible-change', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    if (isFirstRun.current) return

    const pitch = MAP_PITCH[viewMode]

    mapInstance.updateMapPitch({ pitch })
  }, [viewMode])

  useEffect(() => {
    if (isClusterVisible && deviceSelected) {
      setDeviceSelected('')
    }

    // mapInstance.deviceFocus(deviceSelected)
  }, [isClusterVisible, deviceSelected])

  return (
    <div
      className="size-full overflow-hidden relative bg-transparent z-[1]"
      ref={containerRef}
    >
      <ViewModeToggle />
      <LocationLayer devices={locationDevices || []} />
      <ControlDataTest />
    </div>
  )
}
