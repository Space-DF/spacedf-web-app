'use client'

import { useMapClusters } from '@/hooks/templates/useCluster'
import { useMapBuilding } from '@/hooks/templates/useMapBuilding'
import { NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN } from '@/shared/env'
import { useDeviceStore } from '@/stores/device-store'
import { useDeviceMapsStore } from '@/stores/template/device-maps'
import { delay } from '@/utils'
import { getMapStyle, MapType } from '@/utils/map'
import { Deck } from 'deck.gl'
import mapboxgl from 'mapbox-gl'
import { useTheme } from 'next-themes'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import DeckglLayers from './deckgl-layers'
import LoadingScreen from './loading-screen'
import { ModelType } from './model-type'
import { SelectMapType } from './select-map-type'

mapboxgl.accessToken = NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

const minZoom = 15

const DeviceMaps = () => {
  const mapRefContainer = useRef<HTMLDivElement>(null)
  const deckRef = useRef<Deck | null>(null)
  const isFirstLoad = useRef(true)

  const { resolvedTheme } = useTheme()
  const { applyMapBuilding, removeMapBuilding } = useMapBuilding()
  const { handleCluster } = useMapClusters()

  const [isShowLoading, setIsShowLoading] = useState(false)

  const { isMapReady, setMap, updateBooleanState, map, mapType } =
    useDeviceMapsStore(
      useShallow((state) => ({
        map: state.map,
        isMapReady: state.isMapReady,
        setMap: state.setMap,
        updateBooleanState: state.updateBooleanState,
        mapType: state.mapType,
      }))
    )

  const { devices, deviceIds } = useDeviceStore(
    useShallow((state) => ({
      devices: state.devices,
      deviceIds: Object.keys(state.devices),
    }))
  )

  useEffect(() => {
    if (!mapRefContainer.current) return

    const modelType = (localStorage.getItem('modelType') as '2d' | '3d') || '2d'
    const isThreeD = modelType === '3d'

    const { style, config } = getMapStyle(
      mapType,
      resolvedTheme as 'dark' | 'light'
    )

    const map = new mapboxgl.Map({
      container: mapRefContainer.current,
      style,
      config,
      center: [0, 0],
      zoom: 1,
      pitch: isThreeD ? 90 : 0,
      antialias: true,
    })

    map.on('load', () => {
      map.resize()
      map.addControl(new mapboxgl.NavigationControl())
      updateBooleanState('isMapReady', true)
      setMap(map)

      handleCluster(map)

      window.dispatchEvent(
        new CustomEvent('mapLoaded', {
          detail: {
            map,
          },
        })
      )

      map.on('zoomend', async () => {
        if (isFirstLoad.current) {
          await initializeResources()
          isFirstLoad.current = false
        } else {
          window.dispatchEvent(
            new CustomEvent('mapZoomEnd', {
              detail: {
                isMinZoom: map.getZoom() < minZoom,
              },
            })
          )
        }
      })
    })

    // map.on('move', () => {
    //   updateClusters(map)
    // })

    return () => {
      map.remove()
      deckRef.current?.finalize()
      deckRef.current = null
      setMap(null)
      setIsShowLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isMapReady || !map) return

    const { style, config } = getMapStyle(
      mapType,
      resolvedTheme as 'dark' | 'light'
    )

    map.setStyle(style, { config, diff: true } as any)

    map.once('style.load', () => {
      renderMapResources(map, mapType)
    })
  }, [isMapReady, mapType, map, resolvedTheme])

  useEffect(() => {
    if (!isMapReady || deviceIds.length === 0) return
    zoomToDevice(deviceIds[0])
  }, [isMapReady, JSON.stringify(deviceIds)])

  const initializeResources = async () => {
    // Optional: loading animation
    setIsShowLoading(true)
    // await delay(300)
    // setIsZooming(false)
    await delay(1000)
    setIsShowLoading(false)
  }

  const renderMapResources = useCallback(
    async (map: mapboxgl.Map, mapType: MapType) => {
      if (mapType === 'default') {
        applyMapBuilding(map)
      } else {
        removeMapBuilding(map)
      }
    },
    [mapType, applyMapBuilding, removeMapBuilding]
  )

  const zoomToDevice = useCallback(
    (deviceId: string) => {
      if (!map) return
      const device = devices[deviceId]
      if (!device || !device.latestLocation) return

      const [lng, lat] = device.latestLocation
      if (!lng || !lat) return

      map.flyTo({
        center: [lng, lat],
        zoom: 17,
      })
    },
    [devices, map]
  )

  return (
    <div className="relative size-full overflow-hidden">
      <div ref={mapRefContainer} className="absolute inset-0" />
      <DeckglLayers />
      <SelectMapType />
      <ModelType />
      {isShowLoading && <LoadingScreen />}
    </div>
  )
}

export default memo(DeviceMaps)
