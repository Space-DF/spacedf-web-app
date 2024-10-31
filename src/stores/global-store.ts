import { create } from 'zustand'

type GlobalStore = {
  currentSpace: string
}

type ActionsGlobalStore = {
  setCurrentSpace: (newSpace: string) => void
}

export const useGlobalStore = create<GlobalStore & ActionsGlobalStore>(
  (set) => ({
    currentSpace: '1',
    setCurrentSpace: (newSpace) => set({ currentSpace: newSpace }),
  }),
)
