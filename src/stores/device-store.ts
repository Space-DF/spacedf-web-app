import {
  GpsTrackerAttributes,
  RakAttributes,
  SupportedModels,
  TrackiAttributes,
} from '@/utils/model-objects/devices/gps-tracker/type'
import { GLTFWithBuffers } from '@loaders.gl/gltf'
import { LayerProps, ScenegraphLayer } from 'deck.gl'
import { create } from 'zustand'

export type Device = {
  name: string
  id: string
  status: 'active' | 'inactive'
  type: SupportedModels
  layerProps?: Record<string, any>
} & GpsTrackerAttributes &
  (TrackiAttributes | RakAttributes)

type DeviceModelState = {
  models: Record<SupportedModels, GLTFWithBuffers>
  devices: Record<string, Device>
  deviceSelected: string
}

type DeviceModelAction = {
  setDeviceModel: (key: SupportedModels, bufferModel: GLTFWithBuffers) => void

  setDevices: (data: Device[]) => void
  setDeviceSelected: (id: string) => void
}

export const useDeviceStore = create<DeviceModelState & DeviceModelAction>(
  (set) => ({
    devices: {},
    models: {} as Record<SupportedModels, GLTFWithBuffers>,
    deviceSelected: '',

    setDeviceModel(key, bufferModel) {
      return set((state) => ({
        models: {
          ...state.models,
          [key]: bufferModel,
        },
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
          {},
        ),
      }))
    },
  }),
)
