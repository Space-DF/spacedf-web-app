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

export const getDynamicLayoutRight = (dynamicLayouts: NavigationEnums[]) => {
  return dynamicLayouts.filter((layoutKey) =>
    dynamicLayoutKeys.includes(layoutKey as any)
  )
}

export const displayedRightDynamicLayout = (dynamicLayout: string[]) => {
  const left = dynamicLayout[0] || null
  const right = dynamicLayout[1] || null
  const first = !!left
  const second = !!right

  return {
    first,
    second,
    isShowAll: first && second,
    left,
    right,
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

export const uuidv4 = (): string => crypto.randomUUID()

export const linear = (t: number) => t

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3) // Cubic ease-out
