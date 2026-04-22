'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Pause, Play, RotateCcw, Minus, Plus } from 'lucide-react'
import { useThreeModelController } from '@/stores/template/three-model-controller'
import { Building, SettingIcon } from '@/components/icons'
import { DialogUpload } from '../dialog-upload'
import { DialogBuildingManagement } from '../dialog-building-management'
import { DialogAreaManagement } from '../dialog-area-management'
import { Building as BuildingType } from '@/types/building'
import { Area, Area as AreaType } from '@/types/area'
import { useAuthenticated } from '@/hooks/useAuthenticated'

interface ThreeModelControlsProps {
  className?: string
  refetch: () => void
  activeBuildingArea?: BuildingType | AreaType
}

export function ThreeModelControls({
  className,
  refetch,
  activeBuildingArea,
}: ThreeModelControlsProps) {
  const { zoomIn, zoomOut, resetView, autoRotate, setAutoRotate, hasControls } =
    useThreeModelController((s) => ({
      zoomIn: s.zoomIn,
      zoomOut: s.zoomOut,
      resetView: s.resetView,
      autoRotate: s.autoRotate,
      setAutoRotate: s.setAutoRotate,
      hasControls: Boolean(s.controls),
    }))

  const isArea = activeBuildingArea?.type === 'area'

  const isAuthenticated = useAuthenticated()

  if (!hasControls) return null

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
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

      {activeBuildingArea && (
        <ControlGroup>
          {isArea ? (
            <DialogAreaManagement
              area={activeBuildingArea as Area}
              refetch={refetch}
              trigger={
                <ControlButton label="Settings">
                  <SettingIcon className="size-4 text-brand-icon-light-fixed" />
                </ControlButton>
              }
            />
          ) : (
            <DialogBuildingManagement
              building={activeBuildingArea}
              refetch={refetch}
              trigger={
                <ControlButton label="Settings">
                  <SettingIcon className="size-4 text-brand-icon-light-fixed" />
                </ControlButton>
              }
            />
          )}
        </ControlGroup>
      )}
      {isAuthenticated && (
        <ControlGroup>
          <DialogUpload
            trigger={
              <ControlButton label="Switch building">
                <Building className="size-4 text-brand-icon-light-fixed" />
              </ControlButton>
            }
            refetch={refetch}
          />
        </ControlGroup>
      )}
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
          'flex items-center rounded-md justify-center size-8 hover:bg-brand-component-fill-dark/40 transition-colors shadow-inset-white border-brand-component-stroke-dark bg-brand-component-fill-dark dark:bg-brand-component-fill-secondary dark:hover:bg-brand-component-fill-secondary/40',
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
