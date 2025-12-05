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
import mapboxgl, { NavigationControl } from 'mapbox-gl'
import { useEffect, useMemo, useRef, useState } from 'react'

import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { FleetTrackingMap } from '@/utils/fleet-tracking-map/map-instance'

const fleetTrackingMap = FleetTrackingMap.getInstance()
const VIETNAM_CENTER: [number, number] = [108.2022, 16.0544]

export const MapControl = () => {
  const mapControlRef = useRef<NavigationControl | null>(null)
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null)
  // const mapFullscreenControlRef = useRef<mapboxgl.FullscreenControl | null>(
  //   null
  // )

  const isMapReady = useFleetTrackingStore((state) => state.isMapReady)

  const [isGeolocateAllowed, setIsGeolocateAllowed] = useState(false)
  // const [isFullscreen, setIsFullscreen] = useState(false)
  const isFirstAskGeoPermission = useRef(true)

  const [bearing, setBearing] = useState(0)

  useEffect(() => {
    const handleRotate = (map: mapboxgl.Map | null) => {
      const bearing = map?.getBearing() || 0
      setBearing(bearing)
    }

    const handleMapReady = (map: mapboxgl.Map) => {
      if (mapControlRef.current) {
        map.removeControl(mapControlRef.current)
      }
      // if (mapFullscreenControlRef.current) {
      //   map.removeControl(mapFullscreenControlRef.current)
      // }

      mapControlRef.current = new mapboxgl.NavigationControl()
      // mapFullscreenControlRef.current = new mapboxgl.FullscreenControl()

      map.addControl(mapControlRef.current)
      // map.addControl(mapFullscreenControlRef.current)
    }

    // const handleFullscreenChange = () => {
    //   setIsFullscreen(!!document.fullscreenElement)
    // }

    // document.addEventListener('fullscreenchange', handleFullscreenChange)

    fleetTrackingMap.on('rotate', handleRotate)
    fleetTrackingMap.on('load', handleMapReady)
    fleetTrackingMap.on('reattach', handleMapReady)

    return () => {
      const map = fleetTrackingMap.getMap()
      if (map) {
        map.removeControl(mapControlRef.current!)
        // map.removeControl(mapFullscreenControlRef.current!)
        mapControlRef.current = null
        // mapFullscreenControlRef.current = null
      }

      fleetTrackingMap.off('rotate', handleRotate)
      fleetTrackingMap.off('reattach', handleMapReady)
      fleetTrackingMap.off('load', handleMapReady)
      // document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    if (!isMapReady) return

    function onGeolocate(e: any) {
      const [currentLng, currentLat] = [e.coords.longitude, e.coords.latitude]

      const currentModelType = localStorage.getItem(
        'fleet-tracking:modelType'
      ) as '2d' | '3d'

      setIsGeolocateAllowed(true)
      const map = fleetTrackingMap.getMap()
      if (!map) return
      const currentZoom = map?.getZoom() || 18
      map?.flyTo({
        center: [currentLng, currentLat],
        zoom: 18,
        duration: currentZoom < 10 ? (10 - currentZoom) * 500 : 1000,
        essential: true,
        pitch: currentModelType === '3d' ? 90 : 0,
      })
    }

    function onError() {
      setIsGeolocateAllowed(false)
      isFirstAskGeoPermission.current = false
      const map = fleetTrackingMap.getMap()
      map?.flyTo({
        center: VIETNAM_CENTER,
        zoom: 5,
        duration: 1500,
        essential: true,
      })
    }

    const onLoad = (map: mapboxgl.Map) => {
      const devices = fleetTrackingMap.getDevices()
      const isEmptyDevices = Object.keys(devices).length === 0

      if (!geolocateControlRef.current) {
        geolocateControlRef.current = new mapboxgl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
          showUserHeading: true,
        })

        map.addControl(geolocateControlRef.current)

        if (isEmptyDevices) {
          navigator.permissions.query({ name: 'geolocation' }).then(() => {
            geolocateControlRef.current?.trigger()
          })

          geolocateControlRef.current.on('geolocate', onGeolocate)
          geolocateControlRef.current.on('error', onError)
        } else {
          geolocateControlRef.current.on('geolocate', onGeolocate)
          geolocateControlRef.current.on('error', onError)
        }
      }
    }

    fleetTrackingMap.on('load', onLoad)
    fleetTrackingMap.on('reattach', onLoad)

    return () => {
      fleetTrackingMap.off('load', onLoad)
      fleetTrackingMap.off('reattach', onLoad)

      if (geolocateControlRef.current) {
        if (fleetTrackingMap.getMap()) {
          fleetTrackingMap.getMap()?.removeControl(geolocateControlRef.current!)
        }
        geolocateControlRef.current.off('geolocate', onGeolocate)
        geolocateControlRef.current.off('error', onError)
        geolocateControlRef.current = null
      }
    }
  }, [isMapReady])

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
        key={isGeolocateAllowed ? 'geolocate-allowed' : 'geolocate-not-allowed'}
        onClick={() => {
          if (!geolocateControlRef.current) return

          if (isGeolocateAllowed) {
            geolocateControlRef.current._clearWatch()
            geolocateControlRef.current._watchState = 'OFF'
            ;(geolocateControlRef.current as any)._geolocationWatchID =
              undefined
            geolocateControlRef.current._lastKnownPosition = undefined

            setIsGeolocateAllowed(false)
          } else {
            geolocateControlRef.current?.trigger()
            setIsGeolocateAllowed(true)
          }
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

      {/* <Button
        className="bg-muted rounded-lg border shadow cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-600 hover:dark:text-slate-500"
        variant="ghost"
        size="icon"
        onClick={() => {
          if (!mapFullscreenControlRef.current) return
          mapFullscreenControlRef.current._onClickFullscreen()
        }}
      >
        {!isFullscreen ? <Expand size={20} /> : <Shrink size={20} />}
      </Button> */}
    </div>
  )
}
