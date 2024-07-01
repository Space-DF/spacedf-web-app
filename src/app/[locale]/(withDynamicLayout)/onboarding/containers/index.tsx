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

const OnboardingContainer = () => {
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
        <p className="text-4xl text-center font-medium text-brand-heading">
          Congrats! Your Space is ready
        </p>

        <div className="mt-6 text-center">
          <Button size="xl">
            <div className="flex gap-2 items-center">
              Create 3D from your 2D <MagicWand />
            </div>
          </Button>
          <p className="text-[13px]  mt-2 text-center text-brand-text-gray">
            <span className="font-semibold text-brand-text-dark">
              Click to upload
            </span>{" "}
            or drag and drop
          </p>
          <p className="font-normal text-[13px] text-center text-brand-text-gray">
            SVG, PTS, DWF, CDR, SKP, XCF, DWG, DXF or AI (max. 300 MB)
          </p>
        </div>

        <Separator
          orientation="horizontal"
          className="w-[70%] my-[72px] bg-brand-strock-dark-soft"
        />

        <SelectTemplate />
      </div>
    </div>
  )
}

export default memo(OnboardingContainer)
