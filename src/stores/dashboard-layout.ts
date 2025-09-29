import { create } from 'zustand'

import { Layouts } from 'react-grid-layout'

interface ScreenLayoutState {
  layouts: Layouts
  setLayouts: (layouts: Layouts) => void
}

export const useScreenLayoutStore = create<ScreenLayoutState>((set) => ({
  layouts: {},
  setLayouts: (layouts) => set({ layouts }),
}))
