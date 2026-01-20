import { create } from 'zustand'

type FleetTrackingMapStore = {
  //state
  isMapReady: boolean
  isClusterVisible: boolean
  isAlreadyShowTripRoute: boolean
  viewMode: '2d' | '3d'

  updateBooleanState: (
    key: 'isMapReady' | 'isClusterVisible' | 'isAlreadyShowTripRoute',
    value: boolean
  ) => void
  setViewMode: (viewMode: '2d' | '3d') => void
}

export const useFleetTrackingMapStore = create<FleetTrackingMapStore>(
  (set) => ({
    isMapReady: false,
    isClusterVisible: true,
    isAlreadyShowTripRoute: false,
    viewMode: '2d',

    updateBooleanState: (key, value) =>
      set(() => ({
        [key]: value,
      })),
    setViewMode: (viewMode) => {
      return set({ viewMode })
    },
  })
)
