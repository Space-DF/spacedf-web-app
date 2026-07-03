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
import { useGeofenceMapStore } from '@/stores/geofence-map-store'

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
      currentDrawingColor: state.currentDrawingColor,
      isShowGeofenceControls: state.isShowGeofenceControls,
      draftGeoFencesIds: state.draftGeoFencesIds,
      setDraftGeoFencesIds: state.setDraftGeoFencesIds,
      geoFencesIds: state.geoFencesIds,
    }))
  )
  const setSelectedFeature = useGeofenceMapStore(
    (state) => state.setSelectedFeature
  )

  const [isGeofenceEmpty, setIsGeofenceEmpty] = useState(true)

  const checkIsEmpty = useCallback(async () => {
    const draw = await mapInstance.initTerraDraw()
    const snapshot = draw?.getSnapshot() ?? []
    const hasFeatures = snapshot.some((f) => f.properties?.mode !== 'select')
    setIsGeofenceEmpty(!hasFeatures)
  }, [])

  useEffect(() => {
    let active = true
    let cleanup: (() => void) | undefined

    const setupListeners = async () => {
      const draw = await mapInstance.initTerraDraw()
      if (!draw || !active) return

      const handleFinish = (featureId: FeatureId) => {
        if (
          !draftGeoFencesIds.includes(featureId) &&
          !originalGeoFencesIds.includes(featureId)
        ) {
          setDraftGeoFencesIds([...draftGeoFencesIds, featureId])
        }
        setIsGeofenceEmpty(false)
      }
      const handleChange = (ids: FeatureId[], type: string) => {
        const geofenceFeatureIds =
          useGeofenceMapStore.getState().geofenceFeatureIds
        const isNewGeofenceFromData = geofenceFeatureIds.some((id) =>
          ids.includes(id)
        )
        if (
          type === 'create' &&
          isShowGeofenceControls &&
          !isNewGeofenceFromData
        ) {
          const snapshot = draw.getSnapshot() ?? []
          // Filter guidance features (select mode creates auxiliary features with mode === 'select')
          const nonGuidanceIds = ids.filter((id) =>
            snapshot.some((f) => f.id === id && f.properties?.mode !== 'select')
          )
          nonGuidanceIds.forEach((id) => {
            draw.updateFeatureProperties(id, {
              color: toHexColor(currentDrawingColor),
            })
          })
        }
        checkIsEmpty()
      }

      const handleSelect = (id: FeatureId) => {
        const feature = draw.getSnapshotFeature(id)
        if (feature?.properties?.disabled) {
          draw.deselectFeature(id)
          draw.updateFeatureProperties(id, {
            selected: false,
          })
        }
        setSelectedFeature(id)
      }

      const handleDeselect = () => {
        setSelectedFeature(undefined)
      }

      draw.on('finish', handleFinish)
      draw.on('change', handleChange)
      draw.on('select', handleSelect)
      draw.on('deselect', handleDeselect)

      cleanup = () => {
        draw.off('finish', handleFinish)
        draw.off('change', handleChange)
        draw.off('select', handleSelect)
        draw.off('deselect', handleDeselect)
      }
    }

    setupListeners()

    return () => {
      active = false
      if (cleanup) {
        cleanup()
      }
    }
  }, [draftGeoFencesIds, currentDrawingColor, isShowGeofenceControls])

  const toolConfig =
    activeTool !== 'select'
      ? TOOL_CONFIG.filter((t) => t.id !== 'delete-selection')
      : TOOL_CONFIG

  const handleToolClick = async (tool: GeofenceTool) => {
    const draw = await mapInstance.initTerraDraw()
    if (!draw) return
    if (tool === activeTool) {
      setActiveTool(undefined)
      mapInstance.setDrawingMode(false)
      draw.setMode('render')
      return
    }
    if (tool === 'delete') {
      draw.removeFeatures(geoFencesIds)
      setDraftGeoFencesIds([])
      setIsGeofenceEmpty(true)
      setActiveTool(undefined)
      mapInstance.setDrawingMode(false)
      draw.setMode('render')
      return
    }
    if (tool === 'delete-selection') {
      const snapshot = draw.getSnapshot()
      const selectedIds = snapshot
        ?.filter(
          (f) => f.properties?.selected && f.properties?.mode !== 'select'
        )
        .map((f) => f.id!)
      if (selectedIds?.length) {
        draw.removeFeatures(selectedIds)
        setDraftGeoFencesIds(
          draftGeoFencesIds.filter((id) => !selectedIds.includes(id))
        )
        checkIsEmpty()
        if (activeTool === 'select') {
          setActiveTool(undefined)
          mapInstance.setDrawingMode(false)
          draw.setMode('render')
        }
      }
      return
    }
    setActiveTool(tool)
    mapInstance.setDrawingMode(true)
    draw.start()
    draw.setMode(tool)
  }

  useEffect(() => {
    const updateProperties = async () => {
      const draw = await mapInstance.initTerraDraw()
      if (!draw || !geoFencesIds.length || !isShowGeofenceControls) return
      const snapshot = draw.getSnapshot() ?? []
      const updatableIds = geoFencesIds.filter((id) =>
        snapshot.some((f) => f.id === id && f.properties?.mode !== 'select')
      )
      updatableIds.forEach((id) => {
        draw.updateFeatureProperties(id, {
          color: toHexColor(currentDrawingColor),
        })
      })
    }

    if (isShowGeofenceControls) {
      checkIsEmpty()
      updateProperties()
    }
  }, [currentDrawingColor, geoFencesIds, isShowGeofenceControls])

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
    <div className="overflow-hidden grid grid-cols-1 gap-y-0.5 p-0.5">
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
        'rounded-button flex items-center justify-center size-8 hover:bg-primary/40 transition-colors bg-primary',
        active && 'bg-primary/80',
        disabled &&
          'opacity-50 pointer-events-none cursor-not-allowed bg-primary/80'
      )}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default GeofenceControls
