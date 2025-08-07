'use client'

import { useDeviceStore } from '@/stores/device-store'
import { memo, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import Supercluster from 'supercluster'
import { useDeviceMapsStore } from '@/stores/template/device-maps'
import { delay } from '@/utils'
import { useTheme } from 'next-themes'
import { MapType } from '@/utils/map'

const MapClusters = () => {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const supercluster = useRef<Supercluster | null>(null)

  const { resolvedTheme } = useTheme()

  const { devices } = useDeviceStore(
    useShallow((state) => ({
      devices: state.devices,
    }))
  )

  const { map, mapType } = useDeviceMapsStore(
    useShallow((state) => ({
      map: state.map,
      mapType:
        state.mapType ||
        (localStorage.getItem('mapType') as MapType) ||
        'default',
    }))
  )

  useEffect(() => {
    window.addEventListener('mapLoaded', (event) => {
      const map = (event as CustomEvent).detail.map as mapboxgl.Map
      mapRef.current = map

      initializeCluster()
    })

    return () => {
      window.removeEventListener('mapLoaded', () => {
        mapRef.current = null
        supercluster.current = null
      })
    }
  }, [])

  useEffect(() => {
    if (mapRef.current && supercluster.current) {
      initializeCluster()
    }
  }, [resolvedTheme, mapType])

  useEffect(() => {
    if (!map) return

    map.on('moveend', () => {
      updateCluster()
    })

    map.on('zoomend', () => {
      updateCluster()
    })

    map.on('move', () => {
      updateCluster()
    })

    // Add hover effects
    map.on('mouseenter', 'clusters', () => {
      map.getCanvas().style.cursor = 'pointer'
    })

    map.on('mouseleave', 'clusters', () => {
      map.getCanvas().style.cursor = ''
    })

    map.on('click', 'clusters', (e) => {
      const features = e.features!
      const clusterId = features[0].properties!.cluster_id

      if (supercluster.current) {
        try {
          let expansionZoom =
            supercluster.current.getClusterExpansionZoom(clusterId)

          if (expansionZoom <= 12) {
            expansionZoom = 14
          }

          if (map) {
            map.flyTo({
              center: (features[0].geometry as any).coordinates,
              zoom: expansionZoom,
              duration: 500,
            })
          }
        } catch (error) {
          console.error('❌ Error getting expansion zoom:', error)
          // Fallback: just zoom in by 2 levels
          if (map) {
            map.flyTo({
              center: (features[0].geometry as any).coordinates,
              zoom: map.getZoom() + 2,
              duration: 500,
            })
          }
        }
      }
    })
  }, [map])

  // Initialize Supercluster
  useEffect(() => {
    // Setup Supercluster
    supercluster.current = new Supercluster({
      radius: 60,
      maxZoom: 14,
      minPoints: 1,
    })

    const devicesArray = Object.values(devices)

    // Convert to GeoJSON and load
    const geoJsonPoints = devicesArray.map((device) => ({
      type: 'Feature',
      properties: device,
      geometry: {
        type: 'Point',
        coordinates: [
          device.latestLocation?.[0] ?? 0,
          device.latestLocation?.[1] ?? 0,
        ],
      },
    }))

    supercluster.current.load(geoJsonPoints as any)

    if (mapRef.current) {
      updateCluster()
    }
  }, [devices])

  //   useEffect(() => {
  //     if (!mapRef.current) return

  //     return () => {
  //       if (mapRef.current) mapRef.current.remove()
  //     }
  //   }, [mapRef.current])

  const updateCluster = () => {
    if (!mapRef.current || !supercluster.current) return

    const bounds = mapRef.current.getBounds()

    let bbox = [] as number[]

    if (bounds) {
      bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ]
    }

    const zoom = Math.floor(mapRef.current.getZoom())

    const clusters = supercluster.current.getClusters(bbox as any, zoom)

    const clusterFeatures = [] as any[]
    const pointFeatures = [] as any[]

    clusters.forEach((cluster) => {
      if (cluster.properties.cluster) {
        clusterFeatures.push(cluster)
      } else {
        pointFeatures.push(cluster)
      }
    })

    // console.log({ mapRef, clusterFeatures, pointFeatures })

    // Update cluster source
    if (mapRef.current.getSource('clusters')) {
      ;(mapRef.current.getSource('clusters') as any)?.setData({
        type: 'FeatureCollection',
        features: clusterFeatures,
      })
    }

    // Update points source
    if (mapRef.current.getSource('unclustered-points')) {
      ;(mapRef.current.getSource('unclustered-points') as any)?.setData({
        type: 'FeatureCollection',
        features: pointFeatures,
      })
    }
  }

  const initializeCluster = async () => {
    if (!mapRef.current) return

    await delay(500)

    mapRef.current.addSource('clusters', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    })

    // Add unclustered points source
    mapRef.current.addSource('unclustered-points', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
    })

    const path =
      resolvedTheme === 'dark'
        ? '/images/cluster-dark.png'
        : '/images/cluster-light.png'

    mapRef.current.loadImage(path, (error, image) => {
      if (error) throw error
      if (!mapRef.current?.hasImage('cluster-gradient')) {
        mapRef.current?.addImage('cluster-gradient', image as any)
      }
    })

    // Add cluster layer
    mapRef.current.addLayer({
      id: 'clusters',
      type: 'symbol',
      source: 'clusters',
      layout: {
        'icon-image': 'cluster-gradient',
        'icon-size': 0.25,
        'icon-allow-overlap': true,
      },
    })

    mapRef.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'clusters',
      layout: {
        'text-field': '{point_count}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 16,
        'text-offset': [0, -0.4],
        'text-allow-overlap': true,
        'text-ignore-placement': true,
      },
      paint: {
        'text-color': '#ffffff',
      },
    })

    // Add individual points layer
    mapRef.current.addLayer({
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

    setTimeout(() => {
      updateCluster()
    }, 1000)
  }

  return <></>
}

export default memo(MapClusters)
