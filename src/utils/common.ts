import { DynamicLayout, NavigationEnums, dynamicLayoutKeys } from '@/constants'
import api from '@/lib/api'
import Cookies from 'js-cookie'

export const checkDisplayedDynamicLayout = (
  currentLayouts: DynamicLayout[] = []
) => {
  return currentLayouts.some((layoutKey) =>
    dynamicLayoutKeys.includes(layoutKey)
  )
}

export const getDynamicLayoutRight = (
  dynamicLayouts: `${NavigationEnums}`[]
) => {
  return dynamicLayouts.filter((layoutKey) =>
    dynamicLayoutKeys.includes(layoutKey as any)
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

export const getClientOrganization = () => {
  if (typeof window !== 'undefined') {
    // On client side, get the host from window
    return Cookies.get('organization') || ''
  }

  return ''
}

export const isEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const fetcher = <T>(url: string) => api.get<T>(url)
