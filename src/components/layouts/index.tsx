'use client'

import { PropsWithChildren, useEffect, useMemo, useRef } from 'react'

import { COOKIES } from '@/constants'
import Dashboard from '@/containers/dashboard'
import Devices from '@/containers/devices'
import { useResponsiveLayout } from '@/hooks/use-responsive-layout'
import { useResponsiveCollapseThreshold } from '@/hooks/use-responsive-collapse-threshold'
import { cn } from '@/lib/utils'
import { DynamicLayout as TDynamicLayout, useLayout } from '@/stores'
import { useDeviceMapsStore } from '@/stores/template/device-maps'
import {
  checkDisplayedDynamicLayout,
  displayedRightDynamicLayout,
  getDynamicLayoutRight,
  setCookie,
} from '@/utils'
import { ImperativePanelGroupHandle } from 'react-resizable-panels'
import { useShallow } from 'zustand/react/shallow'
import EffectLayout from '../ui/effect-layout'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '../ui/resizable'
import Sidebar from './sidebar'

type DynamicLayoutProps = {
  defaultLayout: number[]
  defaultDynamicLayout: TDynamicLayout[]
  defaultRightLayout: number[]
  defaultMainLayout: number[]
  defaultCollapsed: boolean
} & PropsWithChildren

const COLLAPSED_LAYOUT = [4, 96]

const DynamicLayout = ({
  children,
  defaultLayout,
  defaultDynamicLayout,
  defaultRightLayout,
  defaultMainLayout,
  defaultCollapsed,
}: DynamicLayoutProps) => {
  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))

  const cookieDirty = useLayout(useShallow((state) => state.cookieDirty))
  const isCollapsed = useLayout(useShallow((state) => state.isCollapsed))
  const setCollapsed = useLayout(useShallow((state) => state.setCollapsed))

  const resizeMapTimeOutId = useRef<NodeJS.Timeout | null>(null)
  const resizeMapLayoutTimeOutId = useRef<NodeJS.Timeout | null>(null)

  const { map, isMapReady } = useDeviceMapsStore(
    useShallow((state) => ({ map: state.map, isMapReady: state.isMapReady }))
  )

  useEffect(() => {
    setCollapsed(defaultCollapsed)
  }, [])

  useEffect(() => {
    if (isMapReady) {
      if (resizeMapLayoutTimeOutId.current) {
        clearTimeout(resizeMapLayoutTimeOutId.current)
      }

      if (map?.getContainer()?.style) {
        map.getContainer().style.animationDuration = '0.5s'
        map.getContainer().style.opacity = '0.5'
        map.getContainer().style.filter = 'blur(10px)'
      }

      resizeMapLayoutTimeOutId.current = setTimeout(() => {
        map?.resize()

        if (map?.getContainer()?.style) {
          map.getContainer().style.animationDuration = '0.5s'
          map.getContainer().style.opacity = '1'
          map.getContainer().style.filter = 'blur(0px)'
        }
      }, 500)
    }
  }, [JSON.stringify(dynamicLayouts), isMapReady])

  const prevLayouts = useRef<TDynamicLayout[]>([])

  const refs = useRef<ImperativePanelGroupHandle | null>(null)
  const rightLayoutRefs = useRef<ImperativePanelGroupHandle | null>(null)
  const mainLayoutRefs = useRef<ImperativePanelGroupHandle | null>(null)

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
  const [sidebarWidth, mainWidth] = useResponsiveLayout(defaultMainLayout)
  const collapseThreshold = useResponsiveCollapseThreshold()

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

  const handleRightLayoutChange = (sizes: number[]) => {
    setCookie(COOKIES.SUB_DYNAMIC_LAYOUTS, sizes)
  }

  const handleDynamicLayoutChanges = (sizes: number[]) =>
    setCookie(COOKIES.LAYOUTS, sizes)

  const handleMainLayoutChanges = (sizes: number[]) => {
    if (isMapReady) {
      if (resizeMapTimeOutId.current) {
        clearTimeout(resizeMapTimeOutId.current)
      }

      if (map?.getContainer()?.style) {
        map.getContainer().style.animationDuration = '0.5s'
        map.getContainer().style.opacity = '0.5'
        map.getContainer().style.filter = 'blur(10px)'
        map.getContainer().style.zIndex = '100'
      }

      resizeMapTimeOutId.current = setTimeout(() => {
        map?.resize()

        if (map?.getContainer()?.style) {
          map.getContainer().style.animationDuration = '0.5s'
          map.getContainer().style.opacity = '1'
          map.getContainer().style.filter = 'blur(0px)'
          map.getContainer().style.zIndex = '0'
        }
      }, 500)
    }

    // Use responsive collapse threshold from hook (updates with screen size changes)
    if (sizes[0] <= collapseThreshold) {
      setCollapsed(true)
      setCookie(COOKIES.SIDEBAR_COLLAPSED, true)
      mainLayoutRefs.current?.setLayout(COLLAPSED_LAYOUT)
      setCookie(COOKIES.MAIN_LAYOUTS, COLLAPSED_LAYOUT)
    } else if (sizes[0] > collapseThreshold && isCollapsed) {
      setCookie(COOKIES.MAIN_LAYOUTS, sizes)
      setCollapsed(false)
      setCookie(COOKIES.SIDEBAR_COLLAPSED, false)
    }
  }

  //todo: need to refactor this code -> 36, 25 need to move to the constants
  const getRightMinSize = () => {
    const { first, second, isShowAll } =
      displayedRightDynamicLayout(dynamicLayoutRight)

    if (isShowAll) return 50

    if (first || second) return 25

    return 0
  }

  const layoutCannotDuplicate = useMemo(() => {
    return <Dashboard />
  }, [dynamicLayouts])

  const { isShowAll, second, first } =
    displayedRightDynamicLayout(dynamicLayoutRight)

  return (
    <EffectLayout>
      <div className="flex max-h-screen max-w-full overflow-hidden">
        <ResizablePanelGroup
          onLayout={handleMainLayoutChanges}
          direction="horizontal"
          ref={mainLayoutRefs}
        >
          <ResizablePanel
            minSize={4}
            maxSize={18}
            defaultSize={sidebarWidth}
            className="duration-200"
          >
            <Sidebar ref={mainLayoutRefs} />
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel>
            <ResizablePanelGroup
              direction="horizontal"
              className="min-h-screen w-full overflow-auto"
              onLayout={handleDynamicLayoutChanges}
              ref={refs}
              id="group"
            >
              <ResizablePanel defaultSize={mainWidth} minSize={40}>
                <div
                  className="relative flex h-full max-h-screen overflow-auto bg-brand-fill-surface text-sm dark:bg-brand-heading"
                  id="ele-main-content"
                >
                  {children}
                </div>
              </ResizablePanel>

              <ResizableHandle
                className={cn(
                  'duration-300',
                  isDisplayDynamicLayout ? 'opacity-100' : 'h-0 w-0 opacity-0'
                )}
              />

              <ResizablePanel
                defaultSize={sidebarWidth}
                className={cn(
                  'transition-all duration-300',
                  isDisplayDynamicLayout ? 'opacity-100' : 'h-0 w-0 opacity-0'
                )}
                minSize={getRightMinSize()}
                maxSize={60}
              >
                <ResizablePanelGroup
                  direction="horizontal"
                  ref={rightLayoutRefs}
                  onLayout={handleRightLayoutChange}
                  id="region-dynamic-layout"
                >
                  <ResizablePanel
                    defaultSize={mainWidth}
                    minSize={first ? 45 : 0}
                    className={cn(
                      'bg-brand-fill-surface dark:bg-brand-fill-outermost',
                      first
                        ? 'animate-opacity-display-effect'
                        : 'animate-opacity-hide-effect'
                    )}
                    hidden={!first}
                  >
                    <Devices />
                  </ResizablePanel>
                  {isShowAll && <ResizableHandle />}
                  <ResizablePanel
                    defaultSize={mainWidth}
                    minSize={second ? 45 : 0}
                    className={cn(
                      'bg-brand-fill-surface dark:bg-brand-fill-outermost',
                      second
                        ? 'animate-opacity-display-effect'
                        : 'animate-opacity-hide-effect'
                    )}
                    hidden={!second}
                  >
                    {layoutCannotDuplicate}
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </EffectLayout>
  )
}

export default DynamicLayout
