import DynamicLayout from "@/components/layouts"
import { COOKIES } from "@/constants"
import { DynamicLayout as TDynamicLayout } from "@/stores"
import { getCookieServer } from "@/utils/server-actions"

export default function Layout(props: { children: React.ReactNode }) {
  const { children } = props

  const defaultLayout = getCookieServer(COOKIES.LAYOUTS, [50, 50])

  const defaultDynamicLayout = getCookieServer(
    COOKIES.DYNAMIC_LAYOUTS,
    [] as TDynamicLayout[]
  )

  const defaultRightLayout = getCookieServer(
    COOKIES.SUB_DYNAMIC_LAYOUTS,
    [50, 50]
  )

  return (
    <DynamicLayout
      defaultLayout={defaultLayout}
      defaultDynamicLayout={defaultDynamicLayout}
      defaultRightLayout={defaultRightLayout}
    >
      {children}
    </DynamicLayout>
  )
}
