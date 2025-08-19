'use client'

import SpacedfLogo from '@/components/common/spacedf-logo'
import { useMapClusters } from '@/hooks/templates/useCluster'
import { useMapBuilding } from '@/hooks/templates/useMapBuilding'
import { usePrevious } from '@/hooks/usePrevious'
import { NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN } from '@/shared/env'
import { useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { getMapStyle, MapType } from '@/utils/map'
import { Deck } from 'deck.gl'
import mapboxgl from 'mapbox-gl'
import { useTheme } from 'next-themes'
import { memo, useCallback, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import DeckglLayers from './deckgl-layers'
import MapClusters from './map-clusters'
import { ModelType } from './model-type'
import { SelectMapType } from './select-map-type'

mapboxgl.accessToken = NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

const minZoom = 15

const FleetTracking = () => {
  const mapRefContainer = useRef<HTMLDivElement>(null)
  const deckRef = useRef<Deck | null>(null)
  const isFirstLoad = useRef(true)

  const { resolvedTheme } = useTheme()
  const { applyMapBuilding, removeMapBuilding } = useMapBuilding()
  const { handleCluster } = useMapClusters()

  const { isMapReady, setMap, updateBooleanState, map, mapType } =
    useFleetTrackingStore(
      useShallow((state) => ({
        map: state.map,
        isMapReady: state.isMapReady,
        setMap: state.setMap,
        updateBooleanState: state.updateBooleanState,
        mapType:
          state.mapType ||
          (localStorage.getItem('fleet-tracking:mapType') as MapType) ||
          'default',
      }))
    )

  const { devices, deviceIds, deviceSelected } = useDeviceStore(
    useShallow((state) => ({
      devices: state.devices,
      deviceIds: Object.keys(state.devices),
      setDevices: state.setDevices,
      deviceSelected: state.deviceSelected,
      initializedSuccess: state.initializedSuccess,
    }))
  )
  const previousDeviceSelected = usePrevious(deviceSelected)

  useEffect(() => {
    if (!mapRefContainer.current) return

    const modelType =
      (localStorage.getItem('fleet-tracking:modelType') as '2d' | '3d') || '2d'
    const isThreeD = modelType === '3d'

    const { style, config } = getMapStyle(
      mapType ||
        (localStorage.getItem('fleet-tracking:mapType') as MapType) ||
        'default',
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

    return () => {
      map.remove()
      deckRef.current?.finalize()
      deckRef.current = null
      setMap(null)
    }
  }, [])

  useEffect(() => {
    if (!isMapReady || !map) return

    const { style, config } = getMapStyle(
      mapType ||
        (localStorage.getItem('fleet-tracking:mapType') as MapType) ||
        'default',
      resolvedTheme as 'dark' | 'light'
    )

    map.setStyle(style, { config, diff: true } as any)

    map.once('style.load', () => {
      renderMapResources(
        map,
        mapType || (localStorage.getItem('mapType') as MapType) || 'default'
      )
    })
  }, [isMapReady, mapType, map, resolvedTheme])

  useEffect(() => {
    if (!isMapReady || deviceIds.length === 0) return
    zoomToDevice(deviceIds[0], true)
  }, [isMapReady, JSON.stringify(deviceIds)])

  useEffect(() => {
    if (!isMapReady) return

    if (deviceSelected && deviceSelected !== previousDeviceSelected) {
      zoomToDevice(deviceSelected)
    }

    if (previousDeviceSelected && !deviceSelected) {
      map?.flyTo({
        zoom: 17,
      })
    }
  }, [isMapReady, deviceSelected, previousDeviceSelected])

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
    (deviceId: string, isFirstLoad = false) => {
      if (!map) return
      const device = devices[deviceId]
      if (!device || !device.latestLocation) return

      const [lng, lat] = device.latestLocation
      if (!lng || !lat) return

      map.flyTo({
        center: [lng, lat],
        zoom: isFirstLoad ? 17 : 19,
      })
    },
    [devices, map]
  )

  // const handleUpdateLocation = () => {
  //   const newDevices: Device[] = Object.values(devices).map((device) => {
  //     if (device.id === 'rak4630-rs3-C1F4') {
  //       return {
  //         ...device,
  //         latestLocation: [
  //           (device.latestLocation?.[0] ?? 0) + 0.0001,
  //           (device.latestLocation?.[1] ?? 0) + 0.0001,
  //         ],
  //       }
  //     }
  //     return device
  //   })

  //   // map?.flyTo({
  //   //   center: [106.666666, 10.783333],
  //   //   zoom: 17,
  //   //   pitch: 90,
  //   // })

  //   setDevices(newDevices)
  // }

  return (
    <div className="relative size-full overflow-hidden">
      <div ref={mapRefContainer} className="absolute inset-0" />
      <SpacedfLogo />
      <DeckglLayers />
      <SelectMapType />
      <ModelType />
      {/* {isShowLoading && <LoadingScreen />} */}
      <MapClusters />
      {/* <Button
        className="absolute bottom-4 right-4"
        onClick={handleUpdateLocation}
      >
        Update Location
      </Button> */}
    </div>
  )
}

export default memo(FleetTracking)
