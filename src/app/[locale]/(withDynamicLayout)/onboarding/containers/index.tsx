"use client"

import { MagicWand } from "@/components/icons/magic-wand"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useLayout } from "@/stores"
import { displayedRightDynamicLayout, getDynamicLayoutRight } from "@/utils"
import React, { memo } from "react"
import { useShallow } from "zustand/react/shallow"
import SelectTemplate from "./SelectTemplate"
import { useTranslations } from "next-intl"

const OnboardingContainer = () => {
  const t = useTranslations("onboarding")
  const commonTranslate = useTranslations("common")
  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))

  const rightDynamicLayout = getDynamicLayoutRight(dynamicLayouts)

  const { isShowAll } = displayedRightDynamicLayout(rightDynamicLayout)

  return (
    <div className="flex justify-center w-full mt-8">
      <div
        className={cn(
          "text-wrap flex-1 flex flex-col items-center duration-300",
          isShowAll ? "px-4" : "max-w-xl"
        )}
      >
        <p className="text-4xl text-center font-medium text-brand-heading dark:text-white">
          {t("welcome_title")}
        </p>

        <div className="mt-6 text-center">
          <Button size="xl">
            <div className="flex gap-2 items-center">
              {t("create_3d_from_2d")} <MagicWand />
            </div>
          </Button>
          <p className="text-[13px]  mt-2 text-center text-brand-text-gray">
            <span className="font-semibold text-brand-text-dark dark:text-brand-stroke-outermost">
              {t("click_to_upload")}
            </span>{" "}
            {commonTranslate("or")} {t("drag_drop")}
          </p>
          <p className="font-normal text-[13px] text-center text-brand-text-gray dark:text-brand-dark-text-gray">
            SVG, PTS, DWF, CDR, SKP, XCF, DWG, DXF {commonTranslate("or")} AI (
            {commonTranslate("max")}. 300 MB)
          </p>
        </div>

        <Separator
          orientation="horizontal"
          className="w-[70%] my-[72px] bg-brand-stroke-dark-soft"
        />

        <SelectTemplate />
      </div>
    </div>
  )
}

export default memo(OnboardingContainer)
