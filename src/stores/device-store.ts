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
import { create } from 'zustand'

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
} & GpsTrackerAttributes &
  (TrackiAttributes | RakAttributes)

type DeviceModelState = {
  models: Record<SupportedModels, GLTFWithBuffers>
  modelPreview: Record<SupportedModels, string>
  devices: Record<string, Device>
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

  setDeviceState: (deviceId: string, data: Partial<Device>) => void

  setDeviceHistory: (data: Checkpoint[]) => void
}

export const useDeviceStore = create<DeviceModelState & DeviceModelAction>(
  (set) => ({
    devices: {},
    models: {} as Record<SupportedModels, GLTFWithBuffers>,
    deviceSelected: '',
    initializedSuccess: false,
    modelPreview: {} as Record<SupportedModels, string>,
    deviceHistory: [],
    setDeviceModel(key, bufferModel) {
      return set((state) => ({
        models: {
          ...state.models,
          [key]: bufferModel,
        },
      }))
    },

    setModelPreview(key, preview) {
      return set((state) => ({
        modelPreview: { ...state.modelPreview, [key]: preview },
      }))
    },

    setDeviceSelected(id) {
      return set(() => ({
        deviceSelected: id,
      }))
    },

    setDevices: (data) => {
      if (!data.length) return

      return set(() => ({
        devices: data.reduce(
          (acc, device) => ({
            ...acc,
            [device.id]: device,
          }),
          {}
        ),
      }))
    },

    setDeviceHistory: (data) => {
      return set(() => ({
        deviceHistory: data,
      }))
    },

    setDeviceState: (deviceId, data) => {
      return set((state) => {
        const previousState: Device = state.devices[deviceId]
          ? state.devices[deviceId]
          : {
              type: 'rak',
              layerProps: DEVICE_LAYER_PROPERTIES['rak'],
              id: deviceId,
              name: 'Unknown-' + deviceId,
              status: 'active',
              histories: [data.latestLocation],
            }

        const newState = { ...previousState, ...data }

        return {
          devices: {
            ...state.devices,
            [deviceId]: newState,
          },
        }
      })
    },

    setInitializedSuccess: (newState) =>
      set(() => ({
        initializedSuccess: newState,
      })),
  })
)
