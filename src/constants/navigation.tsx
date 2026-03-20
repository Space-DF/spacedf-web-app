'use client'
import {
  CodeSandbox,
  CubeFocus,
  Devices,
  Warehouse,
  Square,
} from '@/components/icons'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useParams } from 'next/navigation'
import { useGlobalStore } from '@/stores'

export enum NavigationEnums {
  DASHBOARD = 'dashboard',
  DEVICES = 'devices',
  MAPS = 'maps',
  DIGITAL_TWIN = 'digital-twin',
  USER = 'user',
  WORKSPACE_SETTINGS = '/workspace-settings',
  PLAN_BILLING = 'plan-billing',
  GEOFENCES = 'geofences',
}

export type Navigation = {
  href: `${NavigationEnums}`
  title: string
  icon?: React.ReactElement
  isDynamic?: boolean
  isAlwayEnabled?: boolean
  onClick?: () => void
  key:
    | 'digital_twin'
    | 'devices'
    | 'dashboard'
    | 'workspace_settings'
    | 'geofences'
}

export type DynamicLayout =
  | NavigationEnums.DASHBOARD
  | NavigationEnums.DEVICES
  | NavigationEnums.USER
  | NavigationEnums.GEOFENCES

export const NavigationData = (
  translateFn: ReturnType<typeof useTranslations>
): Navigation[] => {
  const router = useRouter()
  const params = useParams()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  return [
    {
      key: 'digital_twin',
      href: NavigationEnums.DIGITAL_TWIN,
      title: translateFn('digital_twin'),
      icon: <CubeFocus />,
      isDynamic: true,
      isAlwayEnabled: true,
    },
    {
      key: 'devices',
      href: NavigationEnums.DEVICES,
      title: translateFn('devices'),
      icon: <Devices />,
      isDynamic: true,
    },
    {
      key: 'dashboard',
      href: NavigationEnums.DASHBOARD,
      title: translateFn('dashboard'),
      icon: <CodeSandbox />,
      isDynamic: true,
    },
    {
      key: 'geofences',
      href: NavigationEnums.GEOFENCES,
      title: translateFn('geofences'),
      icon: <Square />,
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
      key: 'workspace_settings',
      href: NavigationEnums.WORKSPACE_SETTINGS,
      title: translateFn('workspace_settings'),
      icon: <Warehouse />,
      onClick: () =>
        router.push(
          `/spaces/${params.spaceSlug || currentSpace?.slug_name}/${NavigationEnums.WORKSPACE_SETTINGS}`
        ),
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
  NavigationEnums.GEOFENCES,
  NavigationEnums.USER,
]
