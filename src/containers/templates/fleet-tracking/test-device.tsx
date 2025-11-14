'use client'
import { Button } from '@/components/ui/button'
import { Device, useDeviceStore } from '@/stores/device-store'
import { useShallow } from 'zustand/react/shallow'

export const TestDevice = () => {
  const { devicesArray, setDevices } = useDeviceStore(
    useShallow((state) => ({
      devices: state.devices,
      devicesArray: Object.values(state.devices),
      setDevices: state.setDevices,
    }))
  )

  const handleAddDevice = () => {
    const firstDevice =
      devicesArray.find((device) => device.id === 'rak4630-rs3-C1F4') ||
      devicesArray[0]

    const [firstDeviceLng, firstDeviceLat] = firstDevice.latestLocation || [
      0, 0,
    ]
    const newDevice: Device = {
      ...firstDevice,
      id: `test-${devicesArray.length + 1}`,
      latestLocation: [firstDeviceLng + 0.0001, firstDeviceLat + 0.0001],
    }

    setDevices([...devicesArray, newDevice])
  }

  const handleRemoveDevice = () => {
    setDevices(devicesArray.slice(0, -1))
  }

  const handleMoveDevice = () => {
    const newDevices: Device[] = devicesArray.map((device) => {
      if (device.id === 'rak4630-rs3-C1F4') {
        return {
          ...device,
          latestLocation: [
            (device.latestLocation?.[0] ?? 0) + 0.0001,
            (device.latestLocation?.[1] ?? 0) + 0.0001,
          ],
        }
      }
      return device
    })

    setDevices(newDevices)
  }
  return (
    <div className="absolute bottom-10 left-20 test-device-control z-[2] flex items-center gap-2">
      <Button variant="outline" onClick={handleAddDevice}>
        Add Device
      </Button>
      <Button variant="outline" onClick={handleRemoveDevice}>
        Remove Device
      </Button>
      <Button variant="outline" onClick={handleMoveDevice}>
        Move Device
      </Button>
    </div>
  )
}
