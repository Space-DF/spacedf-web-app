import { create } from 'zustand'
import { Space } from '@/types/space'

export type MapType = 'default' | 'satellite' | 'street'

type GlobalStore = {
  currentSpace: Space | null
  duration?: number
  loadingTitle?: string
  loadingDescription?: string
  isGlobalLoading: boolean
  mapType: MapType
  isMapInitialized: boolean
}

type ActionsGlobalStore = {
  setMapType: (type: MapType) => void
  setMapInitialized: (state: boolean) => void
  setCurrentSpace: (newSpace: Space) => void
  setDuration: (duration: number) => void
  setLoadingText: (
    newSpace: Pick<
      GlobalStore,
      'loadingTitle' | 'loadingDescription' | 'duration'
    >
  ) => void
  resetLoadingState: () => void
  setGlobalLoading: (newState: boolean) => void
}

const defaultLoadingState = {
  duration: 1000,
  loadingTitle: undefined,
  loadingDescription: undefined,
}

export const useGlobalStore = create<GlobalStore & ActionsGlobalStore>(
  (set) => ({
    mapType: 'default',
    isMapInitialized: false,
    setMapInitialized: (newState) => set({ isMapInitialized: newState }),
    setMapType: (newMapType) => set({ mapType: newMapType }),
    currentSpace: null,
    isGlobalLoading: false,
    setCurrentSpace: (newSpace) => set({ currentSpace: newSpace }),
    setDuration: (duration) => set({ duration }),
    setLoadingText: (newLoading) => {
      set({
        duration: newLoading.duration || defaultLoadingState.duration,
        loadingTitle: newLoading.loadingTitle,
        loadingDescription: newLoading.loadingDescription,
      })
    },
    resetLoadingState: () => set(defaultLoadingState),
    setGlobalLoading: (newState) =>
      set(() => ({
        isGlobalLoading: newState,
      })),
  })
)
