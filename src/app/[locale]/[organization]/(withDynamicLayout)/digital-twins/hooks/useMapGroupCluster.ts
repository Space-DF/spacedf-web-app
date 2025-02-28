import { useEffect } from 'react'
import { checkMapRendered } from '../helper'
import Supercluster from 'supercluster'
import { useShallow } from 'zustand/react/shallow'
import { useDeviceStore } from '@/stores/device-store'

const cluster = new Supercluster({
  radius: 10,
  maxZoom: 13,
  extent: 256,
  nodeSize: 64,
})

const getClusters = (
  bounds: [number, number, number, number],
  zoom: number
) => {
  return cluster.getClusters(bounds, zoom)
}

export const useMapGroupCluster = () => {
  const devices = useDeviceStore(useShallow((state) => state.devices))
  useEffect(() => {
    if (!Object.keys(devices).length) return
    const devicePoints = Object.values(devices)
      .filter(
        (device) =>
          Array.isArray(device.location) && device.location.length === 2
      ) // Ensure valid locations
      .map((device) => ({
        type: 'Feature',
        properties: { id: device.id, type: device.type },
        geometry: {
          type: 'Point',
          coordinates: device.latestLocation as [number, number],
        },
      }))

    cluster.load(devicePoints as any)
  }, [JSON.stringify(devices)])

  const loadMapGroupCluster = () => {
    const mapRenderer = checkMapRendered()
    if (!mapRenderer) return

    const map = window.mapInstance?.getMapInstance()

    if (!map) return

    if (map?.getSource('clusters-source')) return

    map.addSource('clusters-source', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
      cluster: true,
      clusterMaxZoom: 16,
      clusterRadius: 50,
      extent: 256,
      nodeSize: 64,
    } as any)

    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'clusters-source',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          100,
          '#f1f075',
          750,
          '#f28cb1',
        ],
        'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
      },
    })

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'clusters-source',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
    })

    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'clusters-source',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#11b4da',
        'circle-radius': 4,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff',
      },
    })
  }

  const updateClusters = (zoomProp?: number) => {
    const mapRenderer = checkMapRendered()
    if (!mapRenderer) return

    const map = window.mapInstance?.getMapInstance()

    if (!map) return

    const bounds = map?.getBounds?.()?.toArray().flat() as [
      number,
      number,
      number,
      number,
    ]

    let zoom = zoomProp

    if (!zoom) {
      zoom = Math.floor(map.getZoom())
    }

    const clusters = getClusters(bounds, zoom)

    const source = map.getSource('clusters-source') as mapboxgl.GeoJSONSource

    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: clusters,
      })
    }
  }

  return {
    loadMapGroupCluster,
    updateClusters,
  }
}
