'use client'

import { MapControls } from '@/components/common/map-controls'
import { DEVICE_FEATURE_SUPPORTED } from '@/constants/device-property'
import { useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingMapStore } from '@/stores/template/fleet-tracking-map'
import { groupDeviceByFeature } from '@/utils/map'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useTheme } from 'next-themes'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { LocationLayer } from './components/device-layer/location'
import WaterDepth from './components/device-layer/water-depth'
import { ViewModeToggle } from './components/view-mode-toggle'
import { MAP_PITCH } from './constant'
import BuildingInstance from './core/building-instance'
import ClusterInstance from './core/cluster-instance'
import { GlobalDeckGLInstance } from './core/global-layer-instance'
import MapInstance from './core/map-instance'
import GeofenceControls from '@/components/common/geofence-controls'
import { SearchLocation } from '@/components/common/search-location'
import SpacedfLogo from '@/components/common/spacedf-logo'
import { useGeofenceStore } from '@/stores/geofence-store'

const mapInstance = MapInstance.getInstance()
const clusterInstance = ClusterInstance.getInstance()
const buildingInstance = BuildingInstance.getInstance()
const globalDeckGLInstance = GlobalDeckGLInstance.getInstance()

export default function FleetTrackingMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const isFirstRun = useRef(true)
  const isShowGeofenceControls = useGeofenceStore(
    (state) => state.isShowGeofenceControls
  )
  const mapReadyRef = useRef(false)
  const dataReadyRef = useRef(false)

  const {
    initializedSuccess,
    devices,
    locationDevices = [],
    waterLevelDevices = [],
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

  const {
    updateBooleanState,
    isMapReady,
    viewMode,
    isClusterVisible,
    isAlreadyShowTripRoute,
  } = useFleetTrackingMapStore(
    useShallow((state) => ({
      updateBooleanState: state.updateBooleanState,
      isMapReady: state.isMapReady,
      viewMode: state.viewMode,
      isAlreadyShowTripRoute: state.isAlreadyShowTripRoute,
      isClusterVisible: state.isClusterVisible,
    }))
  )

  const handleDataReady = useCallback(() => {
    if (!mapReadyRef.current || !dataReadyRef.current || !initializedSuccess)
      return

    if (isFirstRun.current) {
      // const pitch = MAP_PITCH[resolvedModelType]

      mapInstance.onStrategyZoom(devices)

      if (mapInstance.getMap()) {
        globalDeckGLInstance.init(mapInstance.getMap()!)
      }

      if (!isMapReady) {
        updateBooleanState('isMapReady', true)
      }
      isFirstRun.current = false
    }
  }, [devices, initializedSuccess])

  useEffect(() => {
    if (containerRef.current) {
      mapInstance.init({
        container: containerRef.current,
        theme: resolvedTheme as 'dark' | 'light',
      })
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
    mapInstance.syncMapPitch(MAP_PITCH[viewMode])

    if (isFirstRun.current) return

    const pitch = MAP_PITCH[viewMode]

    mapInstance.updateMapPitch({ pitch })
  }, [viewMode])

  useEffect(() => {
    if (
      isClusterVisible &&
      deviceSelected &&
      !isAlreadyShowTripRoute &&
      !mapInstance.getIsMapFlying()
    ) {
      setDeviceSelected('')
    }
  }, [isClusterVisible, deviceSelected, isAlreadyShowTripRoute])

  const handleVisibilityChange = useCallback(
    (isVisible: boolean) => {
      updateBooleanState('isClusterVisible', isVisible)
    },
    [updateBooleanState]
  )

  return (
    <div
      className="size-full overflow-hidden relative bg-transparent z-[1]"
      ref={containerRef}
    >
      <SpacedfLogo />
      <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2">
        <SearchLocation map={isMapReady ? mapInstance.getMap() : null} />
      </div>
      <ViewModeToggle />
      {isMapReady && <MapControls map={mapInstance.getMap()!} />}
      <AnimatePresence>
        {isShowGeofenceControls && (
          <motion.div
            key="geofence-controls"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute top-56 right-3 z-10"
          >
            <GeofenceControls />
          </motion.div>
        )}
      </AnimatePresence>

      {!!locationDevices.length && (
        <LocationLayer devices={locationDevices || []} />
      )}
      {!!waterLevelDevices.length && (
        <WaterDepth devices={waterLevelDevices || []} />
      )}
    </div>
  )
}
