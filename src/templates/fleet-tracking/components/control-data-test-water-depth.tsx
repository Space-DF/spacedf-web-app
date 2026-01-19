import { Button } from '@/components/ui/button'
import {
  DEVICE_FEATURE_SUPPORTED,
  DEVICE_MODEL,
} from '@/constants/device-property'
import { Device, useDeviceStore } from '@/stores/device-store'
import { getWaterDepthLevelName } from '@/utils/water-depth'
import { v4 as uuidv4 } from 'uuid'
import { useShallow } from 'zustand/react/shallow'

export default function ControlDataTestWaterDepth() {
  const { allDevices, setDevices } = useDeviceStore(
    useShallow((state) => ({
      setDevices: state.setDevices,
      allDevices: state.devices,
    }))
  )

  return (
    <div
      className="absolute bottom-8 right-2 rounded-lg h-max bg-white/90 backdrop-blur-sm z-[1000] p-3 shadow-sm
  dark:bg-[#171A28CC] dark:text-white flex gap-2"
    >
      <Button
        onClick={() => {
          const newDevice = getNewDevice()
          setDevices([...Object.values(allDevices), newDevice])
        }}
      >
        Add Device
      </Button>

      <Button
        onClick={() => {
          const newDevices = Object.values(allDevices).map((device) => {
            if (device.id === 'wlb-v1-123') {
              const newLat =
                (device.deviceProperties?.latest_checkpoint?.latitude ?? 0) +
                0.0001

              const newLng =
                (device.deviceProperties?.latest_checkpoint?.longitude ?? 0) +
                0.0001

              return {
                ...device,
                deviceProperties: {
                  ...device.deviceProperties,
                  latest_checkpoint: { latitude: newLat, longitude: newLng },
                  latest_checkpoint_arr: [newLng, newLat] as [number, number],
                },
              }
            }
            return device
          })

          setDevices(newDevices)
        }}
      >
        Update Location
      </Button>
      <Button
        onClick={() => {
          const newDevices = Object.values(allDevices).map((device) => {
            if (device.id === 'wlb-v1-123') {
              const newLevel = (device.deviceProperties?.water_depth ?? 0) + 10

              return {
                ...device,
                deviceProperties: {
                  ...device.deviceProperties,
                  water_depth: newLevel,
                  water_level_name: getWaterDepthLevelName(newLevel),
                },
              }
            }
            return device
          })

          setDevices(newDevices)
        }}
      >
        Update Level
      </Button>
      <Button
        onClick={() => {
          const newDevices = Object.values(allDevices).filter(
            (device) => !device.name.endsWith('new')
          )

          setDevices(newDevices)
        }}
      >
        Remove Device
      </Button>
    </div>
  )
}

const getNewDevice = (): Device => {
  const deviceId = uuidv4()
  return {
    id: deviceId,
    name: `Water Level Board V2 new`,
    description: '',
    status: 'active',
    type: DEVICE_MODEL.WLB,
    deviceId: deviceId,
    deviceInformation: {
      id: uuidv4(),
      network_server: uuidv4(),
      device_model: uuidv4(),
      device_profile: {
        id: uuidv4(),
        manufacture: 'RAKwireless',
        created_at: '2025-12-12T04:31:51.019Z',
        updated_at: '2025-12-12T04:31:51.019Z',
        name: 'RAK2270',
        image_url: '',
        device_type: 'lorawan',
        default_config: {},
        key_feature: DEVICE_FEATURE_SUPPORTED.WATER_DEPTH,
      },
      status: 'active',
      lorawan_device: {
        join_eui: uuidv4(),
        dev_eui: uuidv4(),
        app_key: uuidv4(),
        claim_code: uuidv4(),
      },
      is_published: false,
    },
    deviceProperties: {
      latest_checkpoint_arr: [108.22129, 16.05565],
      latest_checkpoint: {
        latitude: 16.05565,
        longitude: 108.22129,
      },
      water_depth: 50,
      water_level_name: getWaterDepthLevelName(50),
    },
  }
}
