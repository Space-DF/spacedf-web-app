'use client'

import { useEffect, useRef } from 'react'
import MapInstance from '../core/map-instance'

const mapInstance = MapInstance.getInstance()

export function useMapResize(isMapReady: boolean) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!isMapReady) return

    const wrapperEl = wrapperRef.current
    const mapEl = mapContainerRef.current
    const map = mapInstance.getMap()

    if (!wrapperEl || !mapEl || !map) return

    let storedWidth = 0
    let storedHeight = 0
    let resizeTimeout: number | null = null

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect

      if (!width || !height) return

      if (!storedWidth || !storedHeight) {
        storedWidth = width
        storedHeight = height
        mapEl.style.width = `${width}px`
        mapEl.style.height = `${height}px`
        return
      }

      const deltaX = width - storedWidth
      const translateX = deltaX < 0 ? deltaX : 0

      mapEl.style.transform = `translateX(${translateX}px)`

      if (resizeTimeout) {
        window.clearTimeout(resizeTimeout)
      }

      resizeTimeout = window.setTimeout(() => {
        storedWidth = width
        storedHeight = height

        mapEl.style.width = `${width}px`
        mapEl.style.height = `${height}px`
        mapEl.style.transform = 'translateX(0px)'

        map.resize()
      }, 0)
    })

    observer.observe(wrapperEl)

    return () => {
      observer.disconnect()
    }
  }, [isMapReady])
  return { wrapperRef, mapContainerRef }
}
