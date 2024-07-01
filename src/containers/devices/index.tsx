import { RightSideBarLayout } from "@/components/ui"
import { Button } from "@/components/ui/button"
import { Nodata } from "@/components/ui/no-data"
import { useLayout } from "@/stores"
import { PlusIcon } from "@radix-ui/react-icons"
import React, { memo } from "react"
import { useShallow } from "zustand/react/shallow"

const Devices = () => {
  const toggleDynamicLayout = useLayout(
    useShallow((state) => state.toggleDynamicLayout)
  )
  const setCookieDirty = useLayout(useShallow((state) => state.setCookieDirty))

  return (
    <RightSideBarLayout
      onClose={() => {
        setCookieDirty(true)
        toggleDynamicLayout("devices")
      }}
      title="Selected Devices"
    >
      <Nodata content="No Data yet, let add some device." />
      <div className="flex items-center justify-center">
        <Button size="default" className="rounded-lg gap-2 mt-3">
          Add device <PlusIcon />
        </Button>
      </div>
    </RightSideBarLayout>
  )
}

export default memo(Devices)
