import { create } from 'zustand'

import { Layout, Layouts } from 'react-grid-layout'

interface ScreenLayoutState {
  layouts: Layouts
  setLayouts: (layouts: Layouts) => void
  addWidget: (widget: Layout) => void
}
const screenLayout: Layout[] = [
  { w: 3, h: 2, x: 0, y: 0, i: '0-left', minW: 2, minH: 2 },
  { w: 2, h: 2, x: 4, y: 0, i: '0-right', minW: 2, minH: 2 },
  { w: 5, h: 3, x: 0, y: 3, i: '1', minW: 2, minH: 2 },
  { w: 5, h: 1, x: 0, y: 6, i: '2', minW: 2 },
  { w: 5, h: 2, x: 0, y: 7, i: '3', minW: 2, minH: 2 },
  { w: 1, h: 1, x: 2, y: 7, i: '4' },
  { w: 3, h: 1, x: 0, y: 9, i: '5' },
  { w: 2, h: 1, x: 0, y: 8, i: '6' },
  { w: 2, h: 3, x: 3, y: 11, i: '7', minW: 2, minH: 3 },
]
export const useScreenLayoutStore = create<ScreenLayoutState>((set) => ({
  layouts: {
    lg: screenLayout,
    md: screenLayout,
    sm: screenLayout,
    xs: screenLayout,
    xxs: screenLayout,
  },
  setLayouts: (layouts) => set({ layouts }),
  addWidget: (widget: Layout) =>
    set((state) => ({
      layouts: {
        lg: [widget, ...state.layouts.lg],
        md: [widget, ...state.layouts.md],
        sm: [widget, ...state.layouts.sm],
        xs: [widget, ...state.layouts.sm],
        xxs: [widget, ...state.layouts.xxs],
      },
    })),
}))
