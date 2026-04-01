'use client'

import { DismissableLayerBranch } from '@radix-ui/react-dismissable-layer'
import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from 'react'

type AutomationDialogPopoverPortalContextValue = {
  popoverPortalContainerRef: MutableRefObject<HTMLElement | null>
  setPopoverPortalContainer: (el: HTMLElement | null) => void
}

const AutomationDialogPopoverPortalContext = createContext<
  AutomationDialogPopoverPortalContextValue | undefined
>(undefined)

export function AutomationDialogPopoverPortalProvider({
  children,
}: {
  children: ReactNode
}) {
  const popoverPortalContainerRef = useRef<HTMLElement | null>(null)

  const setPopoverPortalContainer = useCallback((el: HTMLElement | null) => {
    popoverPortalContainerRef.current = el
  }, [])

  const value = useMemo(
    () => ({ popoverPortalContainerRef, setPopoverPortalContainer }),
    [popoverPortalContainerRef, setPopoverPortalContainer]
  )

  return (
    <AutomationDialogPopoverPortalContext.Provider value={value}>
      {children}
    </AutomationDialogPopoverPortalContext.Provider>
  )
}

export function useAutomationDialogPopoverPortal() {
  return useContext(AutomationDialogPopoverPortalContext)
}

export function PopoverPortalAnchor() {
  const ctx = useAutomationDialogPopoverPortal()
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!ctx) return
    const el = ref.current
    ctx.setPopoverPortalContainer(el)
    return () => ctx.setPopoverPortalContainer(null)
  }, [ctx])

  if (!ctx) return null

  return (
    <DismissableLayerBranch
      ref={ref}
      className="size-0 overflow-visible [&>*]:pointer-events-auto"
    />
  )
}
