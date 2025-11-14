'use client'
import {
  CompassIcon,
  GeoLocateControl,
  LocationOffIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '@/components/icons/map-control-icons'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useDeviceStore } from '@/stores/device-store'
import { Expand, Shrink } from 'lucide-react'
import mapboxgl, { NavigationControl } from 'mapbox-gl'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { FleetTrackingMap } from '@/utils/fleet-tracking-map/map-instance'

const fleetTrackingMap = FleetTrackingMap.getInstance()

export const MapControl = () => {
  const mapControlRef = useRef<NavigationControl | null>(null)
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null)
  const mapFullscreenControlRef = useRef<mapboxgl.FullscreenControl | null>(
    null
  )

  const [isGeolocateAllowed, setIsGeolocateAllowed] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const [bearing, setBearing] = useState(0)

  const { devices } = useDeviceStore(
    useShallow((state) => ({ devices: state.devices }))
  )

  useEffect(() => {
    const handleRotate = (map: mapboxgl.Map | null) => {
      const bearing = map?.getBearing() || 0
      setBearing(bearing)
    }

    const handleMapReady = (map: mapboxgl.Map) => {
      mapControlRef.current = new mapboxgl.NavigationControl()
      mapFullscreenControlRef.current = new mapboxgl.FullscreenControl()

      map.addControl(mapControlRef.current)
      map.addControl(mapFullscreenControlRef.current)
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)

    fleetTrackingMap.on('rotate', handleRotate)
    fleetTrackingMap.on('load', handleMapReady)

    return () => {
      fleetTrackingMap.off('rotate', handleRotate)
      fleetTrackingMap.off('load', handleMapReady)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    const map = fleetTrackingMap.getMap()
    if (!map) return

    geolocateControlRef.current = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    })

    map.addControl(geolocateControlRef.current)

    const isEmptyDevices = !Object.keys(devices).length

    if (isEmptyDevices) {
      navigator.permissions.query({ name: 'geolocation' }).then(() => {
        geolocateControlRef.current?.trigger()
      })
    }

    const onGeolocate = () => {
      setIsGeolocateAllowed(true)
    }

    const onError = (_: any) => {
      setIsGeolocateAllowed(false)
      window.dispatchEvent(new CustomEvent('spacedf_geolocate_denied'))
    }

    geolocateControlRef.current.on('geolocate', onGeolocate)
    geolocateControlRef.current.on('error', onError)

    return () => {
      if (geolocateControlRef.current && map) {
        geolocateControlRef.current.off('geolocate', onGeolocate)
        geolocateControlRef.current.off('error', onError)

        geolocateControlRef.current = null
      }
    }
  }, [Object.keys(devices).length])

  const rotateCompassStyle = useMemo(() => {
    return {
      transform: `rotate(${bearing - 40}deg)`,
    }
  }, [bearing])

  return (
    <div className="mapbox-custom-controls absolute top-3.5 right-4 z-[2] flex flex-col gap-3">
      <Button
        className="bg-muted rounded-lg border shadow cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-600 hover:dark:text-slate-500"
        variant="ghost"
        size="icon"
        onClick={() => {
          if (!geolocateControlRef.current || isGeolocateAllowed) return
          geolocateControlRef.current.trigger()
        }}
      >
        {!isGeolocateAllowed ? (
          <LocationOffIcon />
        ) : (
          <GeoLocateControl className="text-blue-400" />
        )}
      </Button>

      <div className="flex flex-col bg-muted rounded-lg shadow items-center">
        <Button
          className="cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-600 hover:dark:text-slate-500"
          variant="link"
          size="icon"
          onClick={() => {
            if (!mapControlRef.current) return
            mapControlRef.current._zoomInButton.click()
          }}
        >
          <ZoomInIcon />
        </Button>

        <Separator className="w-3/4" />

        <Button
          className="cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-600 hover:dark:text-slate-500"
          variant="link"
          size="icon"
          onClick={() => {
            if (!mapControlRef.current) return
            mapControlRef.current._zoomOutButton.click()
          }}
        >
          <ZoomOutIcon />
        </Button>
      </div>

      <Button
        className="bg-muted rounded-lg border shadow cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-600 hover:dark:text-slate-500"
        variant="ghost"
        size="icon"
        onClick={() => {
          if (!mapControlRef.current) return
          mapControlRef.current._compass.click()
        }}
      >
        <CompassIcon style={rotateCompassStyle} />
      </Button>

      <Button
        className="bg-muted rounded-lg border shadow cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-600 hover:dark:text-slate-500"
        variant="ghost"
        size="icon"
        onClick={() => {
          if (!mapFullscreenControlRef.current) return
          mapFullscreenControlRef.current._onClickFullscreen()
        }}
      >
        {!isFullscreen ? <Expand size={20} /> : <Shrink size={20} />}
      </Button>
    </div>
  )
}
