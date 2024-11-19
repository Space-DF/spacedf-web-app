import { DynamicLayout, NavigationEnums, dynamicLayoutKeys } from '@/constants'

export const getLocalStorage = (key: string, initialValue: any) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key)
  }

  return initialValue
}

export const checkDisplayedDynamicLayout = (
  currentLayouts: DynamicLayout[],
) => {
  return currentLayouts.some((layoutKey) =>
    dynamicLayoutKeys.includes(layoutKey),
  )
}

export const getDynamicLayoutRight = (
  dynamicLayouts: `${NavigationEnums}`[],
) => {
  return dynamicLayouts.filter((layoutKey) =>
    dynamicLayoutKeys.includes(layoutKey as any),
  )
}

export const displayedRightDynamicLayout = (dynamicLayout: string[]) => {
  const first = dynamicLayout.includes(NavigationEnums.DASHBOARD)
  const second =
    dynamicLayout.includes(NavigationEnums.DEVICES) ||
    dynamicLayout.includes(NavigationEnums.USER)

  return {
    first,
    second,
    isShowAll: first && second,
  }
}

export const delay = async (delayMsTime: number = 0) => {
  await new Promise((resolveOuter) => {
    resolveOuter(
      new Promise((resolveInner) => {
        setTimeout(resolveInner, delayMsTime)
      }),
    )
  })
}
