import { NavigationEnums } from '@/constants'
import { create } from 'zustand'

export type DynamicLayout = `${NavigationEnums}`

type LayoutStore = {
  isCollapsed: boolean
  dynamicLayouts: DynamicLayout[]
  cookieDirty: boolean
}

type LayoutStoreFunc = {
  setCookieDirty: (newState: boolean) => void
  setCollapsed: (newState: boolean) => void
  setDynamicLayouts: (newLayouts: DynamicLayout[]) => void
  toggleDynamicLayout: (layoutKey: `${NavigationEnums}`) => void
}

export const useLayout = create<LayoutStore & LayoutStoreFunc>((set) => ({
  isCollapsed: false,
  dynamicLayouts: [],
  cookieDirty: false,

  setCookieDirty: (newState) =>
    set(() => ({
      cookieDirty: newState,
    })),

  setCollapsed: (newState: boolean) =>
    set(() => ({
      isCollapsed: newState,
    })),

  setDynamicLayouts: (newLayout) =>
    set(() => ({
      dynamicLayouts: newLayout,
    })),

  toggleDynamicLayout: (layoutKey) =>
    set((prevState) => {
      return {
        dynamicLayouts: getNewLayouts(prevState.dynamicLayouts, layoutKey),
      }
    }),
}))

export const getNewLayouts = (
  prevLayouts: DynamicLayout[],
  keyHandler: DynamicLayout,
) => {
  let layouts = prevLayouts
  const isDisplayed = layouts.includes(keyHandler)

  const isKeyOfCantDuplicated = KEYS_CANNOT_DUPLICATED.includes(
    keyHandler as any,
  )

  if (isKeyOfCantDuplicated) {
    layouts = layouts.filter(
      (layout) => !KEYS_CANNOT_DUPLICATED.includes(layout as any),
    )
  }

  if (isDisplayed) {
    layouts = layouts.filter((layout) => layout !== keyHandler)
  } else {
    layouts = [...layouts, keyHandler]
  }

  return layouts
}

export const KEYS_CANNOT_DUPLICATED = [
  'devices',
  'user',
  // NavigationEnums.DEVICES,
  // NavigationEnums.USER,
]
