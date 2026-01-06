'use client'
import { useDeviceStore } from '@/stores/device-store'
import { WaterLevelInstance } from '@/utils/fleet-tracking-map/layer-instance/water-level-instance'
import { useCallback, useEffect, useState } from 'react'

const waterLevelInstance = WaterLevelInstance.getInstance()

export const useDisplayWaterDevice = (devices: Record<string, any>) => {
  const [visibleDeviceIds, setVisibleDeviceIds] = useState<Map<string, string>>(
    new Map()
  )

  const setDeviceSelected = useDeviceStore((state) => state.setDeviceSelected)
  const [clusterDropdownOpen, setClusterDropdownOpen] = useState(false)

  useEffect(() => {
    const { visibleDevices } = waterLevelInstance.getVisibleDevicesAndGroups(
      Object.values(devices)
    )
    setVisibleDeviceIds(
      new Map(visibleDevices.map((device) => [device.id, device.id]))
    )
  }, [devices])

  const handleSelectDevice = useCallback(
    (deviceId: string) => {
      waterLevelInstance.setDisplayedDeviceForLocation(deviceId)
      const { visibleDevices } = waterLevelInstance.getVisibleDevicesAndGroups(
        Object.values(devices)
      )
      setVisibleDeviceIds(
        new Map(visibleDevices.map((device) => [device.id, device.id]))
      )
      setDeviceSelected(deviceId)
      setClusterDropdownOpen(false)
    },
    [setDeviceSelected]
  )

  return {
    visibleDeviceIds,
    handleSelectDevice,
    clusterDropdownOpen,
    setClusterDropdownOpen,
  }
}
