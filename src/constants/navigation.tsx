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
import { useRouter } from '@/i18n/routing'

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
  onClick?: () => void
}

export type DynamicLayout =
  | `${NavigationEnums.DASHBOARD}`
  | `${NavigationEnums.DEVICES}`
  | `${NavigationEnums.USER}`

export const navigations = (
  translateFn: ReturnType<typeof useTranslations>,
): Navigation[] => {
  const router = useRouter()
  return [
    {
      href: NavigationEnums.DIGITAL_TWIN,
      title: translateFn('digital_twin'),
      icon: <CubeFocus />,
      isDynamic: true,
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
      onClick: () => router.push(NavigationEnums.WORKSPACE_SETTINGS),
    },
    // {
    //   href: NavigationEnums.PLAN_BILLING,
    //   title: translateFn('plan_and_billing'),
    //   icon: <CreditCard />,
    // },
  ]
}

export const dynamicLayoutKeys: DynamicLayout[] = [
  NavigationEnums.DASHBOARD,
  NavigationEnums.DEVICES,
  NavigationEnums.USER,
]
