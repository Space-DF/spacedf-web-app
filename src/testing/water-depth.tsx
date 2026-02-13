'use client'

import { Button } from '@/components/ui/button'
import { DEVICE_FEATURE_SUPPORTED } from '@/constants/device-property'
import { Device, useDeviceStore } from '@/stores/device-store'
import { MAP_PITCH } from '@/templates/fleet-tracking/constant'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'
import { groupDeviceByFeature } from '@/utils/map'
import { getWaterDepthLevelName } from '@/utils/water-depth'
import { useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'

const TEST_DEVICE_LOCATION = {
  latitude: 21.0227784,
  longitude: 105.8163641,
}

const mapInstance = MapInstance.getInstance()
export const useWaterDepthTesting = () => {
  const { firstDevice, devices, setDevices } = useDeviceStore(
    useShallow((state) => {
      const deviceGroup = groupDeviceByFeature(
        Object.values(state.devicesFleetTracking)
      )

      return {
        initializedSuccess: state.initializedSuccess,
        firstDevice: (deviceGroup[DEVICE_FEATURE_SUPPORTED.WATER_DEPTH] ||
          [])[0],
        setDevices: state.setDevices,
        devices: state.devices,
      }
    })
  )

  const testDevice = useRef<Device | null>(null)

  const addDevice = () => {
    if (testDevice.current || !firstDevice) return

    console.log({ firstDevice })

    const deviceClone: Device = {
      ...firstDevice,
      name: 'Test Device',
      deviceId: 'test-device-id',
      deviceInformation: {
        ...firstDevice.deviceInformation,
        id: 'test-device-id',
      } as any,
      id: 'test-device-id',
      latestLocation: [
        TEST_DEVICE_LOCATION.longitude,
        TEST_DEVICE_LOCATION.latitude,
      ],
      deviceProperties: {
        latest_checkpoint_arr: [
          TEST_DEVICE_LOCATION.longitude,
          TEST_DEVICE_LOCATION.latitude,
        ],
        latest_checkpoint: TEST_DEVICE_LOCATION,
        water_depth: 0,
        water_level_name: getWaterDepthLevelName(0),
      },
    }

    testDevice.current = deviceClone

    setDevices([deviceClone, ...Object.values(devices)])
    focusDevice()
  }

  const focusDevice = () => {
    const map = mapInstance.getMap()

    if (!map) return

    if (!testDevice.current) {
      addDevice()
    }

    map.flyTo({
      center: testDevice.current!.latestLocation,
      zoom: 15,
      duration: 500,
      pitch: MAP_PITCH['3d'],
    })
  }

  const updateDevice = () => {
    if (!testDevice.current) {
      addDevice()
    }

    const newLocation = {
      latitude:
        (testDevice.current!.deviceProperties?.latest_checkpoint_arr?.[1] ||
          0) + 0.0001,
      longitude:
        (testDevice.current!.deviceProperties?.latest_checkpoint_arr?.[0] ||
          0) + 0.0001,
    }
    const deviceWithNewLocation: Device = {
      ...testDevice.current!,
      deviceProperties: {
        latest_checkpoint: newLocation,
        latest_checkpoint_arr: [newLocation.longitude, newLocation.latitude],
        water_depth: 0,
        water_level_name: getWaterDepthLevelName(0),
      },
    }

    const newDevices = Object.values(devices).map((device) => {
      if (device.id === deviceWithNewLocation.id) {
        return deviceWithNewLocation
      }
      return device
    })

    setDevices(newDevices)

    testDevice.current = deviceWithNewLocation
    focusDevice()
  }

  const deleteDevice = () => {
    if (!testDevice.current) return

    const newDevices = Object.values(devices).filter(
      (device) => device.id !== testDevice.current!.id
    )

    setDevices(newDevices)

    testDevice.current = null
  }

  const updateLevel = (type: 'increase' | 'decrease') => {
    if (!testDevice.current) {
      addDevice()
    }

    let level = testDevice.current!.deviceProperties?.water_depth || 0
    let levelName = testDevice.current!.deviceProperties?.water_level_name

    if (type === 'increase') {
      const newLevel = level + 10
      level = newLevel
      levelName = getWaterDepthLevelName(newLevel)
    } else if (type === 'decrease') {
      const newLevel = level > 10 ? level - 10 : 0
      level = newLevel
      levelName = getWaterDepthLevelName(newLevel)
    }

    const deviceWithNewLocation: Device = {
      ...testDevice.current!,
      deviceProperties: {
        ...testDevice.current!.deviceProperties,
        water_depth: level,
        water_level_name: levelName,
      },
    }

    const newDevices = Object.values(devices).map((device) => {
      if (device.id === deviceWithNewLocation.id) {
        return deviceWithNewLocation
      }
      return device
    })

    setDevices(newDevices)
    testDevice.current = deviceWithNewLocation
  }

  return {
    addDevice,
    focusDevice,
    updateDevice,
    deleteDevice,
    updateLevel,
  }
}

export const WaterDepthTestingButtons = () => {
  const { addDevice, focusDevice, updateDevice, deleteDevice, updateLevel } =
    useWaterDepthTesting()

  return (
    <div className="absolute top-0 left-0 flex items-center gap-2 m-4 z-[9999999] max-w-xl flex-wrap">
      <Button onClick={focusDevice}>Focus Device</Button>
      <Button onClick={addDevice}>Add Device</Button>
      <Button onClick={deleteDevice}>Delete Device</Button>
      <Button onClick={updateDevice}>Update Device</Button>
      <Button onClick={() => updateLevel('increase')}>Increase Level</Button>
      <Button onClick={() => updateLevel('decrease')}>Decrease Level</Button>
    </div>
  )
}
