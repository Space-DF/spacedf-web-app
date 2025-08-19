import { MapType } from '@/utils/map'
import { create } from 'zustand'

type ModelType = '3d' | '2d'

type FleetTrackingStore = {
  //state
  map: mapboxgl.Map | null
  mapType: MapType | null
  modelType: ModelType | null
  isMapReady: boolean

  //actions
  setMap: (map: mapboxgl.Map | null) => void
  setMapType: (mapType: MapType) => void

  updateBooleanState: (key: 'isMapReady', value: boolean) => void
  setModelType: (modelType: ModelType) => void
}

export const useFleetTrackingStore = create<FleetTrackingStore>((set) => ({
  map: null as mapboxgl.Map | null,
  isMapReady: false,
  mapType: null,
  modelType: null,

  setMap: (map) => set({ map }),
  setMapType: (mapType) => {
    localStorage.setItem('fleet-tracking:mapType', mapType)
    return set({ mapType })
  },

  setModelType: (modelType) => {
    localStorage.setItem('fleet-tracking:modelType', modelType)
    return set({ modelType })
  },

  updateBooleanState: (key, value) =>
    set(() => ({
      [key]: value,
    })),
}))
