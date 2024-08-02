import React from "react"

export const LoadingDots = () => {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 rounded-full bg-white animate-loading-blink delay-300" />
      <span className="w-2 h-2 rounded-full bg-white  animate-loading-blink delay-500" />
      <span className="w-2 h-2 rounded-full bg-white  animate-loading-blink delay-700" />
    </div>
  )
}
