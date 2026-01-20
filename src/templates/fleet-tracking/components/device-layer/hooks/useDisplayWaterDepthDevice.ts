'use client'
import { useDeviceStore } from '@/stores/device-store'
import { WaterDepthDeckInstance } from '../../../core/water-depth/water-depth-deckgl-instance'
import { useCallback, useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { Device } from '@/stores/device-store'

const waterDepthDeckInstance = WaterDepthDeckInstance.getInstance()

export const useDisplayWaterDepthDevice = (devices: Device[]) => {
  const [visibleDeviceIds, setVisibleDeviceIds] = useState<Map<string, string>>(
    new Map()
  )

  const { setDeviceSelected, deviceSelected } = useDeviceStore(
    useShallow((state) => ({
      setDeviceSelected: state.setDeviceSelected,
      deviceSelected: state.deviceSelected,
    }))
  )
  const [clusterDropdownOpen, setClusterDropdownOpen] = useState(false)

  useEffect(() => {
    if (deviceSelected) {
      waterDepthDeckInstance.setDisplayedDeviceForLocation(deviceSelected)
    }
    const { visibleDevices } =
      waterDepthDeckInstance.getVisibleDevicesAndGroups(devices)
    setVisibleDeviceIds(
      new Map(visibleDevices.map((device) => [device.id, device.id]))
    )
  }, [devices, deviceSelected])

  const handleSelectDevice = useCallback(
    (deviceId: string) => {
      waterDepthDeckInstance.setDisplayedDeviceForLocation(deviceId)
      const { visibleDevices } =
        waterDepthDeckInstance.getVisibleDevicesAndGroups(devices)
      setVisibleDeviceIds(
        new Map(visibleDevices.map((device) => [device.id, device.id]))
      )
      setDeviceSelected(deviceId)
      setClusterDropdownOpen(false)
    },
    [setDeviceSelected, devices]
  )

  return {
    visibleDeviceIds,
    handleSelectDevice,
    clusterDropdownOpen,
    setClusterDropdownOpen,
  }
}
