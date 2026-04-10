'use client'

import { cn } from '@/lib/utils'
import { Pause, Play, RotateCcw, Minus, Plus } from 'lucide-react'
import { useThreeModelController } from '@/stores/template/three-model-controller'

export function ThreeModelControls({ className }: { className?: string }) {
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
    <div
      className={cn(
        'absolute z-10 flex flex-col gap-1.5 top-3 right-3',
        className
      )}
    >
      <ControlGroup>
        <ControlButton onClick={zoomIn} label="Zoom in">
          <Plus className="size-4 text-brand-icon-light-fixed" />
        </ControlButton>
        <ControlButton onClick={zoomOut} label="Zoom out">
          <Minus className="size-4 text-brand-icon-light-fixed" />
        </ControlButton>
      </ControlGroup>

      <ControlGroup>
        <ControlButton onClick={resetView} label="Reset view">
          <RotateCcw className="size-4 text-brand-icon-light-fixed" />
        </ControlButton>
      </ControlGroup>

      <ControlGroup>
        <ControlButton
          onClick={() => setAutoRotate(!autoRotate)}
          label={autoRotate ? 'Stop auto rotate' : 'Auto rotate'}
        >
          {autoRotate ? (
            <Pause className="size-4 text-brand-icon-light-fixed" />
          ) : (
            <Play className="size-4 text-brand-icon-light-fixed" />
          )}
        </ControlButton>
      </ControlGroup>
    </div>
  )
}

function ControlGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md bg-brand-component-stroke-dark shadow-sm overflow-hidden grid grid-cols-1 gap-y-0.5 p-0.5">
      {children}
    </div>
  )
}

function ControlButton({
  onClick,
  label,
  children,
  disabled = false,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      type="button"
      className={cn(
        'flex items-center rounded-md justify-center size-8 hover:bg-brand-component-fill-dark/40 transition-colors shadow-inset-white border-brand-component-stroke-dark bg-brand-component-fill-dark dark:bg-brand-component-fill-secondary dark:hover:bg-brand-component-fill-secondary/40',
        disabled && 'opacity-50 pointer-events-none cursor-not-allowed'
      )}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
