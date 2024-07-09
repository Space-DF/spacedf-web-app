"use client"

import React, { PropsWithChildren } from "react"

import { usePageTransition } from "@/hooks"
import { cn } from "@/lib/utils"
import LoadingFullScreen from "@/components/ui/loading-fullscreen"

const EffectLayout = ({ children }: PropsWithChildren) => {
  const [startRender] = usePageTransition({ duation: 1000 })

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <div
        className={cn(
          "absolute inset-0 transition-all bg-white dark:bg-brand-fill-outermost",
          startRender && "animate-hide-effect"
        )}
      >
        <LoadingFullScreen />
      </div>
      <div
        className={cn(
          "min-h-screen opacity-0",
          startRender && "animate-display-effect opacity-100"
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default EffectLayout
