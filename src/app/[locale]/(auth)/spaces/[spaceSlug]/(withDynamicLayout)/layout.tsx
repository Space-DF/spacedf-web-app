import DynamicLayout from '@/components/layouts'
import { COOKIES } from '@/constants'
import { DynamicLayout as TDynamicLayout } from '@/stores'
import { getCookieServer } from '@/utils/server-actions'

export default function Layout(props: { children: React.ReactNode }) {
  const { children } = props

  const defaultLayout = getCookieServer(COOKIES.LAYOUTS, [50, 50])

  const defaultDynamicLayout = getCookieServer(
    COOKIES.DYNAMIC_LAYOUTS,
    [] as TDynamicLayout[],
  )

  const defaultRightLayout = getCookieServer(
    COOKIES.SUB_DYNAMIC_LAYOUTS,
    [50, 50],
  )

  const defaultMainLayout = getCookieServer(COOKIES.MAIN_LAYOUTS, [25, 75])
  const defaultCollapsed = getCookieServer(COOKIES.SIDEBAR_COLLAPSED, false)

  return (
    <DynamicLayout
      defaultLayout={defaultLayout}
      defaultDynamicLayout={defaultDynamicLayout}
      defaultRightLayout={defaultRightLayout}
      defaultMainLayout={defaultMainLayout}
      defaultCollapsed={defaultCollapsed}
    >
      {children}
    </DynamicLayout>
  )
}
