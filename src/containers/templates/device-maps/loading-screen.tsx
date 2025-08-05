import { Spinner } from '@/components/ui/spinner'
import React, { memo } from 'react'

const LoadingScreen = () => {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50">
      <div className="flex flex-col h-full gap-3 w-full items-center justify-center">
        <Spinner className="text-white" />
        <p className="text-white text-sm">Preparing maps resources...</p>
      </div>
    </div>
  )
}

export default memo(LoadingScreen)
