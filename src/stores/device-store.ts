import {
  GpsTrackerAttributes,
  RakAttributes,
  SupportedModels,
  TrackiAttributes,
} from '@/utils/model-objects/devices/gps-tracker/type'
import { GLTFWithBuffers } from '@loaders.gl/gltf'
import { create } from 'zustand'

export type Device = {
  name: string
  id: string
  status: 'active' | 'inactive'
  type: SupportedModels
  layerProps?: Record<string, any>
  histories: any
  latestLocation?: [number, number]
  realtimeTrip?: [number, number][]
} & GpsTrackerAttributes &
  (TrackiAttributes | RakAttributes)

type DeviceModelState = {
  models: Record<SupportedModels, GLTFWithBuffers>
  modelPreview: Record<SupportedModels, string>
  devices: Record<string, Device>
  deviceSelected: string
  initializedSuccess: boolean
  setInitializedSuccess: (newState: boolean) => void
}

type DeviceModelAction = {
  setDeviceModel: (key: SupportedModels, bufferModel: GLTFWithBuffers) => void
  setModelPreview: (key: SupportedModels, preview: string) => void
  setDevices: (data: Device[]) => void
  setDeviceSelected: (id: string) => void

  setDeviceReceivedData: (deviceId: string, data: Partial<Device>) => void
}

export const useDeviceStore = create<DeviceModelState & DeviceModelAction>(
  (set) => ({
    devices: {},
    models: {} as Record<SupportedModels, GLTFWithBuffers>,
    deviceSelected: '',
    initializedSuccess: false,
    modelPreview: {} as Record<SupportedModels, string>,

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

    setDeviceSelected(id: string) {
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

    setDeviceReceivedData: (deviceId, data) => {
      return set((state) => ({
        devices: {
          ...state.devices,
          [deviceId]: { ...state.devices[deviceId], ...data },
        },
      }))
    },

    setInitializedSuccess: (newState) =>
      set(() => ({
        initializedSuccess: newState,
      })),
  })
)
