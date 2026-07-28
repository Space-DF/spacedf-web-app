'use client'
import {
  CodeSandbox,
  Devices,
  Warehouse,
  Square,
  AutomationSettings,
} from '@/components/icons'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/routing'
import { useParams } from 'next/navigation'
import { useGlobalStore, useOrganizationValidationStore } from '@/stores'

export enum NavigationEnums {
  DASHBOARD = 'dashboard',
  DEVICES = 'devices',
  MAPS = 'maps',
  USER = 'user',
  WORKSPACE_SETTINGS = '/workspace-settings',
  PLAN_BILLING = 'plan-billing',
  GEOFENCES = 'geofences',
  AUTOMATION_SETTINGS = '/automation-settings',
}

export type Navigation = {
  href: `${NavigationEnums}`
  title: string
  icon?: React.ReactElement
  isDynamic?: boolean
  isAlwayEnabled?: boolean
  isPro?: boolean
  onClick?: () => void
  key:
    | 'devices'
    | 'dashboard'
    | 'workspace_settings'
    | 'geofences'
    | 'automation_settings'
}

export type DynamicLayout =
  | NavigationEnums.DASHBOARD
  | NavigationEnums.DEVICES
  | NavigationEnums.USER
  | NavigationEnums.GEOFENCES
  | NavigationEnums.AUTOMATION_SETTINGS

export const NavigationData = (
  translateFn: ReturnType<typeof useTranslations>
): Navigation[] => {
  const router = useRouter()
  const params = useParams()
  const currentSpace = useGlobalStore((state) => state.currentSpace)
  const hasHydrated = useOrganizationValidationStore((s) => s.hasHydrated)
  const template = useOrganizationValidationStore((s) => s.template)
  const items: Navigation[] = [
    {
      key: 'devices',
      href: NavigationEnums.DEVICES,
      title: translateFn('devices'),
      icon: <Devices className="font-bold" />,
      isDynamic: true,
    },
    {
      key: 'dashboard',
      href: NavigationEnums.DASHBOARD,
      title: translateFn('dashboard'),
      icon: <CodeSandbox className="font-bold" />,
      isDynamic: true,
    },
    {
      key: 'geofences',
      href: NavigationEnums.GEOFENCES,
      title: translateFn('geofences'),
      icon: <Square className="font-bold" />,
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
      icon: <Warehouse className="font-bold" />,
      onClick: () =>
        router.push(
          `/spaces/${params.spaceSlug || currentSpace?.slug_name}/${NavigationEnums.WORKSPACE_SETTINGS}`
        ),
    },
    {
      key: 'automation_settings',
      href: NavigationEnums.AUTOMATION_SETTINGS,
      title: translateFn('automation_settings'),
      icon: <AutomationSettings className="font-bold" />,
      isPro: true,
      onClick: () =>
        router.push(
          `/spaces/${params.spaceSlug || currentSpace?.slug_name}/${NavigationEnums.AUTOMATION_SETTINGS}`
        ),
    },
    // {
    //   href: NavigationEnums.PLAN_BILLING,
    //   title: translateFn('plan_and_billing'),
    //   icon: <CreditCard />,
    // },
  ]
  return items.filter((item) => {
    if (!hasHydrated) return true
    if (template === 'smart_building' && item.key === 'geofences') return false
    return true
  })
}

export const dynamicLayoutKeys: DynamicLayout[] = [
  NavigationEnums.DASHBOARD,
  NavigationEnums.DEVICES,
  NavigationEnums.GEOFENCES,
  NavigationEnums.USER,
]
