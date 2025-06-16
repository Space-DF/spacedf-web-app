import { MapboxOverlay } from '@deck.gl/mapbox'
import { IconLayer } from 'deck.gl'
import { useEffect, useRef } from 'react'
import { useGetDevices } from './useDevices'
import { useDeviceStore } from '@/stores/device-store'
import { useShallow } from 'zustand/react/shallow'
import { useGlobalStore } from '@/stores'
import { usePrevious } from './usePrevious'

export const useDeviceHistory = () => {
  const controlRef = useRef<any>(null)

  const { data: devices } = useGetDevices()

  const { deviceSelected } = useDeviceStore(
    useShallow((state) => ({
      deviceSelected: state.deviceSelected,
    }))
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
    if (!window.mapInstance || !isMapInitialized) return

    const map = window.mapInstance.getMapInstance()
    if (!map) return

    const handleStyleChange = () => {
      const isHasRouteLayer = !!(map._controls as any).find(
        (control: any) => control._props?.id === 'device-histories'
      )

      if (isHasRouteLayer) {
        startDrawHistory()
      }
    }

    if (previousMapType !== mapType) {
      setTimeout(() => {
        handleStyleChange()
      }, 500)
    }
  }, [deviceSelected, isMapInitialized, mapType, previousMapType])

  async function getRoute(dataHistories: Record<string, any>) {
    const end = dataHistories.end
    const start = dataHistories.start

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.join(',')};${end.join(',')}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`

    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch route data')
      const data = await response.json()

      const route = data.routes[0].geometry.coordinates

      return route
    } catch (error) {
      console.error('Error fetching route:', error)
    }
  }

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

  const startDrawHistory = async (deviceId?: string) => {
    const currentDevice = deviceId || deviceSelected

    if (!devices || !currentDevice) return

    const deviceData = devices[+currentDevice - 1]

    const dataHistories = deviceData?.histories

    const mapInstance = window.mapInstance
    const map = mapInstance.getMapInstance()

    const controlIcon = (map?._controls as any).find(
      (control: any) => control._props?.id === 'device-histories'
    )

    if (controlIcon) {
      map?.removeControl(controlIcon)
    }

    // if (controlRef.current) {
    //   map?.removeControl(controlRef.current)
    // }
    // map?.removeLayer('IconLayer')

    const data = await getRoute(dataHistories)

    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: data,
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

    const icon = getIconLayer(data[0])

    const deckOverlay = new MapboxOverlay({
      layers: [icon],
      id: 'device-histories',
    })

    controlRef.current = deckOverlay

    map?.addControl(deckOverlay)

    map?.flyTo({
      center: data[data.length - 1] || [],
      zoom: 16,
      pitch: 45,
      bearing: 0,
      duration: 5000,
    })
  }

  return {
    startDrawHistory,
  }
}
