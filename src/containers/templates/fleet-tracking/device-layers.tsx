'use client'

import { usePrevious } from '@/hooks/usePrevious'
import { useDeviceHistory } from '@/hooks/useDeviceHistory'
import { useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { DeckGLInstance } from '@/utils/fleet-tracking-map/deckgl-instance'
import { FleetTrackingMap } from '@/utils/fleet-tracking-map/map-instance'
import { MarkerInstance } from '@/utils/fleet-tracking-map/marker-instance'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

const markerInstance = MarkerInstance.getInstance()
const fleetTrackingMap = FleetTrackingMap.getInstance()
const deckglInstance = DeckGLInstance.getInstance()
export const DeviceLayers = () => {
  const {
    devices,
    deviceModels,
    setDeviceSelected,
    deviceSelected,
    deviceHistory,
  } = useDeviceStore(
    useShallow((state) => ({
      devices: state.devicesFleetTracking,
      deviceModels: state.models,
      deviceSelected: state.deviceSelected,
      setDeviceSelected: state.setDeviceSelected,
      deviceHistory: state.deviceHistory,
    }))
  )

  const { startDrawHistory } = useDeviceHistory()

  const { isClusterVisible, modelType, isAlreadyShowTripRoute } =
    useFleetTrackingStore(
      useShallow((state) => ({
        isClusterVisible: state.isClusterVisible,
        modelType:
          state.modelType ||
          (localStorage.getItem('fleet-tracking:modelType') as '2d' | '3d') ||
          '2d',
        isAlreadyShowTripRoute: state.isAlreadyShowTripRoute,
      }))
    )

  const prevDeviceSelected = usePrevious(deviceSelected)
  const prevModelType = usePrevious(modelType)
  const prevIsClusterVisible = usePrevious(isClusterVisible)

  useEffect(() => {
    const handleMapLoaded = (map: mapboxgl.Map) => {
      markerInstance.init(map)
      deckglInstance.init(map, deviceModels)
    }

    fleetTrackingMap.on('style.load', handleMapLoaded)

    return () => {
      fleetTrackingMap.off('style.load', handleMapLoaded)
    }
  }, [devices, deviceModels])

  useEffect(() => {
    if (isAlreadyShowTripRoute) return
    handleLayerType()
  }, [devices, isClusterVisible, modelType, isAlreadyShowTripRoute])

  useEffect(() => {
    const handleDeviceSelected = (object: any) => {
      let deviceId = ''

      if (typeof object === 'string') {
        deviceId = object
      } else {
        deviceId = object?.id ?? ''
      }

      setDeviceSelected(deviceId)
    }

    deckglInstance.on('layer-click', handleDeviceSelected)
    markerInstance.on('marker-click', handleDeviceSelected)

    return () => {
      deckglInstance.off('layer-click', handleDeviceSelected)
      markerInstance.off('marker-click', handleDeviceSelected)
    }
  }, [])

  useEffect(() => {
    if (deviceSelected === prevDeviceSelected) return

    if (!deviceSelected) {
      deckglInstance.stopDeviceRotationAnimation()
      markerInstance.clearFocusMarker()
    } else {
      const map = fleetTrackingMap.getMap()

      if (map) {
        const device = devices[deviceSelected]

        if (!device) return

        if (!device.latestLocation?.every((loc) => loc)) return

        map.flyTo({
          center: device.latestLocation as [number, number],
          zoom: 18,
          duration: 500,
          essential: true,
          pitch: modelType === '3d' ? 90 : 0,
        })
      }

      if (modelType === '3d') {
        handleDeviceRotation()
      } else {
        markerInstance.focusMarker(deviceSelected)
      }
    }
  }, [deviceSelected, prevDeviceSelected, devices, modelType])

  useEffect(() => {
    if (
      !isAlreadyShowTripRoute &&
      (modelType !== prevModelType || isClusterVisible !== prevIsClusterVisible)
    ) {
      setDeviceSelected('')
    }
  }, [
    modelType,
    isClusterVisible,
    prevIsClusterVisible,
    prevModelType,
    isAlreadyShowTripRoute,
  ])

  // Handle device history redraw when modelType changes
  useEffect(() => {
    const map = fleetTrackingMap.getMap()
    if (!map || !deviceHistory?.length) return
    if (prevModelType && prevModelType !== modelType) {
      const controlIcon = (map?._controls as any).find(
        (control: any) => control._props?.id === 'device-histories'
      )

      if (controlIcon) {
        map?.removeControl(controlIcon)
        setTimeout(() => {
          startDrawHistory(deviceHistory)
        }, 100)
      }
    }
  }, [modelType, deviceHistory])

  const handleDeviceRotation = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    deckglInstance.deviceRotationAnimation(deviceSelected)
  }

  const handleLayerType = () => {
    switch (modelType) {
      case '2d':
        if (deckglInstance.checkLayerAvailable()) {
          deckglInstance.syncLayers(devices, 'hidden')
        }

        if (isClusterVisible) {
          markerInstance.hideAllMarkers()
        } else {
          markerInstance.syncDevices(devices)
          markerInstance.displayAllMarkers()
        }

        break
      case '3d':
        markerInstance.hideAllMarkers()
        if (isClusterVisible) {
          deckglInstance.syncLayers(devices, 'hidden')
        } else {
          deckglInstance.syncLayers(devices, 'visible')
        }
        break
    }
  }

  return null
}
