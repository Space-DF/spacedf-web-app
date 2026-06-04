'use client'

import { PropsWithChildren, useEffect, useMemo, useRef } from 'react'

import { COOKIES, NavigationEnums, RESPONSIVE_BREAKPOINTS } from '@/constants'
import Dashboard from '@/containers/dashboard'
import Devices from '@/containers/devices'
import { Geofences } from '@/containers/geofences'
import { useResponsiveCollapseThreshold } from '@/hooks/use-responsive-collapse-threshold'
import { useResponsiveLayout } from '@/hooks/use-responsive-layout'
import { cn } from '@/lib/utils'
import { DynamicLayout as TDynamicLayout, useLayout } from '@/stores'
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
import { useWindowSize } from '@/hooks/useWindowSize'
import { useGeofenceStore } from '@/stores/geofence-store'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'
import { FeatureId } from '@/types/geofence'
import { useMounted } from '@/hooks'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDeviceStore } from '@/stores/device-store'
import { getNewLayouts } from '@/stores'

type DynamicLayoutProps = {
  defaultLayout: number[]
  defaultDynamicLayout: TDynamicLayout[]
  defaultRightLayout: number[]
  defaultMainLayout: number[]
  defaultCollapsed: boolean
} & PropsWithChildren

const calculateCollapsedLayout = () => {
  const maxLeftCollapsedSize = 50 //max left size when collapsed with pixels value
  const percentMaxLeftCollapsedSize =
    (maxLeftCollapsedSize / window.innerWidth) * 100
  const finalLeftSize = Math.min(percentMaxLeftCollapsedSize, 4)
  return [finalLeftSize, 100 - finalLeftSize]
}

interface DynamicLayoutContentProps {
  panelType: string | null
}

const DynamicLayoutContent = ({ panelType }: DynamicLayoutContentProps) => {
  switch (panelType) {
    case NavigationEnums.GEOFENCES:
      return <Geofences />
    case NavigationEnums.DEVICES:
      return <Devices />
    case NavigationEnums.DASHBOARD:
    case NavigationEnums.USER:
      return <Dashboard />
    default:
      return null
  }
}

const mapInstance = MapInstance.getInstance()

const DynamicLayout = ({
  children,
  defaultLayout,
  defaultDynamicLayout,
  defaultRightLayout,
  defaultMainLayout,
  defaultCollapsed,
}: DynamicLayoutProps) => {
  const dynamicLayouts = useLayout(useShallow((state) => state.dynamicLayouts))

  const isCollapsed = useLayout((state) => state.isCollapsed)
  const setCollapsed = useLayout((state) => state.setCollapsed)
  const cookieDirty = useLayout((state) => state.cookieDirty)

  const resetGeofenceStore = useGeofenceStore((state) => state.reset)
  const setDeviceSelected = useDeviceStore((state) => state.setDeviceSelected)
  const { toggleDynamicLayout, isAlreadySetLayout } = useLayout(
    useShallow((state) => ({
      toggleDynamicLayout: state.toggleDynamicLayout,
      isAlreadySetLayout: state.isAlreadySetLayout,
    }))
  )
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const deviceId = searchParams.get('device_id')
  const isFirstTimeRef = useRef(true)
  useEffect(() => {
    if (!isAlreadySetLayout || !isFirstTimeRef.current) return
    if (!deviceId) return

    setDeviceSelected(deviceId)

    const isDeviceShow = dynamicLayouts.includes(NavigationEnums.DEVICES)
    if (!isDeviceShow) {
      const newLayout = getNewLayouts(dynamicLayouts, NavigationEnums.DEVICES)
      setCookie(COOKIES.DYNAMIC_LAYOUTS, newLayout)
      toggleDynamicLayout(NavigationEnums.DEVICES)
    }

    isFirstTimeRef.current = false
    const nextSearchParams = new URLSearchParams(searchParams.toString())
    nextSearchParams.delete('device_id')
    const nextQuery = nextSearchParams.toString()
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    })
  }, [
    deviceId,
    dynamicLayouts,
    isAlreadySetLayout,
    pathname,
    router,
    searchParams,
    setDeviceSelected,
    toggleDynamicLayout,
  ])

  useEffect(() => {
    setCollapsed(defaultCollapsed)
  }, [])

  const prevLayouts = useRef<TDynamicLayout[]>([])

  const refs = useRef<ImperativePanelGroupHandle | null>(null)
  const rightLayoutRefs = useRef<ImperativePanelGroupHandle | null>(null)
  const mainLayoutRefs = useRef<ImperativePanelGroupHandle | null>(null)

  const dynamicLayoutRight = useMemo(
    () => getDynamicLayoutRight(dynamicLayouts as NavigationEnums[]),
    [dynamicLayouts]
  )

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

  const { width } = useWindowSize()

  const { mounted } = useMounted()

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

    refs.current?.setLayout(parentLayout)
    rightLayoutRefs.current?.setLayout(rightLayout)
  }

  const handleRightLayoutChange = (sizes: number[]) => {
    setCookie(COOKIES.SUB_DYNAMIC_LAYOUTS, sizes)
  }

  const handleDynamicLayoutChanges = (sizes: number[]) =>
    setCookie(COOKIES.LAYOUTS, sizes)

  const handleMainLayoutChanges = (sizes: number[]) => {
    // Use responsive collapse threshold from hook (updates with screen size changes)
    if (sizes[0] < collapseThreshold) {
      setCollapsed(true)
      setCookie(COOKIES.SIDEBAR_COLLAPSED, true)
      const collapsedLayout = calculateCollapsedLayout()
      mainLayoutRefs.current?.setLayout(collapsedLayout)
      setCookie(COOKIES.MAIN_LAYOUTS, collapsedLayout)
    } else if (sizes[0] > collapseThreshold && isCollapsed) {
      setCookie(COOKIES.MAIN_LAYOUTS, sizes)
      setCollapsed(false)
      setCookie(COOKIES.SIDEBAR_COLLAPSED, false)
      mainLayoutRefs.current?.setLayout([sidebarWidth, mainWidth])
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleResize = () => {
      const screenWidth = window.innerWidth
      if (screenWidth < RESPONSIVE_BREAKPOINTS.TABLET) {
        setCollapsed(true)
        setCookie(COOKIES.SIDEBAR_COLLAPSED, true)
        const collapsedLayout = calculateCollapsedLayout()
        mainLayoutRefs.current?.setLayout(collapsedLayout)
        setCookie(COOKIES.MAIN_LAYOUTS, collapsedLayout)
      } else {
        setCollapsed(false)
        setCookie(COOKIES.SIDEBAR_COLLAPSED, false)
        mainLayoutRefs.current?.setLayout([sidebarWidth, mainWidth])
        setCookie(COOKIES.MAIN_LAYOUTS, [sidebarWidth, mainWidth])
      }
    }

    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isTablet = mounted && width > RESPONSIVE_BREAKPOINTS.TABLET

  //todo: need to refactor this code -> 36, 25 need to move to the constants
  const minRightSize = useMemo(() => {
    const { first, second, isShowAll } =
      displayedRightDynamicLayout(dynamicLayoutRight)

    if (isShowAll) return 50

    if (first || second) return 25

    return 0
  }, [dynamicLayoutRight])

  const { isShowAll, second, first, left, right } =
    displayedRightDynamicLayout(dynamicLayoutRight)

  const maxRightSize = useMemo(() => {
    if (typeof window === 'undefined') return 60
    const maxRightWidth = 900
    return (maxRightWidth / window.innerWidth) * 100
  }, [dynamicLayoutRight])

  const maxLeftSize = useMemo(() => {
    if (typeof window === 'undefined') return 30
    const maxLeftWidth = 400
    return (maxLeftWidth / window.innerWidth) * 100
  }, [dynamicLayoutRight])

  const minLeftSize = useMemo(() => {
    if (typeof window === 'undefined') return 4
    const minLeftWidth = 50

    return (minLeftWidth / window.innerWidth) * 100
  }, [dynamicLayoutRight])

  const isGeofencesActive = dynamicLayoutRight.includes(
    NavigationEnums.GEOFENCES
  )

  useEffect(() => {
    const draw = mapInstance.getTerraDraw()
    if (!isGeofencesActive) {
      resetGeofenceStore()
      const snapshot = draw?.getSnapshot()
      if (!snapshot?.length) return
      const features = snapshot.reduce<FeatureId[]>((acc, f) => {
        if (f.properties?.mode !== 'select') acc.push(f.id as FeatureId)
        return acc
      }, [])
      draw?.removeFeatures(features)
      draw?.setMode('render')
    }
  }, [isGeofencesActive])

  return (
    <EffectLayout>
      <div className="flex h-dvh max-w-full min-h-0 overflow-hidden">
        <ResizablePanelGroup
          onLayout={handleMainLayoutChanges}
          direction="horizontal"
          ref={mainLayoutRefs}
        >
          <ResizablePanel
            minSize={minLeftSize}
            maxSize={maxLeftSize}
            defaultSize={sidebarWidth}
            className="duration-200"
          >
            <Sidebar ref={mainLayoutRefs} />
          </ResizablePanel>
          <ResizableHandle disabled={!isTablet} />
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
                minSize={minRightSize}
                maxSize={maxRightSize}
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
                      'bg-background',
                      first
                        ? 'animate-opacity-display-effect'
                        : 'animate-opacity-hide-effect'
                    )}
                    hidden={!first}
                  >
                    <DynamicLayoutContent panelType={left} />
                  </ResizablePanel>
                  {isShowAll && <ResizableHandle />}
                  <ResizablePanel
                    defaultSize={mainWidth}
                    minSize={second ? 45 : 0}
                    className={cn(
                      'bg-background',
                      second
                        ? 'animate-opacity-display-effect'
                        : 'animate-opacity-hide-effect'
                    )}
                    hidden={!second}
                  >
                    <DynamicLayoutContent panelType={right} />
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
