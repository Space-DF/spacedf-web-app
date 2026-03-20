import { cn } from '@/lib/utils'
import { Globe, Loader2, Locate, Minus, Plus } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import MapLibreGL from 'maplibre-gl'

type MapControlsProps = {
  map: MapLibreGL.Map
}

const MapControls = ({ map }: MapControlsProps) => {
  const [globeActive, setGlobeActive] = useState(false)
  const [waitingForLocation, setWaitingForLocation] = useState(false)
  const globeControlRef = useRef<MapLibreGL.GlobeControl | null>(null)

  useEffect(() => {
    if (!map) return
    const globe = new MapLibreGL.GlobeControl()

    map.addControl(globe)

    globeControlRef.current = globe
  }, [map])

  const handleZoomIn = useCallback(() => {
    map.zoomTo(map.getZoom() + 1, { duration: 300 })
  }, [map])

  const handleZoomOut = useCallback(() => {
    map.zoomTo(map.getZoom() - 1, { duration: 300 })
  }, [map])

  const handleResetBearing = useCallback(() => {
    map.resetNorthPitch({ duration: 300 })
  }, [map])

  const handleGlobeSwitch = useCallback(() => {
    if (!globeControlRef.current) return

    globeControlRef.current._toggleProjection()
    setGlobeActive((prev) => !prev)
  }, [map])

  const handleLocate = useCallback(() => {
    setWaitingForLocation(true)
    const geoLocateButton = document.querySelector(
      '.maplibregl-ctrl-geolocate'
    ) as HTMLButtonElement

    if (geoLocateButton) {
      geoLocateButton.click()
      setWaitingForLocation(false)
    }
  }, [map])

  return (
    <div className="absolute z-10 flex flex-col gap-1.5 top-3 right-3">
      <ControlGroup>
        <ControlButton onClick={handleZoomIn} label="Zoom in">
          <Plus className="size-4 text-brand-icon-light-fixed" />
        </ControlButton>
        <ControlButton onClick={handleZoomOut} label="Zoom out">
          <Minus className="size-4 text-brand-icon-light-fixed" />
        </ControlButton>
      </ControlGroup>

      <ControlGroup>
        <CompassButton onClick={handleResetBearing} map={map} />
      </ControlGroup>

      <ControlGroup>
        <ControlButton
          onClick={handleLocate}
          label="Find my location"
          disabled={waitingForLocation}
        >
          {waitingForLocation ? (
            <Loader2 className="size-4 animate-spin text-brand-icon-light-fixed" />
          ) : (
            <Locate className="size-4 text-brand-icon-light-fixed" />
          )}
        </ControlButton>
      </ControlGroup>

      <ControlGroup>
        <ControlButton onClick={handleGlobeSwitch} label="Reset pitch">
          <Globe
            className={cn(
              'size-4 text-brand-icon-light-fixed',
              globeActive && 'text-brand-dark-fill-secondary'
            )}
          />
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

function CompassButton({
  onClick,
  map,
}: { onClick: () => void } & Pick<MapControlsProps, 'map'>) {
  const compassRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!map || !compassRef.current) return

    const compass = compassRef.current

    const updateRotation = () => {
      const bearing = map.getBearing()
      const pitch = map.getPitch()
      compass.style.transform = `rotateX(${pitch}deg) rotateZ(${-bearing}deg)`
    }

    map.on('rotate', updateRotation)
    map.on('pitch', updateRotation)
    updateRotation()

    return () => {
      map.off('rotate', updateRotation)
      map.off('pitch', updateRotation)
    }
  }, [map])

  return (
    <ControlButton onClick={onClick} label="Reset bearing to north">
      <svg
        ref={compassRef}
        viewBox="0 0 24 24"
        className="size-7 transition-transform duration-200"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <path d="M12 2L16 12H12V2Z" className="fill-red-500" />
        <path d="M12 2L8 12H12V2Z" className="fill-red-300" />
        <path d="M12 22L16 12H12V22Z" className="fill-muted-foreground/60" />
        <path d="M12 22L8 12H12V22Z" className="fill-muted-foreground/30" />
      </svg>
    </ControlButton>
  )
}

export { MapControls }
