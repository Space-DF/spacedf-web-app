import create from 'zustand'

import { Layout, Layouts } from 'react-grid-layout'

interface ScreenLayoutState {
  layouts: Layouts
  setLayouts: (layouts: Layouts) => void
  addWidget: (widget: Layout) => void
}
const screenLayout: Layout[] = [
  { w: 5, h: 1, x: 0, y: 0, i: '1', minW: 2 },
  { w: 5, h: 2, x: 0, y: 1, i: '2', minW: 2, minH: 2 },
  { w: 1, h: 1, x: 2, y: 1, i: '3' },
  { w: 3, h: 1, x: 0, y: 4, i: '4' },
  { w: 2, h: 1, x: 0, y: 1, i: '5' },
  { w: 2, h: 3, x: 3, y: 5, i: '6', minW: 2, minH: 3 },
]
export const useScreenLayoutStore = create<ScreenLayoutState>((set) => ({
  layouts: {
    lg: screenLayout,
    md: screenLayout,
    sm: screenLayout,
    xxs: screenLayout,
  },
  setLayouts: (layouts) => set({ layouts }),
  addWidget: (widget: Layout) =>
    set((state) => ({
      layouts: {
        lg: [...state.layouts.lg, widget],
        md: [...state.layouts.md, widget],
        sm: [...state.layouts.sm, widget],
        xxs: [...state.layouts.xxs, widget],
      },
    })),
}))
