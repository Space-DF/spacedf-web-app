import React from 'react'
import { cn } from '@/lib/utils'
import { Logo } from './logo'

const LoadingFullScreen = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'pointer-events-none flex size-full flex-col items-center justify-center',
        className,
      )}
    >
      <div className="size-48">
        <Logo />
      </div>
    </div>
  )
}

export default LoadingFullScreen
