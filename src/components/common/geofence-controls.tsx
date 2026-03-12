'use client'

import { cn } from '@/lib/utils'
import {
  Circle,
  Delete,
  Diamond,
  MousePointer2,
  Square,
  Trash2,
} from 'lucide-react'
import Image from 'next/image'
import { useGeofenceStore } from '@/stores/geofence-store'
import { useShallow } from 'zustand/react/shallow'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'
import { GeofenceTool } from '@/stores/geofence-store'
import { useCallback, useEffect, useState } from 'react'
import { FeatureId } from '@/types/geofence'
import { toHexColor } from '@/containers/geofences/components/upseart-geofence/utils'

const Broadcast = () => {
  return (
    <Image src="/images/broadcast.svg" alt="Broadcast" width={18} height={18} />
  )
}

const Broadcast2 = () => {
  return (
    <Image
      src="/images/broadcast-2.svg"
      alt="Broadcast 2"
      width={18}
      height={18}
    />
  )
}

const Rectangle = () => {
  return (
    <Image src="/images/rectangle.svg" alt="Rectangle" width={18} height={18} />
  )
}

const TOOL_CONFIG: {
  id: GeofenceTool
  icon: React.ComponentType<{ className?: string }>
  label: string
}[] = [
  { id: 'polygon', icon: Diamond, label: 'Draw diamond' },
  { id: 'rectangle', icon: Square, label: 'Draw rectangle' },
  { id: 'circle', icon: Circle, label: 'Draw circle' },
  { id: 'angled-rectangle', icon: Rectangle, label: 'Move shape' },
  { id: 'sensor', icon: Broadcast2, label: 'Geofence mode' },
  { id: 'sector', icon: Broadcast, label: 'Draw sector' },
  { id: 'select', icon: MousePointer2, label: 'Select' },
  { id: 'delete-selection', icon: Delete, label: 'Delete selected' },
  { id: 'delete', icon: Trash2, label: 'Delete' },
]
const mapInstance = MapInstance.getInstance()

const GeofenceControls = () => {
  const {
    setActiveTool,
    activeTool,
    setOriginalGeoFencesIds,
    originalGeoFencesIds,
    draftGeoFencesIds,
    setDraftGeoFencesIds,
    currentDrawingColor,
    isShowGeofenceControls,
    geoFencesIds,
  } = useGeofenceStore(
    useShallow((state) => ({
      setActiveTool: state.setActiveTool,
      activeTool: state.activeTool,
      originalGeoFencesIds: state.originalGeoFencesIds,
      setOriginalGeoFencesIds: state.setOriginalGeoFencesIds,
      currentDrawingColor: state.currentDrawingColor,
      isShowGeofenceControls: state.isShowGeofenceControls,
      draftGeoFencesIds: state.draftGeoFencesIds,
      setDraftGeoFencesIds: state.setDraftGeoFencesIds,
      geoFencesIds: state.geoFencesIds,
    }))
  )
  const [isGeofenceEmpty, setIsGeofenceEmpty] = useState(true)

  const checkIsEmpty = useCallback(() => {
    const draw = mapInstance.getTerraDraw()
    const snapshot = draw?.getSnapshot() ?? []
    const hasFeatures = snapshot.some((f) => f.properties?.mode !== 'select')
    setIsGeofenceEmpty(!hasFeatures)
  }, [])

  useEffect(() => {
    const draw = mapInstance.getTerraDraw()
    if (!draw) return

    const handleFinish = (featureId: FeatureId) => {
      if (!draftGeoFencesIds.includes(featureId)) {
        setDraftGeoFencesIds([...draftGeoFencesIds, featureId])
      }
      setIsGeofenceEmpty(false)
    }
    const handleChange = (ids: FeatureId[], type: string) => {
      if (type === 'create' && isShowGeofenceControls) {
        ids.forEach((id) => {
          draw?.updateFeatureProperties(id, {
            color: toHexColor(currentDrawingColor),
          })
        })
      }
      checkIsEmpty()
    }

    draw.on('finish', handleFinish)
    draw.on('change', handleChange)

    return () => {
      draw.off('finish', handleFinish)
      draw.off('change', handleChange)
    }
  }, [draftGeoFencesIds, currentDrawingColor, isShowGeofenceControls])

  const toolConfig =
    activeTool !== 'select'
      ? TOOL_CONFIG.filter((t) => t.id !== 'delete-selection')
      : TOOL_CONFIG

  const handleToolClick = (tool: GeofenceTool) => {
    const draw = mapInstance.getTerraDraw()
    if (tool === activeTool) {
      setActiveTool(undefined)
      mapInstance.setDrawingMode(false)
      draw?.setMode('render')
      return
    }
    if (tool === 'delete') {
      draw?.removeFeatures(geoFencesIds)
      setOriginalGeoFencesIds([])
      setDraftGeoFencesIds([])
      setIsGeofenceEmpty(true)
      setActiveTool(undefined)
      mapInstance.setDrawingMode(false)
      draw?.setMode('render')
      return
    }
    if (tool === 'delete-selection') {
      const snapshot = draw?.getSnapshot()
      const selectedIds = snapshot
        ?.filter((f) => f.properties?.selected)
        .map((f) => f.id!)
      if (selectedIds?.length) {
        draw?.removeFeatures(selectedIds)
        setDraftGeoFencesIds(
          draftGeoFencesIds.filter((id) => !selectedIds.includes(id))
        )
        setOriginalGeoFencesIds(
          originalGeoFencesIds.filter((id) => !selectedIds.includes(id))
        )
        checkIsEmpty()
        if (activeTool === 'select') {
          setActiveTool(undefined)
          mapInstance.setDrawingMode(false)
          draw?.setMode('render')
        }
      }
      return
    }
    setActiveTool(tool)
    mapInstance.setDrawingMode(true)
    draw?.start()
    draw?.setMode(tool)
  }

  useEffect(() => {
    const draw = mapInstance.getTerraDraw()
    if (!draw || !geoFencesIds.length || !isShowGeofenceControls) return
    geoFencesIds.forEach((id) => {
      if (draw.hasFeature(id)) {
        draw.updateFeatureProperties(id, {
          color: toHexColor(currentDrawingColor),
        })
      }
    })
  }, [
    currentDrawingColor,
    originalGeoFencesIds,
    draftGeoFencesIds,
    isShowGeofenceControls,
  ])

  return (
    <ControlGroup>
      {toolConfig.map(({ id, icon: Icon, label }) => {
        const isActive = activeTool === id
        const isDisabled =
          isGeofenceEmpty &&
          (id === 'delete-selection' || id === 'delete' || id === 'select')
        return (
          <ControlButton
            key={id}
            onClick={() => handleToolClick(id)}
            label={label}
            active={isActive}
            disabled={isDisabled}
          >
            <Icon className="size-4 text-brand-icon-light-fixed" />
          </ControlButton>
        )
      })}
    </ControlGroup>
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
  active = false,
  disabled = false,
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      type="button"
      className={cn(
        'rounded-md flex items-center justify-center size-8 hover:bg-brand-component-fill-dark/40 transition-colors shadow-inset-white border-brand-component-stroke-dark bg-brand-component-fill-dark dark:bg-brand-component-fill-secondary dark:hover:bg-brand-component-fill-secondary/40',
        active && 'bg-brand-component-fill-gray',
        disabled &&
          'opacity-50 pointer-events-none cursor-not-allowed bg-brand-component-fill-gray'
      )}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default GeofenceControls
