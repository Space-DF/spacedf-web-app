import {
  CodeSandbox,
  CreditCard,
  CubeFocus,
  Devices,
  Maptrifold,
  Users,
  Warehouse,
} from "@/components/icons"

export enum NavigationEnums {
  DASHBOARD = "dashboard",
  DEVICES = "devices",
  MAPS = "maps",
  DIGITAL_TWIN = "digital-twin",
  USER = "user",
  WORKSPACE_SETTINGS = "/workspace-settings",
  PLAN_BILLING = "plan-billing",
}

export type Navigation = {
  href: `${NavigationEnums}`
  title: string
  icon?: React.ReactElement
  isDynamic?: boolean
}

export type DynamicLayout =
  | `${NavigationEnums.DASHBOARD}`
  | `${NavigationEnums.DEVICES}`
  | `${NavigationEnums.USER}`

export const navigations: Navigation[] = [
  {
    href: NavigationEnums.DASHBOARD,
    title: "Dashboard",
    icon: <CodeSandbox />,
    isDynamic: true,
  },
  {
    href: NavigationEnums.DEVICES,
    title: "Devices",
    icon: <Devices />,
    isDynamic: true,
  },
  {
    href: NavigationEnums.MAPS,
    title: "Maps",
    icon: <Maptrifold />,
    isDynamic: true,
  },
  {
    href: NavigationEnums.DIGITAL_TWIN,
    title: "Digital Twin",
    icon: <CubeFocus />,
    isDynamic: true,
  },
  {
    href: NavigationEnums.USER,
    title: "User",
    icon: <Users />,
    isDynamic: true,
  },
  {
    href: NavigationEnums.WORKSPACE_SETTINGS,
    title: "Workspace Settings",
    icon: <Warehouse />,
  },
  {
    href: NavigationEnums.PLAN_BILLING,
    title: "Plan and billing",
    icon: <CreditCard />,
  },
]

export const dynamicLayoutKeys: DynamicLayout[] = [
  NavigationEnums.DASHBOARD,
  NavigationEnums.DEVICES,
  NavigationEnums.USER,
]
