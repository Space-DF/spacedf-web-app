'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Pause, Play, RotateCcw, Minus, Plus } from 'lucide-react'
import { useThreeModelController } from '@/stores/template/three-model-controller'

interface ThreeModelControlsProps {
  className?: string
}

export function ThreeModelControls({ className }: ThreeModelControlsProps) {
  const { zoomIn, zoomOut, resetView, autoRotate, setAutoRotate, hasControls } =
    useThreeModelController((s) => ({
      zoomIn: s.zoomIn,
      zoomOut: s.zoomOut,
      resetView: s.resetView,
      autoRotate: s.autoRotate,
      setAutoRotate: s.setAutoRotate,
      hasControls: Boolean(s.controls),
    }))

  if (!hasControls) return null

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <ControlGroup>
        <ControlButton onClick={zoomIn} label="Zoom in">
          <Plus className="size-4 text-primary-foreground" />
        </ControlButton>
        <ControlButton onClick={zoomOut} label="Zoom out">
          <Minus className="size-4 text-primary-foreground" />
        </ControlButton>
      </ControlGroup>

      <ControlGroup>
        <ControlButton onClick={resetView} label="Reset view">
          <RotateCcw className="size-4 text-primary-foreground" />
        </ControlButton>
      </ControlGroup>

      <ControlGroup>
        <ControlButton
          onClick={() => setAutoRotate(!autoRotate)}
          label={autoRotate ? 'Stop auto rotate' : 'Auto rotate'}
        >
          {autoRotate ? (
            <Pause className="size-4 text-primary-foreground" />
          ) : (
            <Play className="size-4 text-primary-foreground" />
          )}
        </ControlButton>
      </ControlGroup>
    </div>
  )
}

function ControlGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md shadow-sm overflow-hidden grid grid-cols-1 gap-y-0.5 p-0.5">
      {children}
    </div>
  )
}

const ControlButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    label: string
  }
>(
  (
    { onClick, label, children, disabled = false, className, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        aria-label={label}
        type="button"
        className={cn(
          'flex items-center rounded-button justify-center size-8 hover:bg-primary/40 transition-colors shadow-inset-white border-primary bg-primary',
          disabled && 'opacity-50 pointer-events-none cursor-not-allowed',
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)
ControlButton.displayName = 'ControlButton'
