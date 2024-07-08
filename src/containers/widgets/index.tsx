import { RightSideBarLayout } from "@/components/ui"
import { Button } from "@/components/ui/button"
import { Nodata } from "@/components/ui/no-data"
import { useLayout } from "@/stores"
import { uppercaseFirstLetter } from "@/utils"
import { PlusIcon } from "@radix-ui/react-icons"
import { useTranslations } from "next-intl"
import React, { memo } from "react"
import { useShallow } from "zustand/react/shallow"

const Widgets = () => {
  const t = useTranslations("common")

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
      title={t("dashboard")}
      headerButton={
        <Button size="default" className="rounded-lg gap-2">
          {uppercaseFirstLetter(t("add"))} {t("widget")} <PlusIcon />
        </Button>
      }
    >
      <Nodata content={t("nodata", { module: t("widget") })} />
    </RightSideBarLayout>
  )
}

export default memo(Widgets)
