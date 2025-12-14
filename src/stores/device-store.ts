import {
  DEVICE_LAYER_PROPERTIES,
  DEVICE_MODEL,
  LayerProperties,
  SupportedModels,
} from '@/constants/device-property'
import { DeviceDataOriginal, LorawanDevice } from '@/types/device'
import { Checkpoint } from '@/types/trip'
import { GLTFWithBuffers } from '@loaders.gl/gltf'
import { castDraft } from 'immer'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type Device<T = {}> = {
  lorawan_device?: LorawanDevice
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
    latest_checkpoint_arr?: [number, number]
    water_level_name?: 'safe' | 'warning' | 'danger'
    battery?: number
  }
  deviceInformation?: DeviceDataOriginal['device']
  latestLocation?: [number, number]
  realtimeTrip?: [number, number][]
  origin?: string
  deviceId: string
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
}

const reduceDevices = (data: Device[]) => {
  return data.reduce(
    (acc, device) => ({
      ...acc,
      [device.id]: device,
    }),
    {} as Record<string, Device>
  )
}

const reduceDeviceFleetTracking = (data: Device[]) => {
  return data
    .filter((device) =>
      device.deviceProperties?.latest_checkpoint_arr?.every((loc) => loc)
    )
    .reduce(
      (acc, device) => ({
        ...acc,
        [device.id]: device,
      }),
      {} as Record<string, Device>
    )
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

    setDeviceProperties: (deviceId, data) => {
      return set((state) => {
        const newDevices = Object.values(state.devices).map((device) => {
          if (device.deviceId === deviceId) {
            return {
              ...device,
              deviceProperties: {
                ...device.deviceProperties,
                ...data,
              } as Device['deviceProperties'],
            }
          }
          return device
        })

        state.devices = reduceDevices(newDevices)
        state.devicesFleetTracking = reduceDeviceFleetTracking(newDevices)
      })
    },

    setDevices: (data) => {
      return set(() => ({
        devicesFleetTracking: reduceDeviceFleetTracking(data),
        devices: reduceDevices(data),
      }))
    },

    setDeviceHistory: (data) => {
      return set(() => ({
        deviceHistory: data,
      }))
    },

    setDeviceState: (deviceId, data) => {
      return set((state) => {
        if (data?.organization === 'dut-udn') return

        const currentDevice = Object.values(state.devices)?.find(
          (d) => d.deviceId === deviceId
        )
        const newLat = data.deviceProperties?.latest_checkpoint_arr?.[1]
        const newLng = data.deviceProperties?.latest_checkpoint_arr?.[0]

        if (!newLat || !newLng) return

        if (currentDevice) {
          const newDeviceProperties = {
            ...currentDevice?.deviceProperties,
            latest_checkpoint_arr: [newLng, newLat],
            latest_checkpoint: {
              latitude: newLat,
              longitude: newLng,
            },
          } as Device['deviceProperties']
          state.devices[deviceId].deviceProperties = newDeviceProperties

          if (state.devicesFleetTracking[deviceId]) {
            state.devicesFleetTracking[deviceId].deviceProperties =
              newDeviceProperties
          }
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
              latest_checkpoint_arr: [newLng, newLat],
              latest_checkpoint: {
                latitude: newLat,
                longitude: newLng,
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
