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
      className="gap-0 absolute top-3 right-16 view-mode-control z-[2] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-1 rounded-lg shadow-sm"
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
          className="data-[state=on]:bg-brand-dark-fill-secondary data-[state=on]:text-white rounded-lg disabled:opacity-100 disabled:cursor-not-allowed"
        >
          {label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
})

ViewModeToggle.displayName = 'ViewModeToggle'
