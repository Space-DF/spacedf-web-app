import { useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { delay } from '@/utils'
import * as mapboxgl from 'mapbox-gl'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef, useState } from 'react'
import Supercluster from 'supercluster'
import { useShallow } from 'zustand/react/shallow'
// Supercluster instance - outside hook to avoid reinitialization
const cluster = new Supercluster({
  maxZoom: 15,
  radius: 500,
})

export const useMapGroupCluster = () => {
  const devices = useDeviceStore(useShallow((state) => state.devices))
  const { map } = useFleetTrackingStore(
    useShallow((state) => ({ map: state.map }))
  )

  const [clusteredDeviceIds, setClusteredDeviceIds] = useState<Set<string>>(
    new Set()
  )
  const { resolvedTheme } = useTheme()

  const prevDeviceIdsRef = useRef<string[]>([])

  const updateClusters = useCallback(
    async (map: mapboxgl.Map, zoomOverride?: number) => {
      if (!map || !map.getBounds) return

      const bounds = map.getBounds()?.toArray().flat() as [
        number,
        number,
        number,
        number,
      ]

      await delay(500)

      const zoom = zoomOverride ?? Math.floor(map.getZoom())

      const clusters = cluster.getClusters(bounds, zoom)

      const newClusteredDeviceIds = new Set<string>()
      clusters.forEach((feature) => {
        if (feature.properties?.cluster) {
          const clusterId = feature.properties.cluster_id
          const leaves = cluster.getLeaves(clusterId, Infinity)
          leaves.forEach((leaf) => {
            // console.log({ leaves })
            if (leaf.properties?.id) {
              newClusteredDeviceIds.add(leaf.properties.id)
            }
          })
        }
      })

      setClusteredDeviceIds(newClusteredDeviceIds)

      const source = map.getSource('clusters-source') as mapboxgl.GeoJSONSource

      // console.log({ source })
      if (source) {
        source.setData({
          type: 'FeatureCollection',
          features: clusters,
        })
      }
    },
    []
  )

  useEffect(() => {
    const deviceArray = Object.values(devices)
    const newDeviceIds = deviceArray.map((d) => d.id).sort()

    if (
      JSON.stringify(prevDeviceIdsRef.current) === JSON.stringify(newDeviceIds)
    ) {
      return
    }

    prevDeviceIdsRef.current = newDeviceIds

    const validDevices = deviceArray.filter(
      (device) =>
        Array.isArray(device.latestLocation) &&
        device.latestLocation.length === 2
    )

    const points = validDevices.map((device) => ({
      type: 'Feature',
      properties: { id: device.id, type: device.type },
      geometry: {
        type: 'Point',
        coordinates: device.latestLocation as [number, number],
      },
    }))

    cluster.load(points as any)

    if (map) {
      updateClusters(map)
    }
  }, [devices, updateClusters, map])

  const loadMapGroupCluster = useCallback(
    (map: mapboxgl.Map) => {
      if (!map) return

      if (map.getSource('clusters-source')) return

      map.addSource('clusters-source', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
        cluster: false,
      })

      const path =
        resolvedTheme === 'dark'
          ? '/images/cluster-dark.png'
          : '/images/cluster-light.png'

      map.loadImage(path, (error, image) => {
        if (error) throw error
        if (!map.hasImage('cluster-gradient')) {
          map.addImage('cluster-gradient', image as any)
        }
      })

      map.addLayer({
        id: 'clusters',
        type: 'symbol',
        source: 'clusters-source',
        filter: ['has', 'point_count'],
        layout: {
          'icon-image': 'cluster-gradient',
          'icon-size': 0.25,
          'icon-allow-overlap': true,
        },
      })

      map.addLayer({
        id: 'cluster-count-shadow',
        type: 'symbol',
        source: 'clusters-source',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 16,
          'text-offset': [0, -0.4],
          'text-allow-overlap': true,
          'text-ignore-placement': true,
        },
        paint: {
          'text-color': '#ffffff', // 👈 Text color here
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

      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        })

        if (!features.length) return

        const clusterFeature = features[0]
        const clusterId = clusterFeature.properties?.cluster_id

        if (typeof clusterId !== 'number') return

        if (
          clusterFeature.geometry.type === 'Point' &&
          Array.isArray(clusterFeature.geometry.coordinates)
        ) {
          const coordinates = clusterFeature.geometry.coordinates as [
            number,
            number,
          ]
          const expansionZoom = cluster.getClusterExpansionZoom(clusterId)

          const wrappedLngLat = mapboxgl.LngLat.convert(coordinates)

          map.flyTo({
            center: wrappedLngLat,
            zoom: expansionZoom,
            speed: 1.6,
            curve: 1,
          })
        }
      })
    },
    [updateClusters, devices, resolvedTheme]
  )

  const isDeviceClustered = useCallback(
    (deviceId: string) => clusteredDeviceIds.has(deviceId),
    [clusteredDeviceIds]
  )

  const getDevicesInCluster = useCallback((clusterId: number) => {
    return cluster.getLeaves(clusterId, Infinity)
  }, [])

  const getClusterExpansionZoom = useCallback((clusterId: number) => {
    return cluster.getClusterExpansionZoom(clusterId)
  }, [])

  return {
    loadMapGroupCluster,
    updateClusters,
    isDeviceClustered,
    clusteredDeviceIds: Array.from(clusteredDeviceIds),
    getDevicesInCluster,
    getClusterExpansionZoom,
  }
}
