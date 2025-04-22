import { cn } from '@/lib/utils'
import React from 'react'

interface LoadingDotsProps {
  isOutlined?: boolean
}

const DELAYS = [300, 500, 700]

export const LoadingDots = ({ isOutlined = false }: LoadingDotsProps) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 3 }).map((_, index) => (
        <span
          key={index}
          className={cn(
            'h-2 w-2 animate-loading-blink rounded-full',
            isOutlined ? 'bg-black' : 'bg-white',
            `delay-${DELAYS[index]}`
          )}
        />
      ))}
    </div>
  )
}
