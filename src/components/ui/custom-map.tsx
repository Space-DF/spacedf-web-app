'use client'
import React, { useEffect, useRef } from 'react'
import { useLayout } from '@/stores'
import { useShallow } from 'zustand/react/shallow'
import { MapboxOverlay } from '@deck.gl/mapbox'
import type { Layer } from 'deck.gl'
import MapInstance from '@/utils/map-instance'

const mapInstance = MapInstance.getInstance()

interface CustomMapProps {
  layers?: Layer[]
}

const CustomMap: React.FC<CustomMapProps> = ({ layers }) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)

  const { dynamicLayouts } = useLayout(
    useShallow((state) => ({
      dynamicLayouts: state.dynamicLayouts,
    })),
  )

  useEffect(() => {
    if (!mapContainerRef.current) return

    mapInstance.initializeMap({ container: mapContainerRef.current })

    const map = mapInstance.getMapInstance()
    const deckOverlay = new MapboxOverlay({
      interleaved: true,
      layers: layers || [],
    })

    map?.on('load', () => {
      map.addControl(deckOverlay)
    })

    return () => {
      mapInstance.destroyMap()
      map?.removeControl(deckOverlay)
    }
  }, [layers])

  useEffect(() => {
    mapInstance.resize()
  }, [dynamicLayouts])

  return (
    <div ref={mapContainerRef} className="h-[100vh] w-full overflow-hidden" />
  )
}

export default CustomMap
