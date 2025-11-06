'use client'

import SpacedfLogo from '@/components/common/spacedf-logo'
import { useMapBuilding } from '@/hooks/templates/useMapBuilding'
import { usePrevious } from '@/hooks/usePrevious'
import { NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN } from '@/shared/env'
import { Device, useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { getMapStyle, MapType } from '@/utils/map'
import { Deck } from 'deck.gl'
import mapboxgl from 'mapbox-gl'
import { useTheme } from 'next-themes'
import { memo, useCallback, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import DeckglLayers from './deckgl-layers'
import MapClusters from './map-clusters'
import { MapControl } from './map-control'
import { ModelType } from './model-type'
import { SelectMapType } from './select-map-type'

mapboxgl.accessToken = NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

const minZoom = 15

const FleetTracking = () => {
  const mapRefContainer = useRef<HTMLDivElement>(null)
  const deckRef = useRef<Deck | null>(null)
  const isFirstLoad = useRef(true)
  const isFirstZoom = useRef(true)
  const isNeedToHandleGeolocateDenied = useRef(true)

  const { resolvedTheme } = useTheme()
  const { applyMapBuilding, removeMapBuilding } = useMapBuilding()

  const { isMapReady, setMap, updateBooleanState, map, mapType, modelType } =
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
        modelType:
          state.modelType ||
          (localStorage.getItem('fleet-tracking:modelType') as '2d' | '3d') ||
          '2d',
      }))
    )

  const { devices, deviceIds, deviceSelected, initializedSuccess } =
    useDeviceStore(
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
    if (!mapRefContainer.current || !initializedSuccess) return

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

    map.once('load', () => {
      map.resize()

      setTimeout(() => {
        updateBooleanState('isMapReady', true)
        setMap(map)
      }, 500)

      requestAnimationFrame(() => {
        if (map.getCanvasContainer()) {
          window.dispatchEvent(
            new CustomEvent('mapLoaded', {
              detail: {
                map,
              },
            })
          )
        }
      })

      map.on('zoomend', async () => {
        if (isNeedToHandleGeolocateDenied.current) {
          isNeedToHandleGeolocateDenied.current = false
        }
        if (isFirstLoad.current) {
          isFirstLoad.current = false
        } else {
          window.dispatchEvent(
            new CustomEvent('mapZoomEnd', {
              detail: {
                isMinZoom: map.getZoom() < minZoom,
                map,
              },
            })
          )
        }
      })
    })

    return () => {
      deckRef.current?.finalize()
      deckRef.current = null
      setMap(null)
    }
  }, [initializedSuccess])

  useEffect(() => {
    return () => {
      try {
        if (map && map.getContainer()) {
          map.remove()
          window.location.reload()
        }
      } catch (error) {
        console.warn('Map remove error:', error)
      }
    }
  }, [map])

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
    if (!isMapReady) return
    if (isFirstZoom.current) {
      zoomToDevice(deviceIds, true)
      isFirstZoom.current = false
    }
  }, [isMapReady, JSON.stringify(deviceIds)])

  useEffect(() => {
    if (!isMapReady || !map) return

    if (!deviceSelected && previousDeviceSelected && map?.getZoom() > minZoom) {
      zoomToSingleDevice([devices[previousDeviceSelected]], false, 16)
      setTimeout(() => {
        map?.resize()
      }, 200)
    }
  }, [
    isMapReady,
    deviceSelected,
    previousDeviceSelected,
    modelType,
    map,
    devices,
  ])

  useEffect(() => {
    if (!map) return

    const handleGeolocateDenied = () => {
      if (!isNeedToHandleGeolocateDenied.current) return
      map.flyTo({
        center: [108.20623, 16.047079], // fallback: Vietnam center
        zoom: 5,
        pitch: 0,
      })

      isNeedToHandleGeolocateDenied.current = false
    }

    window.addEventListener('spacedf_geolocate_denied', handleGeolocateDenied)

    return () => {
      window.removeEventListener(
        'spacedf_geolocate_denied',
        handleGeolocateDenied
      )
    }
  }, [map])

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

  const getBoundsFromCoordinates = (coordinates: number[][]) => {
    if (!coordinates.length)
      return [
        [0, 0],
        [0, 0],
      ] as number[][]

    let minLng = coordinates[0][0]
    let minLat = coordinates[0][1]
    let maxLng = coordinates[0][0]
    let maxLat = coordinates[0][1]

    coordinates.forEach(([lng, lat]) => {
      if (lng < minLng) minLng = lng
      if (lat < minLat) minLat = lat
      if (lng > maxLng) maxLng = lng
      if (lat > maxLat) maxLat = lat
    })

    return [
      [minLng, minLat],
      [maxLng, maxLat],
    ]
  }

  const zoomToSingleDevice = (
    listDevice: Device[],
    isFirstLoad: boolean,
    zoomLevel?: number
  ) => {
    if (!map) return
    const [lng, lat] = listDevice[0].latestLocation || [0, 0]

    if (!lng || !lat) return

    map.flyTo({
      center: [lng, lat],
      zoom: isFirstLoad ? 17 : zoomLevel || 19,
      duration: isFirstLoad ? 6000 : 500,
      essential: true,
      pitch: modelType === '3d' ? 90 : 0,
    })
  }

  const zoomToMultipleDevices = (listDevice: Device[]) => {
    if (!map) return
    const coordinates = listDevice
      .map((d) => d?.latestLocation)
      .filter(
        (loc): loc is [number, number] => Array.isArray(loc) && loc.length === 2
      )

    if (!coordinates.length) return

    const bounds = getBoundsFromCoordinates(coordinates)

    const [firstLng, firstLat] = coordinates[0]
    const allSameLocation = coordinates.every(
      ([lng, lat]) => lng === firstLng && lat === firstLat
    )

    if (allSameLocation) {
      map.flyTo({
        center: [firstLng, firstLat],
        zoom: 18,
        duration: isFirstLoad ? 6000 : 500,
        essential: true,
        pitch: modelType === '3d' ? 90 : 0,
      })

      return
    }

    map.fitBounds([bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]], {
      padding: 100,
      pitch: modelType === '3d' ? 90 : 0,
    })
  }

  const strategies: Record<
    string,
    (listDevice: Device[], isFirstLoad: boolean) => void
  > = {
    '1': zoomToSingleDevice,
    multi: zoomToMultipleDevices,
  }

  const zoomToDevice = useCallback(
    async (deviceId: string[], isFirstLoad = false) => {
      if (!map) return
      const listDevice = deviceId.map((id) => devices?.[id]).filter(Boolean)

      if (listDevice.length === 0) return

      const count = listDevice?.length

      const key = count === 1 ? '1' : 'multi'
      const zoomStrategy = strategies[key]

      zoomStrategy?.(listDevice, isFirstLoad)
    },
    [devices, map, modelType]
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

  //   setDevices(newDevices)
  // }

  return (
    <div className="relative size-full overflow-hidden">
      <div ref={mapRefContainer} className="absolute inset-0" />
      <SpacedfLogo />
      <DeckglLayers />
      <SelectMapType />
      <MapControl />
      {!!deviceIds.length && <ModelType />}

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
