'use client'

import { cn } from '@/lib/utils'
import { Circle, Diamond, Square, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useGeofenceStore } from '@/stores/geofence-store'
import { useShallow } from 'zustand/react/shallow'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'
import { GeofenceTool } from '@/stores/geofence-store'

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
  { id: 'delete', icon: Trash2, label: 'Delete' },
]
const mapInstance = MapInstance.getInstance()

const GeofenceControls = () => {
  const { setActiveTool, activeTool } = useGeofenceStore(
    useShallow((state) => ({
      setActiveTool: state.setActiveTool,
      activeTool: state.activeTool,
    }))
  )

  const handleToolClick = (tool: GeofenceTool) => {
    const draw = mapInstance.getTerraDraw()
    if (tool === activeTool) {
      setActiveTool(undefined)
      draw?.setMode('select')
      return
    }
    if (tool === 'delete') {
      draw?.clear()
      setActiveTool(undefined)
      draw?.setMode('select')
      return
    }
    setActiveTool(tool)
    draw?.start()
    draw?.setMode(tool)
  }

  return (
    <ControlGroup>
      {TOOL_CONFIG.map(({ id, icon: Icon, label }) => {
        const isActive = activeTool === id
        return (
          <ControlButton
            key={id}
            onClick={() => handleToolClick(id)}
            label={label}
            active={isActive}
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
}: {
  onClick: () => void
  label: string
  children: React.ReactNode
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      type="button"
      className={cn(
        'rounded-md flex items-center justify-center size-8 hover:bg-brand-component-fill-dark/40 transition-colors shadow-inset-white border-brand-component-stroke-dark bg-brand-component-fill-dark dark:bg-brand-component-fill-secondary dark:hover:bg-brand-component-fill-secondary/40',
        active && 'bg-brand-component-fill-gray'
      )}
    >
      {children}
    </button>
  )
}

export default GeofenceControls
