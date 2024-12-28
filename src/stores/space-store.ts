import { create } from 'zustand'
type SpaceState = {
  shouldBackPreviousPage: boolean
  isLoading: boolean
}

type SpaceAction = {
  setBackPreviousPage: (newState: boolean) => void
  setLoading: () => void
}

export const useSpaceStore = create<SpaceState & SpaceAction>((set) => ({
  shouldBackPreviousPage: false,
  isLoading: false,
  setBackPreviousPage: (newState) => {
    set(() => ({ shouldBackPreviousPage: newState }))
  },
  setLoading: () => {
    set(() => ({ isLoading: true }))
    setTimeout(() => {
      set(() => ({ isLoading: false }))
    }, 1000)
  },
}))
