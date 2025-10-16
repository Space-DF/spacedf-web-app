'use client'

import SpacedfLogo from '@/components/common/spacedf-logo'
import { useMapClusters } from '@/hooks/templates/useCluster'
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
import { ModelType } from './model-type'
import { SelectMapType } from './select-map-type'

mapboxgl.accessToken = NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

const minZoom = 15

const FleetTracking = () => {
  const mapRefContainer = useRef<HTMLDivElement>(null)
  const deckRef = useRef<Deck | null>(null)
  const isFirstLoad = useRef(true)
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null)

  const { resolvedTheme } = useTheme()
  const { applyMapBuilding, removeMapBuilding } = useMapBuilding()
  const { handleCluster } = useMapClusters()

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

    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    })
    geolocateControlRef.current = geolocateControl
    map.addControl(geolocateControl)

    map.on('load', () => {
      map.resize()
      map.addControl(new mapboxgl.NavigationControl())

      updateBooleanState('isMapReady', true)
      setMap(map)

      handleCluster(map)

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
      window.location.reload()
    }
  }, [initializedSuccess])

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
    zoomToDevice(deviceIds, true)
  }, [isMapReady, JSON.stringify(deviceIds)])

  useEffect(() => {
    if (!isMapReady) return

    if (deviceSelected && deviceSelected !== previousDeviceSelected) {
      zoomToDevice([deviceSelected], false)
    }

    if (!deviceSelected && previousDeviceSelected) {
      zoomToDevice(previousDeviceSelected, true)
    }
  }, [isMapReady, deviceSelected, previousDeviceSelected, modelType])

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

  const zoomToDefault = async (_: Device[], isFirstLoad: boolean) => {
    if (!map) return

    if (geolocateControlRef.current) {
      geolocateControlRef.current.trigger()

      if (isFirstLoad) {
        const onLocate = (e: any) => {
          map.flyTo({
            center: [e.coords.longitude, e.coords.latitude],
            zoom: 17,
            pitch: modelType === '3d' ? 90 : 0,
          })
          map.off('geolocate', onLocate)
        }

        const onError = (err: any) => {
          console.warn('Could not get user location:', err)
          map.flyTo({
            center: [108.0016002, 15.9722964],
            zoom: 5,
            pitch: modelType === '3d' ? 90 : 0,
          })
          map.off('error', onError)
        }

        map.on('geolocate', onLocate)
        map.on('error', onError)
      }
    }
  }

  const zoomToSingleDevice = (listDevice: Device[], isFirstLoad: boolean) => {
    if (!map) return
    const [lng, lat] = listDevice[0].latestLocation || [0, 0]
    if (!lng || !lat) return

    map.flyTo({
      center: [lng, lat],
      zoom: isFirstLoad ? 17 : 19,
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

    map.fitBounds([bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]], {
      padding: 100,
      pitch: modelType === '3d' ? 90 : 0,
    })
  }

  const strategies: Record<
    string,
    (listDevice: Device[], isFirstLoad: boolean) => void
  > = {
    '0': zoomToDefault,
    '1': zoomToSingleDevice,
    multi: zoomToMultipleDevices,
  }

  const zoomToDevice = useCallback(
    async (deviceId: string[], isFirstLoad = false) => {
      if (!map) return
      const listDevice = deviceId.map((id) => devices[id]).filter(Boolean)

      const count = listDevice?.length

      const key = count === 0 ? '0' : count === 1 ? '1' : 'multi'
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
