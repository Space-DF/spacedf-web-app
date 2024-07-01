import { RightSideBarLayout } from "@/components/ui"
import { Button } from "@/components/ui/button"
import { Nodata } from "@/components/ui/no-data"
import { useLayout } from "@/stores"
import { PlusIcon } from "@radix-ui/react-icons"
import React, { memo } from "react"
import { useShallow } from "zustand/react/shallow"

const Widgets = () => {
  const toggleDynamicLayout = useLayout(
    useShallow((state) => state.toggleDynamicLayout)
  )
  const setCookieDirty = useLayout(useShallow((state) => state.setCookieDirty))

  return (
    <RightSideBarLayout
      onClose={() => {
        setCookieDirty(true)
        toggleDynamicLayout("dashboard")
      }}
      title="Dashboard"
      headerButton={
        <Button size="default" className="rounded-lg gap-2">
          Add widget <PlusIcon />
        </Button>
      }
    >
      <Nodata content="No Data yet, let add some widget." />
    </RightSideBarLayout>
  )
}

export default memo(Widgets)
