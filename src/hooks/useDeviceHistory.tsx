import { MapboxOverlay } from '@deck.gl/mapbox'
import { IconLayer } from 'deck.gl'
import { useEffect, useRef } from 'react'
import { useDeviceStore } from '@/stores/device-store'
import { useShallow } from 'zustand/react/shallow'
import { useGlobalStore } from '@/stores'
import { usePrevious } from './usePrevious'
import { Checkpoint } from '@/types/trip'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { LngLatBoundsLike } from 'mapbox-gl'

export const useDeviceHistory = () => {
  const controlRef = useRef<any>(null)

  const { deviceSelected, deviceHistory } = useDeviceStore(
    useShallow((state) => ({
      deviceSelected: state.deviceSelected,
      deviceHistory: state.deviceHistory,
    }))
  )

  const { map } = useFleetTrackingStore(
    useShallow((state) => ({ map: state.map }))
  )

  const { mapType, isMapInitialized } = useGlobalStore(
    useShallow((state) => ({
      mapType: state.mapType,
      setMapType: state.setMapType,
      isMapInitialized: state.isMapInitialized,
    }))
  )

  const previousMapType = usePrevious(mapType)

  useEffect(() => {
    if (!map) return

    const handleStyleChange = () => {
      const isHasRouteLayer = !!(map._controls as any).find(
        (control: any) => control._props?.id === 'device-histories'
      )

      if (isHasRouteLayer) {
        startDrawHistory(deviceHistory)
      }
    }

    if (previousMapType !== mapType) {
      setTimeout(() => {
        handleStyleChange()
      }, 500)
    }
  }, [
    deviceSelected,
    isMapInitialized,
    mapType,
    previousMapType,
    deviceHistory,
  ])

  const getIconLayer = (coordinates: number[] = []) => {
    const layer = new IconLayer({
      id: 'IconLayer',
      data: [
        {
          name: 'Lafayette (LAFY)',
          code: 'LF',
          address: '3601 Deer Hill Road, Lafayette CA 94549',
          entries: '3481',
          exits: '3616',
          coordinates,
        },
      ],
      getColor: () => [Math.sqrt(3616), 140, 0],
      getIcon: () => ({
        url: '/favicon.ico',
        width: 128,
        height: 128,
      }),
      getPosition: (d: any) => d.coordinates,
      getSize: 40,
      // iconAtlas: '/favicon.ico',
      // iconMapping:
      //   'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json',
      pickable: true,
    })

    return layer
  }

  const startDrawHistory = async (checkpoints?: Checkpoint[]) => {
    const histories = checkpoints || deviceHistory
    if (!histories?.length) return
    const coordinates = histories.map((checkpoint) => [
      checkpoint.longitude,
      checkpoint.latitude,
    ])
    if (!map) return

    const controlIcon = (map?._controls as any).find(
      (control: any) => control._props?.id === 'device-histories'
    )

    if (controlIcon) {
      map?.removeControl(controlIcon)
    }

    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates,
      },
    }

    if (map?.getSource('route')) {
      ;(map?.getSource('route') as any)?.setData(geojson)
    } else {
      map?.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: geojson as any,
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#1052FF',
          'line-width': 8,
          'line-opacity': 0.75,
        },
      })
    }

    const icon = getIconLayer(coordinates[0])

    const deckOverlay = new MapboxOverlay({
      layers: [icon],
      id: 'device-histories',
    })

    controlRef.current = deckOverlay

    map?.addControl(deckOverlay)

    // Calculate bounds to fit all checkpoints
    if (coordinates.length > 0) {
      const bounds = coordinates.reduce(
        (bounds, coord) => {
          return [
            [
              Math.min(bounds[0][0], coord[0]),
              Math.min(bounds[0][1], coord[1]),
            ],
            [
              Math.max(bounds[1][0], coord[0]),
              Math.max(bounds[1][1], coord[1]),
            ],
          ]
        },
        [
          [coordinates[0][0], coordinates[0][1]],
          [coordinates[0][0], coordinates[0][1]],
        ]
      )

      map?.fitBounds(bounds as LngLatBoundsLike, {
        padding: { top: 100, bottom: 100, left: 100, right: 100 },
        duration: 5000,
        pitch: 45,
        bearing: 0,
      })
    }
  }

  const removeRoute = () => {
    if (!map) return

    // Remove the route layer if it exists
    if (map?.getLayer('route')) {
      map.removeLayer('route')
    }
    if (map?.getSource('route')) {
      map.removeSource('route')
    }

    const controlIcon = (map?._controls as any).find(
      (control: any) => control._props?.id === 'device-histories'
    )
    if (controlIcon) {
      map?.removeControl(controlIcon)
    }
  }

  return {
    startDrawHistory,
    removeRoute,
  }
}
