import React from 'react'

export const LoadingDots = () => {
  return (
    <div className="flex items-center gap-1">
      <span className="h-2 w-2 animate-loading-blink rounded-full bg-white delay-300" />
      <span className="h-2 w-2 animate-loading-blink rounded-full bg-white delay-500" />
      <span className="h-2 w-2 animate-loading-blink rounded-full bg-white delay-700" />
    </div>
  )
}
