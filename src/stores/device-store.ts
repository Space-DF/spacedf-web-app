import { DEVICE_LAYER_PROPERTIES } from '@/constants/device-property'
import { LorawanDevice } from '@/types/device'
import { Checkpoint } from '@/types/trip'
import {
  GpsTrackerAttributes,
  RakAttributes,
  SupportedModels,
  TrackiAttributes,
} from '@/utils/model-objects/devices/gps-tracker/type'
import { GLTFWithBuffers } from '@loaders.gl/gltf'
import { castDraft } from 'immer'
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
export type Device = {
  lorawan_device?: LorawanDevice
  name: string
  id: string
  status: 'active' | 'inactive'
  type: SupportedModels
  layerProps?: Record<string, any>
  histories: any
  latestLocation?: [number, number]
  realtimeTrip?: [number, number][]
  origin?: string
  deviceId?: string
} & GpsTrackerAttributes &
  (TrackiAttributes | RakAttributes)

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

  setDeviceState: (
    deviceId: string,
    data: Partial<Device & { device_eui: string }>
  ) => void

  setDeviceHistory: (data: Checkpoint[]) => void
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

    setDevices: (data) => {
      const validDevices = data.filter((device) =>
        device.latestLocation?.every((loc) => loc)
      )

      return set(() => ({
        devicesFleetTracking: reduceDevices(validDevices),
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
        const currentDevice = state.devices[deviceId]

        const previousState: Device = currentDevice || {
          type: 'rak',
          layerProps: DEVICE_LAYER_PROPERTIES['rak'],
          id: deviceId,
          device_id: deviceId,
          name: 'Unknown-' + deviceId,
          status: 'active',
          histories: [data.latestLocation],
          deviceId: deviceId,
          lorawan_device: {
            dev_eui: data.device_eui,
          } as LorawanDevice,
        }

        const newState = { ...previousState, ...data }
        state.devices[deviceId] = newState
        state.devicesFleetTracking = reduceDevices(
          (Object.values(state.devices) as Device[]).filter((device) =>
            device.latestLocation?.every((loc) => loc)
          )
        )
      })
    },

    setInitializedSuccess: (newState) =>
      set(() => ({
        initializedSuccess: newState,
      })),
  }))
)
