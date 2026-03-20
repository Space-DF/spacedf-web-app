'use client'
import { useEffect, useState } from 'react'
import { useDebounce } from './useDebounce'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'

const mapInstance = MapInstance.getInstance()

export const useBBoxDebounce = () => {
  const [bbox, setBbox] = useState<string>('')
  const bboxDebounced = useDebounce(bbox, 500)

  useEffect(() => {
    const updateBbox = () => {
      const boundary = mapInstance.getCurrentMapBoundary()
      if (!boundary) return
      setBbox(
        `${boundary.minLng},${boundary.minLat},${boundary.maxLng},${boundary.maxLat}`
      )
    }

    const map = mapInstance.getMap()
    if (map) {
      updateBbox()
      map.on('moveend', updateBbox)
      map.on('zoomend', updateBbox)
    }

    mapInstance.on('ready', updateBbox)

    return () => {
      if (map) {
        map.off('moveend', updateBbox)
        map.off('zoomend', updateBbox)
      }
      mapInstance.off('ready', updateBbox)
    }
  }, [])
  return bboxDebounced
}
