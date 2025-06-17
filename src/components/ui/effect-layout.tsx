'use client'

import React, { PropsWithChildren, useEffect } from 'react'

import { usePageTransition } from '@/hooks'
import { cn } from '@/lib/utils'
import LoadingFullScreen from '@/components/ui/loading-fullscreen'
import { useShallow } from 'zustand/react/shallow'
import { useGlobalStore } from '@/stores'

const EffectLayout = ({ children }: PropsWithChildren) => {
  const { duration, resetLoadingState, isGlobalLoading } = useGlobalStore(
    useShallow((state) => state)
  )
  const { startRender } = usePageTransition({ duration: duration || 1000 })

  useEffect(() => {
    if (startRender) {
      setTimeout(() => {
        resetLoadingState()
      }, 1000)
    }
  }, [startRender])

  return (
    <div className="relative max-h-dvh w-full overflow-hidden">
      <div
        className={cn(
          'absolute inset-0 bg-white transition-all dark:bg-brand-fill-outermost',
          startRender && !isGlobalLoading && 'animate-hide-effect'
        )}
      >
        <LoadingFullScreen />
      </div>
      <div
        className={cn(
          'max-h-dvh opacity-0',
          startRender &&
            !isGlobalLoading &&
            'animate-display-effect opacity-100'
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default EffectLayout
