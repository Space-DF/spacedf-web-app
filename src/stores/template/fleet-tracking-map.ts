import { create } from 'zustand'

type FleetTrackingMapStore = {
  //state
  isMapReady: boolean
  isClusterVisible: boolean
  isAlreadyShowTripRoute: boolean
  viewMode: '2d' | '3d'
  ungroupedDeviceIds: string[]

  updateBooleanState: (
    key: 'isMapReady' | 'isClusterVisible' | 'isAlreadyShowTripRoute',
    value: boolean
  ) => void
  setViewMode: (viewMode: '2d' | '3d') => void
  setUngroupedDeviceIds: (ungroupedDeviceIds: string[]) => void
}

export const useFleetTrackingMapStore = create<FleetTrackingMapStore>(
  (set) => ({
    isMapReady: false,
    isClusterVisible: true,
    isAlreadyShowTripRoute: false,
    viewMode: '2d',
    ungroupedDeviceIds: [],

    updateBooleanState: (key, value) =>
      set(() => ({
        [key]: value,
      })),
    setViewMode: (viewMode) => {
      return set({ viewMode })
    },
    setUngroupedDeviceIds: (ungroupedDeviceIds) => {
      return set({ ungroupedDeviceIds })
    },
  })
)
