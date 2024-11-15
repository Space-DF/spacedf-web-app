import {
  CodeSandbox,
  CreditCard,
  CubeFocus,
  Devices,
  Maptrifold,
  Users,
  Warehouse,
} from '@/components/icons'
import { useTranslations } from 'next-intl'

export enum NavigationEnums {
  DASHBOARD = 'dashboard',
  DEVICES = 'devices',
  MAPS = 'maps',
  DIGITAL_TWIN = 'digital-twin',
  USER = 'user',
  WORKSPACE_SETTINGS = '/workspace-settings',
  PLAN_BILLING = 'plan-billing',
}

export type Navigation = {
  href: `${NavigationEnums}`
  title: string
  icon?: React.ReactElement
  isDynamic?: boolean
  isAlwayEnabled?: boolean
}

export type DynamicLayout =
  | `${NavigationEnums.DASHBOARD}`
  | `${NavigationEnums.DEVICES}`
  | `${NavigationEnums.USER}`

export const navigations = (
  translateFn: ReturnType<typeof useTranslations>,
): Navigation[] => [
  {
    href: NavigationEnums.DIGITAL_TWIN,
    title: translateFn('digital_twin'),
    icon: <CubeFocus />,
    isDynamic: true,
    isAlwayEnabled: true,
  },
  {
    href: NavigationEnums.DEVICES,
    title: translateFn('devices'),
    icon: <Devices />,
    isDynamic: true,
  },
  {
    href: NavigationEnums.DASHBOARD,
    title: translateFn('dashboard'),
    icon: <CodeSandbox />,
    isDynamic: true,
  },
  // {
  //   href: NavigationEnums.MAPS,
  //   title: translateFn('maps'),
  //   icon: <Maptrifold />,
  //   isDynamic: true,
  // },
  // {
  //   href: NavigationEnums.USER,
  //   title: translateFn('user'),
  //   icon: <Users />,
  //   isDynamic: true,
  // },
  {
    href: NavigationEnums.WORKSPACE_SETTINGS,
    title: translateFn('workspace_settings'),
    icon: <Warehouse />,
  },
  // {
  //   href: NavigationEnums.PLAN_BILLING,
  //   title: translateFn('plan_and_billing'),
  //   icon: <CreditCard />,
  // },
]

export const dynamicLayoutKeys: DynamicLayout[] = [
  NavigationEnums.DASHBOARD,
  NavigationEnums.DEVICES,
  NavigationEnums.USER,
]
