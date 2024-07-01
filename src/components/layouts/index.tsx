/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { PropsWithChildren, useEffect, useRef } from "react"

import { COOKIES } from "@/constants"
import Devices from "@/containers/devices"
import Widgets from "@/containers/widgets"
import { cn } from "@/lib/utils"
import { DynamicLayout as TDynamicLayout, useLayout } from "@/stores"
import {
  checkDisplayedDynamicLayout,
  displayedRightDynamicLayout,
  getDynamicLayoutRight,
  setCookie,
} from "@/utils"
import { ImperativePanelGroupHandle } from "react-resizable-panels"
import { useShallow } from "zustand/react/shallow"
import EffectLayout from "../ui/effect-layout"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable"
import Sidebar from "./sidebar"

type DynamicLayoutProps = {
  defaultLayout: number[]
  defaultDynamicLayout: TDynamicLayout[]
  defaultRightLayout: number[]
} & PropsWithChildren

const DynamicLayout = ({
  children,
  defaultLayout,
  defaultDynamicLayout,
  defaultRightLayout,
}: DynamicLayoutProps) => {
  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))
  const cookieDirty = useLayout(useShallow((state) => state.cookieDirty))
  const prevLayouts = useRef<TDynamicLayout[]>([])

  const refs = useRef<ImperativePanelGroupHandle | null>(null)
  const rightLayoutRefs = useRef<ImperativePanelGroupHandle | null>(null)

  const handleMainLayoutChange = (sizes: number[]) =>
    setCookie(COOKIES.LAYOUTS, sizes)

  const dynamicLayoutRight = getDynamicLayoutRight(dynamicLayouts)

  const isDisplayDynamicLayout = !!dynamicLayoutRight.length

  useEffect(() => {
    if (!cookieDirty) {
      handleSetDataFromCookie()
    } else {
      handleSetDynamicLayout()
    }
    prevLayouts.current = dynamicLayoutRight
  }, [cookieDirty, dynamicLayoutRight])

  const handleSetDataFromCookie = () => {
    const isDefaultDisplayed = checkDisplayedDynamicLayout(
      defaultDynamicLayout as any
    )

    if (isDefaultDisplayed) {
      refs.current?.setLayout(defaultLayout)
      rightLayoutRefs.current?.setLayout(defaultRightLayout)
    } else {
      refs.current?.setLayout([100, 0])
    }
  }

  const handleSetDynamicLayout = () => {
    if (!prevLayouts.current.length && dynamicLayoutRight.length)
      return handleRightLayout()

    if (isDisplayDynamicLayout) {
      handleRightLayout()
      rightLayoutRefs.current?.setLayout(rightLayoutRefs.current?.getLayout())
      refs.current?.setLayout(refs.current?.getLayout())
      return
    }

    refs.current?.setLayout([100, 0])
  }

  //todo: need to optimization this code of this function
  const handleRightLayout = () => {
    const { first, second, isShowAll } =
      displayedRightDynamicLayout(dynamicLayoutRight)

    let parentLayout = [100, 0]
    let rightLayout = [100, 0]

    if (isShowAll) {
      refs.current?.setLayout([50, 50])
      rightLayoutRefs.current?.setLayout([50, 50])

      return
    }

    if (first && !second) {
      parentLayout = [75, 25]
      rightLayout = [100, 0]
    }
    if (!first && second) {
      parentLayout = [75, 25]
      rightLayout = [0, 100]
    }

    refs.current?.setLayout(parentLayout)
    rightLayoutRefs.current?.setLayout(rightLayout)
  }

  const handleRightLayoutChange = (sizes: number[]) =>
    setCookie(COOKIES.SUB_DYNAMIC_LAYOUTS, sizes)

  //todo: need to refactor this code -> 36, 25 need to move to the constants
  const getRightMinSize = () => {
    const { first, second, isShowAll } =
      displayedRightDynamicLayout(dynamicLayoutRight)

    if (isShowAll) return 36

    if (first || second) return 25

    return 0
  }

  const { isShowAll } = displayedRightDynamicLayout(dynamicLayoutRight)

  return (
    <EffectLayout>
      <div className="flex">
        <Sidebar />
        <ResizablePanelGroup
          direction="horizontal"
          className="w-full min-h-screen"
          onLayout={handleMainLayoutChange}
          ref={refs}
          id="group"
        >
          <ResizablePanel defaultSize={defaultLayout[0]} minSize={40}>
            <div className="flex h-full">{children}</div>
          </ResizablePanel>

          <ResizableHandle
            className={cn(
              "duration-300",
              isDisplayDynamicLayout ? "opacity-100" : "w-0 h-0 opacity-0"
            )}
          />

          <ResizablePanel
            defaultSize={defaultLayout[1]}
            className={cn(
              "duration-300 transition-all",
              isDisplayDynamicLayout ? "opacity-100" : "w-0 h-0 opacity-0"
            )}
            minSize={getRightMinSize()}
            maxSize={60}
          >
            <ResizablePanelGroup
              direction="horizontal"
              ref={rightLayoutRefs}
              onLayout={handleRightLayoutChange}
              className="duration-700"
            >
              <ResizablePanel defaultSize={defaultRightLayout[0]}>
                <Widgets />
              </ResizablePanel>
              {isShowAll && <ResizableHandle />}
              <ResizablePanel defaultSize={defaultRightLayout[1]}>
                <Devices />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </EffectLayout>
  )
}

export default DynamicLayout
