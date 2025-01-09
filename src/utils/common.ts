import { DynamicLayout, NavigationEnums, dynamicLayoutKeys } from '@/constants'
import Cookies from 'js-cookie'

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
  const first = dynamicLayout.includes(NavigationEnums.DEVICES)
  const second =
    dynamicLayout.includes(NavigationEnums.DASHBOARD) ||
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

export const getClientOrganization = async () => {
  if (typeof window !== 'undefined') {
    // On client side, get the host from window
    return Cookies.get('organization') || ''
  }

  return ''
}
