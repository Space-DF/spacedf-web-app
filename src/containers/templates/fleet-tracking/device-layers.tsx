'use client'

import { usePrevious } from '@/hooks/usePrevious'
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
  const { devices, deviceModels, setDeviceSelected, deviceSelected } =
    useDeviceStore(
      useShallow((state) => ({
        devices: state.devices,
        deviceModels: state.models,
        deviceSelected: state.deviceSelected,
        setDeviceSelected: state.setDeviceSelected,
      }))
    )

  const { isClusterVisible, modelType } = useFleetTrackingStore(
    useShallow((state) => ({
      isClusterVisible: state.isClusterVisible,
      modelType:
        state.modelType ||
        (localStorage.getItem('fleet-tracking:modelType') as '2d' | '3d') ||
        '2d',
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
  }, [devices])

  useEffect(() => {
    handleLayerType()
  }, [devices, isClusterVisible, modelType])

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
        map.flyTo({
          center: devices[deviceSelected].latestLocation,
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
      modelType !== prevModelType ||
      isClusterVisible !== prevIsClusterVisible
    ) {
      setDeviceSelected('')
    }
  }, [modelType, isClusterVisible, prevIsClusterVisible, prevModelType])

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
