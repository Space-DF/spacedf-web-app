import { create } from 'zustand'
import { Space } from '@/types/space'

type GlobalStore = {
  currentSpace: Space | null
}

type ActionsGlobalStore = {
  setCurrentSpace: (newSpace: Space) => void
}

export const useGlobalStore = create<GlobalStore & ActionsGlobalStore>(
  (set) => ({
    currentSpace: null,
    setCurrentSpace: (newSpace) => set({ currentSpace: newSpace }),
  }),
)
