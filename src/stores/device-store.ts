import {
  DEVICE_LAYER_PROPERTIES,
  DEVICE_MODEL,
  LayerProperties,
  SupportedModels,
} from '@/constants/device-property'
import { Alert } from '@/types/alert'
import { Building } from '@/types/building'
import { DeviceDataOriginal, LorawanDevice } from '@/types/device'
import { Entity } from '@/types/entity'
import { Checkpoint } from '@/types/trip'
import { WaterDepthLevelName } from '@/utils/water-depth'
import { GLTFWithBuffers } from '@loaders.gl/gltf'
import { castDraft } from 'immer'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type Device<T = {}> = {
  lorawan_device?: LorawanDevice
  deviceSpaceId?: string
  name: string
  description?: string
  id: string
  status: 'active' | 'inactive'
  type: SupportedModels
  layerProps?: LayerProperties
  histories?: {
    end: [number, number]
    start: [number, number]
  }
  deviceProperties?: DeviceDataOriginal['device_properties'] & {
    latest_checkpoint_arr?: [number, number, number]
    water_level_name?: WaterDepthLevelName
    battery?: number
  }
  deviceInformation?: DeviceDataOriginal['device']
  latestLocation?: [number, number, number]
  realtimeTrip?: [number, number][]
  origin?: string
  deviceId: string
  entities?: Entity[]
  position?: {
    x: number
    y: number
    z: number
  }
  building?: Building
} & T

type DeviceModelState = {
  models: Record<SupportedModels, GLTFWithBuffers>
  modelPreview: Record<SupportedModels, string>
  devices: Record<string, Device>
  devicesFleetTracking: Record<string, Device>
  deviceSelected: string
  initializedSuccess: boolean
  setInitializedSuccess: (newState: boolean) => void
  deviceHistory: Checkpoint[]
  deviceAlerts: Record<'water_depth', Record<string, Alert[]>>

  setDeviceAlerts: (
    deviceId: string,
    type: 'water_depth',
    data: Partial<Alert>
  ) => void
}

type DeviceModelAction = {
  setDeviceModel: (key: SupportedModels, bufferModel: GLTFWithBuffers) => void
  setModelPreview: (key: SupportedModels, preview: string) => void
  setDevices: (data: Device[]) => void
  setDeviceSelected: (id: string) => void
  setDeviceProperties: (
    deviceId: string,
    data: Partial<Device['deviceProperties']>
  ) => void

  setDeviceState: (deviceId: string, data: any) => void

  setDeviceHistory: (data: Checkpoint[]) => void
  clearDeviceModels: () => void
  setDeviceAlertDevice: (
    deviceId: string,
    type: 'water_depth',
    data: Alert[]
  ) => void
  setDevicesFleetTracking: (data: Device[]) => void
}

const reduceDevices = (data: Device[]) => {
  const acc: Record<string, Device> = {}
  for (const device of data) {
    acc[device.id] = device
  }
  return acc
}

const reduceDeviceFleetTracking = (data: Device[]) => {
  const acc: Record<string, Device> = {}
  for (const device of data) {
    const latLng = device.deviceProperties?.latest_checkpoint_arr
    if (latLng && latLng.length >= 2 && latLng[0] && latLng[1]) {
      acc[device.id] = device
    }
  }
  return acc
}

export const useDeviceStore = create<DeviceModelState & DeviceModelAction>()(
  immer((set) => ({
    devices: {} as Record<string, Device>,
    devicesFleetTracking: {} as Record<string, Device>,
    models: {} as Record<SupportedModels, GLTFWithBuffers>,
    deviceSelected: '',
    initializedSuccess: false,
    modelPreview: {} as Record<SupportedModels, string>,
    deviceHistory: [],
    deviceAlerts: {
      water_depth: {},
    },
    setDeviceAlerts: (deviceId, type, data) => {
      return set((state) => {
        state.deviceAlerts[type][deviceId] = [
          data as Alert,
          ...(state.deviceAlerts[type][deviceId] || []),
        ]
      })
    },

    setDeviceAlertDevice: (deviceId, type, data) => {
      return set((state) => {
        state.deviceAlerts[type][deviceId] = data
      })
    },

    setDeviceModel(key, bufferModel) {
      return set((state) => {
        state.models[key] = castDraft(bufferModel)
      })
    },

    setModelPreview(key, preview) {
      return set((state) => {
        state.modelPreview[key] = preview
      })
    },

    setDeviceSelected(id) {
      return set(() => ({
        deviceSelected: id,
      }))
    },

    setDevicesFleetTracking: (data) => {
      set((state) => {
        const incoming = reduceDeviceFleetTracking(data)

        return {
          devicesFleetTracking: {
            ...incoming,
            ...state.devicesFleetTracking,
          },
        }
      })
    },

    setDeviceProperties: (deviceId, data) => {
      return set((state) => {
        const device = state.devices[deviceId]
        if (device) {
          device.deviceProperties = {
            ...device.deviceProperties,
            ...data,
          } as Device['deviceProperties']

          const latLng = device.deviceProperties?.latest_checkpoint_arr
          const isEligibleForFleetTracking =
            latLng && latLng.length >= 2 && latLng[0] && latLng[1]

          if (isEligibleForFleetTracking) {
            state.devicesFleetTracking[deviceId] = device
          } else {
            delete state.devicesFleetTracking[deviceId]
          }
        }
      })
    },

    setDevices: (data) => {
      return set(() => ({
        devices: reduceDevices(data),
        devicesFleetTracking: reduceDeviceFleetTracking(data),
      }))
    },

    setDeviceHistory: (data) => {
      return set(() => ({
        deviceHistory: data,
      }))
    },

    setDeviceState: (deviceId, data) => {
      return set((state) => {
        const currentDevice = state.devices[deviceId]
        const newLat = data.deviceProperties?.latest_checkpoint_arr?.[1]
        const newLng = data.deviceProperties?.latest_checkpoint_arr?.[0]
        const newBear = data.deviceProperties?.latest_checkpoint_arr?.[2]
        if (!newLat || !newLng) return

        if (currentDevice) {
          const newDeviceProperties = {
            ...currentDevice?.deviceProperties,
            latest_checkpoint_arr: [newLng, newLat, newBear],
            latest_checkpoint: {
              latitude: newLat,
              longitude: newLng,
              bearing: newBear,
            },
          } as Device['deviceProperties']
          state.devices[deviceId].deviceProperties = newDeviceProperties
          state.devicesFleetTracking[deviceId] = state.devices[deviceId]
        } else {
          const newDevice: Device = {
            type: DEVICE_MODEL.RAK,
            layerProps: DEVICE_LAYER_PROPERTIES[
              DEVICE_MODEL.RAK
            ] as LayerProperties,
            id: deviceId,
            name: 'Unknown-' + deviceId,
            status: 'active',
            histories: {
              start: [0, 0],
              end: [0, 0],
            },
            deviceProperties: {
              latest_checkpoint_arr: [newLng, newLat, newBear],
              latest_checkpoint: {
                latitude: newLat,
                longitude: newLng,
                bearing: newBear,
              },
            },
            deviceId: deviceId,
            lorawan_device: {
              dev_eui: data.device_eui,
            } as LorawanDevice,
          }

          state.devices = {
            ...state.devices,
            [deviceId]: newDevice,
          }

          state.devicesFleetTracking = {
            ...state.devicesFleetTracking,
            [deviceId]: newDevice,
          }
        }
      })
    },

    setInitializedSuccess: (newState) =>
      set(() => ({
        initializedSuccess: newState,
      })),

    clearDeviceModels: () =>
      set(() => ({
        models: {} as Record<SupportedModels, GLTFWithBuffers>,
        modelPreview: {} as Record<SupportedModels, string>,
      })),
  }))
)
