'use client'

import { Device, useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingMapStore } from '@/stores/template/fleet-tracking-map'
import isEqual from 'fast-deep-equal'
import { memo, useCallback, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { LocationDeckGLInstance } from '../../core/location/deckgl-instance'
import { LocationMarker } from '../../core/location/marker-instance'
import MapInstance from '../../core/map-instance'
import { useTheme } from 'next-themes'

const shouldUpdate = (
  prevProps: LocationLayerProps,
  nextProps: LocationLayerProps
) => {
  return isEqual(prevProps.devices, nextProps.devices)
}

type LocationLayerProps = {
  devices: Device[]
}

type HandleDeviceSelectedProps = {
  deviceId: string
  viewMode: '2d' | '3d'
}

const markerInstance = LocationMarker.getInstance()
const deckGLInstance = LocationDeckGLInstance.getInstance()
const mapInstance = MapInstance.getInstance()

export const LocationLayer = memo(
  ({ devices }: LocationLayerProps) => {
    const { resolvedTheme } = useTheme()
    const resourceStatus = useRef({
      marker: false,
      deckLayer: false,
    })

    const { isMapReady, isClusterVisible, viewMode, isAlreadyShowTripRoute } =
      useFleetTrackingMapStore(
        useShallow((state) => ({
          isMapReady: state.isMapReady,
          isClusterVisible: state.isClusterVisible,
          viewMode: state.viewMode,
          isAlreadyShowTripRoute: state.isAlreadyShowTripRoute,
        }))
      )

    const { setDeviceSelected, deviceSelected } = useDeviceStore(
      useShallow((state) => ({
        setDeviceSelected: state.setDeviceSelected,
        deviceSelected: state.deviceSelected,
      }))
    )

    useEffect(() => {
      resourceStatus.current.marker = false
      resourceStatus.current.deckLayer = false

      return () => {
        markerInstance.destroyLocationMarkers()
      }
    }, [])

    useEffect(() => {
      if (!isMapReady) return
      const map = mapInstance.getMap()
      if (!map || isAlreadyShowTripRoute) return

      if (viewMode === '2d' && !resourceStatus.current.marker) {
        markerInstance.init(map)
        resourceStatus.current.marker = true
      }

      if (viewMode === '3d' && !resourceStatus.current.deckLayer) {
        deckGLInstance.init(map)
        resourceStatus.current.deckLayer = true
      }

      if (isClusterVisible) {
        handleLocationResource('hidden', viewMode, devices)
      } else {
        handleLocationResource('visible', viewMode, devices)
      }
    }, [
      viewMode,
      isMapReady,
      isClusterVisible,
      devices,
      isAlreadyShowTripRoute,
    ])

    useEffect(() => {
      if (!isMapReady) return

      const handleLocationDeviceSelected = (data: any) => {
        const { deviceId } = data

        if (deviceSelected === deviceId) return

        setDeviceSelected(deviceId)
      }

      markerInstance.on(
        'location-device-selected',
        handleLocationDeviceSelected
      )

      deckGLInstance.on(
        'location-device-selected',
        handleLocationDeviceSelected
      )

      return () => {
        markerInstance.off(
          'location-device-selected',
          handleLocationDeviceSelected
        )
        deckGLInstance.off(
          'location-device-selected',
          handleLocationDeviceSelected
        )
      }
    }, [isMapReady, isAlreadyShowTripRoute])

    useEffect(() => {
      if (isMapReady) {
        requestAnimationFrame(() => {
          deckGLInstance.syncTheme(resolvedTheme as 'dark' | 'light')
        })
      }
    }, [resolvedTheme, isMapReady])

    const handleDeviceSelected = useCallback(
      async (data: HandleDeviceSelectedProps) => {
        const { deviceId, viewMode } = data

        const device = devices.find((device) => device.id === deviceId)

        await new Promise((resolve) => setTimeout(resolve, 300))

        if (device) {
          mapInstance.onZoomToDevice(device)
        }
        if (viewMode === '2d') {
          markerInstance.focusMarker(deviceId)
        }

        if (viewMode === '3d') {
          deckGLInstance.focusDevice(deviceId)
        }
      },
      [deviceSelected, devices]
    )

    useEffect(() => {
      if (!isMapReady || isAlreadyShowTripRoute) return
      handleDeviceSelected({ deviceId: deviceSelected, viewMode })
    }, [isMapReady, deviceSelected, viewMode, isAlreadyShowTripRoute])

    const handleLocationResource = (
      type: 'visible' | 'hidden',
      viewMode: '2d' | '3d',
      devices: Device[]
    ) => {
      if (viewMode === '2d') {
        deckGLInstance.syncDevices(devices, 'hidden')
        markerInstance.syncDevices(devices, type)
      }

      if (viewMode === '3d') {
        markerInstance.syncDevices(devices, 'hidden')
        deckGLInstance.syncDevices(devices, type)
      }
    }

    return null
  },
  (prevProps, nextProps) => {
    return shouldUpdate(prevProps, nextProps)
  }
)

LocationLayer.displayName = 'LocationLayer'
