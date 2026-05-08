import { NavigationEnums } from '@/constants'
import { create } from 'zustand'

export type DynamicLayout = `${NavigationEnums}`

type LayoutStore = {
  isCollapsed: boolean
  dynamicLayouts: DynamicLayout[]
  cookieDirty: boolean
  isAlreadySetLayout: boolean
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
  isAlreadySetLayout: false,

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
      isAlreadySetLayout: true,
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
  keyHandler: DynamicLayout
) => {
  let layouts = [...prevLayouts]
  const MAX_DYNAMIC_TABS = 2
  const isDisplayed = layouts.includes(keyHandler)

  if (isDisplayed) {
    return layouts.filter((layout) => layout !== keyHandler)
  }

  const isKeyOfCantDuplicated = KEYS_CANNOT_DUPLICATED.includes(
    keyHandler as any
  )
  if (isKeyOfCantDuplicated) {
    layouts = layouts.filter(
      (layout) => !KEYS_CANNOT_DUPLICATED.includes(layout as any)
    )
  }

  layouts = [...layouts, keyHandler]

  if (layouts.length > MAX_DYNAMIC_TABS) {
    const dashboardIndex = layouts.indexOf(NavigationEnums.DASHBOARD)
    if (keyHandler !== NavigationEnums.DASHBOARD && dashboardIndex !== -1) {
      layouts.splice(dashboardIndex, 1)
    }

    while (layouts.length > MAX_DYNAMIC_TABS) {
      layouts = layouts.slice(1)
    }
  }

  return layouts
}

export const KEYS_CANNOT_DUPLICATED = ['devices', 'user']
