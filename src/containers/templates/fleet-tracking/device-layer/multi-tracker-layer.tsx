'use client'

import { DEVICE_FEATURE_SUPPORTED } from '@/constants/device-property'
import { useDeviceHistory } from '@/hooks/useDeviceHistory'
import { usePrevious } from '@/hooks/usePrevious'
import { useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { GlobalOverlayInstance } from '@/utils/fleet-tracking-map/layer-instance/global-overlay-instance'
import { MarkerInstance } from '@/utils/fleet-tracking-map/layer-instance/marker-instance'
import { MultiTrackerLayerInstance } from '@/utils/fleet-tracking-map/layer-instance/multi-tracker-instance'
import { FleetTrackingMap } from '@/utils/fleet-tracking-map/map-instance'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

const markerInstance = MarkerInstance.getInstance()
const fleetTrackingMap = FleetTrackingMap.getInstance()
const multiTrackerLayerInstance = MultiTrackerLayerInstance.getInstance()
const globalOverlayInstance = GlobalOverlayInstance.getInstance()

export const MultiTrackerLayer = () => {
  const devicesFleetTracking = useDeviceStore(
    useShallow((state) => {
      //handle normal devices
      const multiTrackerDevices = Object.fromEntries(
        Object.entries(state.devicesFleetTracking).filter(
          ([, device]) =>
            device.deviceInformation?.device_profile?.key_feature ===
            DEVICE_FEATURE_SUPPORTED.LOCATION
        )
      )

      return multiTrackerDevices
    })
  )
  const deviceModels = useDeviceStore(useShallow((state) => state.models))
  const deviceHistory = useDeviceStore(
    useShallow((state) => state.deviceHistory)
  )
  const devices = useDeviceStore(useShallow((state) => state.devices))
  const deviceSelected = useDeviceStore((state) => state.deviceSelected)
  const setDeviceSelected = useDeviceStore((state) => state.setDeviceSelected)

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
      const globalOverlay = globalOverlayInstance.init(map)
      markerInstance.init(map)
      if (globalOverlay) {
        multiTrackerLayerInstance.init(map, deviceModels, globalOverlay)
      }
    }

    fleetTrackingMap.on('style.load', handleMapLoaded)

    return () => {
      fleetTrackingMap.off('style.load', handleMapLoaded)
    }
  }, [devicesFleetTracking, deviceModels])

  useEffect(() => {
    if (isAlreadyShowTripRoute) return
    handleLayerType()
  }, [
    devicesFleetTracking,
    isClusterVisible,
    modelType,
    isAlreadyShowTripRoute,
  ])

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

    multiTrackerLayerInstance.on('layer-click', handleDeviceSelected)
    markerInstance.on('marker-click', handleDeviceSelected)

    return () => {
      multiTrackerLayerInstance.off('layer-click', handleDeviceSelected)
      markerInstance.off('marker-click', handleDeviceSelected)
    }
  }, [])

  useEffect(() => {
    if (deviceSelected === prevDeviceSelected) return

    if (deviceSelected && !!devicesFleetTracking?.[deviceSelected]) {
      const map = fleetTrackingMap.getMap()

      if (map) {
        const device = devicesFleetTracking[deviceSelected]

        if (!device) return

        if (
          !device.deviceProperties?.latest_checkpoint_arr?.every((loc) => loc)
        )
          return

        map.flyTo({
          center: device.deviceProperties?.latest_checkpoint_arr as [
            number,
            number,
          ],
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

      return
    }

    if (!deviceSelected || !devicesFleetTracking?.[deviceSelected]) {
      multiTrackerLayerInstance.stopDeviceRotationAnimation()
      markerInstance.clearFocusMarker()
    }
  }, [deviceSelected, prevDeviceSelected, devicesFleetTracking, modelType])

  useEffect(() => {
    if (!isAlreadyShowTripRoute && modelType !== prevModelType) {
      setDeviceSelected('')
    }
  }, [modelType, prevIsClusterVisible, prevModelType, isAlreadyShowTripRoute])

  useEffect(() => {
    const handleZoomEnd = () => {
      if (isClusterVisible) {
        setDeviceSelected('')
      }
    }

    fleetTrackingMap.on('zoomend', handleZoomEnd)
    return () => {
      fleetTrackingMap.off('zoomend', handleZoomEnd)
    }
  }, [isClusterVisible])

  useEffect(() => {
    if (deviceSelected && !devices[deviceSelected]) {
      setDeviceSelected('')
    }
  }, [devices, deviceSelected, setDeviceSelected])

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

  useEffect(() => {
    fleetTrackingMap.on('reattach', () => {
      markerInstance.syncDevices(devicesFleetTracking)
    })

    return () => {
      fleetTrackingMap.off('reattach', () => {
        markerInstance.syncDevices(devicesFleetTracking)
      })
    }
  }, [devicesFleetTracking])

  const handleDeviceRotation = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    multiTrackerLayerInstance.deviceRotationAnimation(deviceSelected)
  }

  const handleLayerType = () => {
    switch (modelType) {
      case '2d':
        if (multiTrackerLayerInstance.checkLayerAvailable()) {
          multiTrackerLayerInstance.syncLayers(devicesFleetTracking, 'hidden')
        }

        if (isClusterVisible) {
          markerInstance.hideAllMarkers()
        } else {
          markerInstance.syncDevices(devicesFleetTracking)
          markerInstance.displayAllMarkers()
        }

        break
      case '3d':
        markerInstance.hideAllMarkers()
        if (isClusterVisible) {
          multiTrackerLayerInstance.syncLayers(devicesFleetTracking, 'hidden')
        } else {
          multiTrackerLayerInstance.syncLayers(devicesFleetTracking, 'visible')
        }
        break
    }
  }

  return null
}
