'use client'
import { useMounted } from '@/hooks'
import { useLayout } from '@/stores'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { log, type Layer } from 'deck.gl'

import mapboxgl from 'mapbox-gl'

import React, { memo, useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

interface CustomMapProps {
  layers?: Layer[]
}

const CustomMap: React.FC<CustomMapProps> = ({ layers }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const { mounted } = useMounted()
  const [startResize, setStartResize] = useState(false)
  const { theme, systemTheme } = useTheme()

  const { dynamicLayouts, isCollapsed } = useLayout(
    useShallow((state) => ({
      dynamicLayouts: state.dynamicLayouts,
      isCollapsed: state.isCollapsed,
    })),
  )

  useEffect(() => {
    if (!window.mapInstance || !mapContainerRef.current) return

    const map = window.mapInstance?.getMapInstance()

    const currentTheme = theme === 'system' ? systemTheme : theme

    map?.setStyle(`mapbox://styles/mapbox/${currentTheme}-v11`)
  }, [theme])

  useEffect(() => {
    setStartResize(true)
    setTimeout(() => {
      const adjustMapPadding = () => {
        // Get the width of the dynamic layout element
        const dynamicLayoutElementWidth =
          document.getElementById('region-dynamic-layout')?.clientWidth || 0

        // Get the map instance and apply the right padding smoothly
        const map = window.mapInstance?.getMapInstance()

        if (map) {
          map.easeTo({
            padding: {
              right: dynamicLayoutElementWidth / 2,
            },
            duration: 1000, // Set the duration for smoothness
          })

          map?.resize()

          setTimeout(() => {
            setStartResize(false)
          }, 200)
        }
      }

      // Call the function to adjust padding initially and when dynamicLayouts change
      adjustMapPadding()
    }, 300)
  }, [dynamicLayouts])

  useEffect(() => {
    if (!window.mapInstance) return
    const map = window.mapInstance?.getMapInstance()
    setStartResize(true)
    setTimeout(() => {
      const sidebarWidth =
        document.getElementById('sidebar-id')?.clientWidth || 0

      map?.easeTo({
        padding: {
          right: sidebarWidth,
        },
        duration: 1000, // Set the duration for smoothness
      })

      map?.resize()

      setTimeout(() => {
        setStartResize(false)
      }, 200)
    }, 300)
  }, [isCollapsed])

  useEffect(() => {
    if (!mounted) return
    const mapInstance = window.mapInstance

    if (!mapContainerRef.current || !mapInstance) return

    // Only initialize if not already initialized
    mapInstance.initializeMap({ container: mapContainerRef.current })

    const map = mapInstance.getMapInstance()
    const deckOverlay = new MapboxOverlay({
      interleaved: true,
      layers: layers || [],
    })

    setTimeout(() => {
      map?.style.map?.easeTo({
        zoom: 17,
        duration: 3000,
      })
    }, 2000)

    // Load event to add overlay control
    map?.on('load', () => {
      map.addControl(deckOverlay)

      map.addControl(new mapboxgl.NavigationControl())

      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        }),
      )

      map.addControl(new mapboxgl.FullscreenControl())

      map?.resize()
    })

    return () => {
      // Clean up: remove controls and observers, destroy map instance
      if (mapContainerRef.current) {
        mapInstance.destroyMap()
        map?.removeControl(deckOverlay)
      }
    }
  }, [mounted])

  return (
    <div
      ref={mapContainerRef}
      className={cn(
        '!absolute inset-0 h-full !w-full !overflow-hidden !duration-1000',
        startResize
          ? 'bg-[#DBDBDC] bg-opacity-80 blur-md backdrop-blur-md dark:!bg-black'
          : 'blur-none',
      )}
      id="map-container"
    />
  )
}

export default memo(CustomMap)
