'use client'

import { PropsWithChildren, useEffect, useMemo, useRef } from 'react'

import { COOKIES } from '@/constants'
import Dashboard from '@/containers/dashboard'
import Devices from '@/containers/devices'
import { cn } from '@/lib/utils'
import {
  DynamicLayout as TDynamicLayout,
  useGlobalStore,
  useLayout,
} from '@/stores'
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

  const { isMapInitialized, setIsMapBlur } = useGlobalStore(
    useShallow((state) => ({
      isMapInitialized: state.isMapInitialized,
      setIsMapBlur: state.setIsMapBlur,
    }))
  )

  useEffect(() => {
    setCollapsed(defaultCollapsed)
  }, [])

  useEffect(() => {
    setIsMapBlur(true)

    if (!isMapInitialized || !window.mapInstance) return
    if (resizeMapLayoutTimeOutId.current) {
      clearTimeout(resizeMapLayoutTimeOutId.current)
    }

    resizeMapLayoutTimeOutId.current = setTimeout(() => {
      const map = window.mapInstance.getMapInstance()
      map?.resize()
      setIsMapBlur(false)
    }, 300)
  }, [dynamicLayouts, isMapInitialized])

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
    setIsMapBlur(true)
    if (isMapInitialized && window.mapInstance) {
      if (resizeMapTimeOutId.current) {
        clearTimeout(resizeMapTimeOutId.current)
      }

      resizeMapTimeOutId.current = setTimeout(() => {
        const map = window.mapInstance.getMapInstance()
        map?.resize()
        setIsMapBlur(false)
      }, 300)
    }
    if (sizes[0] <= 8 && !isCollapsed) {
      setCollapsed(true)
      setCookie(COOKIES.SIDEBAR_COLLAPSED, true)
    } else if (sizes[0] > 8 && isCollapsed) {
      setCollapsed(false)
      setCookie(COOKIES.SIDEBAR_COLLAPSED, false)
    }

    setCookie(COOKIES.MAIN_LAYOUTS, sizes)
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
    // if (dynamicLayouts.includes('devices'))
    //   return (
    //     <div>
    //       <Dashboard />
    //     </div>
    //   )
    //
    // return <Users />
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
            defaultSize={defaultMainLayout[0]}
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
              <ResizablePanel defaultSize={defaultLayout[0]} minSize={40}>
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
                defaultSize={defaultLayout[0]}
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
                    defaultSize={defaultRightLayout[0]}
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
                    defaultSize={defaultRightLayout[1]}
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
