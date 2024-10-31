'use client'

import React, { PropsWithChildren } from 'react'

import { usePageTransition } from '@/hooks'
import { cn } from '@/lib/utils'
import LoadingFullScreen from '@/components/ui/loading-fullscreen'

const EffectLayout = ({ children }: PropsWithChildren) => {
  const { startRender } = usePageTransition({ duration: 1000 })

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        className={cn(
          'absolute inset-0 bg-white transition-all dark:bg-brand-fill-outermost',
          startRender && 'animate-hide-effect',
        )}
      >
        <LoadingFullScreen />
      </div>
      <div
        className={cn(
          'min-h-screen opacity-0',
          startRender && 'animate-display-effect opacity-100',
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default EffectLayout
