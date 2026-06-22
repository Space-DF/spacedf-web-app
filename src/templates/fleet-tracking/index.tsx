'use client'

import { MapControls } from '@/components/common/map-controls'
import { DEVICE_FEATURE_SUPPORTED } from '@/constants/device-property'
import { useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingMapStore } from '@/stores/template/fleet-tracking-map'
import { groupDeviceByFeature } from '@/utils/map'
import isEqual from 'fast-deep-equal'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useTheme } from 'next-themes'
import { AnimatePresence, motion } from 'framer-motion'
import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { LocationLayer } from './components/device-layer/location'
import WaterDepth from './components/device-layer/water-depth'
import { ViewModeToggle } from './components/view-mode-toggle'
import { MAP_PITCH } from './constant'
import BuildingInstance from './core/building-instance'
import ClusterInstance, { CLUSTER_EVENTS } from './core/cluster-instance'
import { GlobalDeckGLInstance } from './core/global-layer-instance'
import MapInstance from './core/map-instance'
import GeofenceControls from '@/components/common/geofence-controls'
import { SearchLocation } from '@/components/common/search-location'
import SpacedfLogo from '@/components/common/spacedf-logo'
import { useGeofenceStore } from '@/stores/geofence-store'
import { useMapResize } from './hooks/useMapResize'
import { GeofenceProvider } from '@/components/providers/geofence-provider'
import { FleetTrackingProvider } from '@/components/providers/device-provider/components/fleet-tracking-provider'

const mapInstance = MapInstance.getInstance()
const clusterInstance = ClusterInstance.getInstance()
const buildingInstance = BuildingInstance.getInstance()
const globalDeckGLInstance = GlobalDeckGLInstance.getInstance()

export default function FleetTrackingMap() {
  const { resolvedTheme } = useTheme()
  const isFirstRun = useRef(true)
  const isShowGeofenceControls = useGeofenceStore(
    (state) => state.isShowGeofenceControls
  )
  const mapReadyRef = useRef(false)
  const dataReadyRef = useRef(false)

  const initializedSuccess = useDeviceStore((state) => state.initializedSuccess)

  const { updateBooleanState, isMapReady, viewMode, setUngroupedDeviceIds } =
    useFleetTrackingMapStore(
      useShallow((state) => ({
        updateBooleanState: state.updateBooleanState,
        setUngroupedDeviceIds: state.setUngroupedDeviceIds,
        isMapReady: state.isMapReady,
        viewMode: state.viewMode,
      }))
    )

  const { wrapperRef, mapContainerRef } = useMapResize(isMapReady)

  const handleDataReady = useCallback(() => {
    if (
      !mapReadyRef.current ||
      !dataReadyRef.current ||
      !useDeviceStore.getState().initializedSuccess ||
      !isFirstRun.current
    )
      return

    mapInstance.onStrategyZoom(useDeviceStore.getState().devicesFleetTracking)

    const map = mapInstance.getMap()
    if (map) {
      globalDeckGLInstance.init(map)
    }

    if (!useFleetTrackingMapStore.getState().isMapReady) {
      updateBooleanState('isMapReady', true)
    }
    isFirstRun.current = false
  }, [updateBooleanState])

  useEffect(() => {
    if (mapContainerRef.current) {
      mapInstance.init({
        container: mapContainerRef.current,
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
    clusterInstance.syncTheme(resolvedTheme as 'dark' | 'light')

    mapInstance.updateTheme(resolvedTheme as 'dark' | 'light', () => {
      clusterInstance.createClusterLayer()
      buildingInstance.createBuildingLayer(resolvedTheme as 'dark' | 'light')
    })
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

  const handleVisibilityChange = useCallback(
    (isVisible: boolean) => {
      updateBooleanState('isClusterVisible', isVisible)
    },
    [updateBooleanState]
  )

  const handleUngroupedDeviceChanges = useCallback(
    (deviceIds: string[]) => {
      const current = useFleetTrackingMapStore.getState().ungroupedDeviceIds
      if (isEqual(current, deviceIds)) return

      setUngroupedDeviceIds(deviceIds)
    },
    [setUngroupedDeviceIds]
  )

  useEffect(() => {
    clusterInstance.on(CLUSTER_EVENTS.VISIBLE_CHANGE, handleVisibilityChange)
    clusterInstance.on(
      CLUSTER_EVENTS.UNGROUPED_CLUSTER_IDS,
      handleUngroupedDeviceChanges
    )

    return () => {
      clusterInstance.off(CLUSTER_EVENTS.VISIBLE_CHANGE, handleVisibilityChange)
      clusterInstance.off(
        CLUSTER_EVENTS.UNGROUPED_CLUSTER_IDS,
        handleUngroupedDeviceChanges
      )
    }
  }, [handleVisibilityChange, handleUngroupedDeviceChanges])

  useEffect(() => {
    mapInstance.syncMapPitch(MAP_PITCH[viewMode])

    if (isFirstRun.current) return

    const pitch = MAP_PITCH[viewMode]

    mapInstance.updateMapPitch({ pitch })
  }, [viewMode])

  return (
    <FleetTrackingProvider>
      <GeofenceProvider>
        <div
          className="size-full overflow-hidden relative bg-transparent z-[1]"
          ref={wrapperRef}
        >
          <div className="absolute top-0 left-0 right-0 z-10 pl-3 pr-14 pt-3 pointer-events-none">
            <div className="flex items-start justify-between ">
              <SpacedfLogo />
              <div className="pointer-events-auto">
                <SearchLocation
                  map={isMapReady ? mapInstance.getMap() : null}
                />
              </div>
              <ViewModeToggle />
            </div>
          </div>

          <div
            ref={mapContainerRef}
            className="relative h-full will-change-transform"
          >
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

            {isMapReady && <DeviceLayers />}
          </div>
        </div>
      </GeofenceProvider>
    </FleetTrackingProvider>
  )
}

const DeviceLayers = memo(function DeviceLayers() {
  const devices = useDeviceStore((state) => state.devicesFleetTracking)

  const { locationDevices, waterLevelDevices } = useMemo(() => {
    const deviceGroup = groupDeviceByFeature(Object.values(devices))
    return {
      locationDevices: deviceGroup[DEVICE_FEATURE_SUPPORTED.LOCATION] || [],
      waterLevelDevices:
        deviceGroup[DEVICE_FEATURE_SUPPORTED.WATER_DEPTH] || [],
    }
  }, [devices])

  useEffect(() => {
    if (devices) {
      clusterInstance.syncClusterData(devices)
    }
  }, [devices])

  return (
    <>
      {!!locationDevices.length && <LocationLayer devices={locationDevices} />}
      {!!waterLevelDevices.length && <WaterDepth devices={waterLevelDevices} />}
    </>
  )
})
