'use client'

import { Device, useDeviceStore } from '@/stores/device-store'
import { memo, useCallback, useEffect, useRef } from 'react'
import isEqual from 'fast-deep-equal'
import { useFleetTrackingMapStore } from '@/stores/template/fleet-tracking-map'
import { useShallow } from 'zustand/react/shallow'
import MapInstance from '../../core/map-instance'
import { WaterDepthDeckInstance } from '../../core/water-depth/water-depth-deckgl-instance'
import { WaterDepthLegend } from '../water-depth-legend'

const shouldUpdate = (
  prevProps: WaterDepthLayerProps,
  nextProps: WaterDepthLayerProps
) => {
  return isEqual(prevProps.devices, nextProps.devices)
}

type WaterDepthLayerProps = {
  devices: Device[]
}

type HandleResourceFn = {
  type: 'hidden' | 'visible'
  devices: Device[]
}

const mapInstance = MapInstance.getInstance()
const waterLevelDeckInstance = WaterDepthDeckInstance.getInstance()

const WaterDepthLayer = ({ devices }: WaterDepthLayerProps) => {
  const resourceReady = useRef(false)

  const { isMapReady, isClusterVisible } = useFleetTrackingMapStore(
    useShallow((state) => ({
      isMapReady: state.isMapReady,
      isClusterVisible: state.isClusterVisible,
      viewMode: state.viewMode,
    }))
  )

  const { deviceSelected, setDeviceSelected } = useDeviceStore(
    useShallow((state) => ({
      setDeviceSelected: state.setDeviceSelected,
      deviceSelected: state.deviceSelected,
    }))
  )

  useEffect(() => {
    if (!isMapReady) return

    const map = mapInstance.getMap()
    if (!map) return

    if (!resourceReady.current) {
      waterLevelDeckInstance.init(map)
      resourceReady.current = true
    }

    handleResource({
      type: isClusterVisible ? 'hidden' : 'visible',
      devices,
    })
  }, [devices, isMapReady, isClusterVisible])

  useEffect(() => {
    if (!isMapReady) return

    waterLevelDeckInstance.on(
      'water-depth-device-selected',
      handleWaterDepthSelected
    )

    return () => {
      waterLevelDeckInstance.off(
        'water-depth-device-selected',
        handleWaterDepthSelected
      )
    }
  }, [isMapReady])

  useEffect(() => {
    const map = mapInstance.getMap()
    if (!map) return

    waterLevelDeckInstance.onDeviceSelectChanged(deviceSelected)

    const device = devices.find((device) => device.id === deviceSelected)

    if (device) {
      mapInstance.onZoomToDevice(device)
    }
  }, [deviceSelected, devices])

  const handleResource = useCallback(({ devices, type }: HandleResourceFn) => {
    waterLevelDeckInstance.syncDevice({ devices, type })
  }, [])

  const handleWaterDepthSelected = useCallback(
    ({ deviceId }: { deviceId: string; deviceData: Device }) => {
      setDeviceSelected(deviceId)
    },
    []
  )

  return (
    <>
      <WaterDepthLegend />
    </>
  )
}

export default memo(WaterDepthLayer, (prevProps, nextProps) => {
  return shouldUpdate(prevProps, nextProps)
})
