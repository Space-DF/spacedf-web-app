'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useFleetTrackingMapStore } from '@/stores/template/fleet-tracking-map'
import { memo, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { STORAGE_KEYS } from '../constant/storage'

const VIEW_MODE_OPTIONS = {
  '2d': '2D',
  '3d': '3D',
}

export const ViewModeToggle = memo(() => {
  const { viewMode, setViewMode } = useFleetTrackingMapStore(
    useShallow((state) => ({
      viewMode: state.viewMode,
      setViewMode: state.setViewMode,
    }))
  )

  useEffect(() => {
    const resolvedViewMode =
      localStorage.getItem(STORAGE_KEYS.FLEET_TRACKING_VIEW_MODE) || '2d'
    setViewMode(resolvedViewMode as '2d' | '3d')
  }, [])

  const handleViewModeChange = (value: '2d' | '3d') => {
    if (value === viewMode) return

    localStorage.setItem(STORAGE_KEYS.FLEET_TRACKING_VIEW_MODE, value)
    setViewMode(value)
  }

  return (
    <ToggleGroup
      type="single"
      className="view-mode-control h-8 pointer-events-auto flex gap-0 rounded-button border border-border bg-org-switch-background p-1 dark:bg-brand-heading"
      defaultValue={viewMode}
      onValueChange={handleViewModeChange}
      value={viewMode}
    >
      {Object.entries(VIEW_MODE_OPTIONS).map(([value, label]) => (
        <ToggleGroupItem
          key={value}
          disabled={value === viewMode}
          value={value}
          aria-label={label}
          className="flex flex-1 cursor-pointer items-center h-6 justify-center gap-2 !rounded-[calc(var(--button-radius)-4px)] bg-transparent p-1 text-muted-foreground duration-300 hover:bg-transparent disabled:cursor-not-allowed disabled:opacity-100 data-[state=on]:bg-background data-[state=on]:text-foreground"
        >
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
})

ViewModeToggle.displayName = 'ViewModeToggle'
