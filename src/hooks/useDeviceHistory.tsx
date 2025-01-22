import { MapboxOverlay } from '@deck.gl/mapbox'
import { IconLayer, TripsLayer } from 'deck.gl'
import { useRef } from 'react'

export const useDeviceHistory = () => {
  const controlRef = useRef<any>(null)
  async function getRoute(dataHistories: Record<string, any>) {
    const end = dataHistories.end
    const start = dataHistories.start

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.join(',')};${end.join(',')}?geometries=geojson&access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`

    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch route data')
      const data = await response.json()

      const route = data.routes[0].geometry.coordinates

      const waypoints = route.map((coord: any, index: number) => ({
        coordinates: coord,
        timestamp: index * 1000,
      }))

      const tripData = [{ waypoints }]

      console.log(JSON.stringify(tripData, null, 2))

      return tripData
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

  const startDrawHistory = async (dataHistories: Record<string, any>) => {
    const mapInstance = window.mapInstance
    const map = mapInstance.getMapInstance()

    if (controlRef.current) {
      map?.removeControl(controlRef.current)
    }
    // map?.removeLayer('IconLayer')

    const data = await getRoute(dataHistories)
    const firstCoordinates = data?.[0]?.waypoints?.[0]
    const lastCoordinates =
      data?.[0]?.waypoints?.[data[0]?.waypoints?.length - 1]
    const currentTime = lastCoordinates?.timestamp
    const layer = new TripsLayer<any>({
      id: 'TripsLayer',
      data: data, // Dẫn đến file JSON mới
      getPath: (d) => d.waypoints.map((p: any) => p.coordinates),
      getTimestamps: (d) => d.waypoints.map((p: any) => p.timestamp),
      getColor: [253, 128, 93],
      currentTime,
      trailLength: Number.MAX_SAFE_INTEGER,
      capRounded: true,
      jointRounded: true,
      widthMinPixels: 8,
    })

    const icon = getIconLayer(firstCoordinates.coordinates)

    const deckOverlay = new MapboxOverlay({
      layers: [layer, icon],
      id: 'device-histories',
    })

    controlRef.current = deckOverlay

    map?.addControl(deckOverlay)

    map?.flyTo({
      center: lastCoordinates?.coordinates || [],
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
