'use client'

import { useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { delay } from '@/utils'
import { MapType } from '@/utils/map'
import { useTheme } from 'next-themes'
import { memo, useEffect, useRef } from 'react'
import Supercluster from 'supercluster'
import { useShallow } from 'zustand/react/shallow'

const MapClusters = () => {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const supercluster = useRef<Supercluster | null>(null)

  const { resolvedTheme } = useTheme()

  const { devices } = useDeviceStore(
    useShallow((state) => ({
      devices: state.devices,
    }))
  )

  const { map, mapType } = useFleetTrackingStore(
    useShallow((state) => ({
      map: state.map,
      mapType:
        state.mapType ||
        (localStorage.getItem('fleet-tracking:mapType') as MapType) ||
        'default',
    }))
  )

  useEffect(() => {
    window.addEventListener('mapLoaded', (event) => {
      const map = (event as CustomEvent).detail.map as mapboxgl.Map
      mapRef.current = map
    })

    return () => {
      window.removeEventListener('mapLoaded', () => {
        mapRef.current = null
        supercluster.current = null
      })
    }
  }, [])

  useEffect(() => {
    if (map && supercluster.current) {
      initializeCluster(map)
    }
  }, [resolvedTheme, mapType, map])

  //cleanup layers
  useEffect(() => {
    if (!map) return

    return () => {
      cleanupLayers(map)
      supercluster.current = null
    }
  }, [map])

  useEffect(() => {
    if (!map) return

    map.on('moveend', () => {
      updateCluster(map)
    })

    map.on('zoomend', () => {
      updateCluster(map)
    })

    map.on('move', () => {
      updateCluster(map)
    })

    const handleClusterClicked = (e: mapboxgl.MapMouseEvent) => {
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
    }

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer'
    }

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = ''
    }

    // Add hover effects
    map.on('mouseenter', 'clusters', handleMouseEnter)
    map.on('mouseleave', 'clusters', handleMouseLeave)

    map.on('click', 'clusters', handleClusterClicked)

    return () => {
      map.off('move', () => updateCluster(map))
      map.off('moveend', () => updateCluster(map))
      map.off('zoomend', () => updateCluster(map))
      map.off('click', 'clusters', handleClusterClicked)
      map.off('mouseenter', 'clusters', handleMouseEnter)
      map.off('mouseleave', 'clusters', handleMouseLeave)
    }
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

    if (!map) return
    supercluster.current.load(geoJsonPoints as any)

    // if (map) {
    //   console.log('loading cluster')
    //   updateCluster()
    // }

    map?.on('style.load', () => {
      initializeCluster(map)
    })

    return () => {
      map?.off('style.load', () => initializeCluster(map))
    }
  }, [devices, map])

  //   useEffect(() => {
  //     if (!mapRef.current) return

  //     return () => {
  //       if (mapRef.current) mapRef.current.remove()
  //     }
  //   }, [mapRef.current])

  const updateCluster = (map: mapboxgl.Map) => {
    if (!map || !supercluster.current) return

    const bounds = map.getBounds()

    let bbox = [] as number[]

    if (bounds) {
      bbox = [
        bounds.getWest(),
        bounds.getSouth(),
        bounds.getEast(),
        bounds.getNorth(),
      ]
    }

    const zoom = Math.floor(map.getZoom())

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

    // console.log({
    //   clusterFeatures: mapRef.current.getSource('clusters'),
    // })

    // console.log({ mapRef, clusterFeatures, pointFeatures })

    // Update cluster source
    if (map.getSource('clusters')) {
      ;(map.getSource('clusters') as any)?.setData({
        type: 'FeatureCollection',
        features: clusterFeatures,
      })
    }

    // Update points source
    if (map.getSource('unclustered-points')) {
      ;(map.getSource('unclustered-points') as any)?.setData({
        type: 'FeatureCollection',
        features: pointFeatures,
      })
    }
  }

  const cleanupLayers = (map: mapboxgl.Map) => {
    if (!map) return

    const layers = ['clusters', 'cluster-count', 'unclustered-point']
    for (const id of layers) {
      if (map && typeof map.getLayer !== 'function') {
        map.removeLayer(id)
      }
    }

    const sources = ['clusters', 'unclustered-points']
    for (const id of sources) {
      if (map && typeof map.getLayer !== 'function' && map.getSource(id)) {
        map.removeSource(id)
      }
    }

    if (mapRef.current && mapRef.current.hasImage('cluster-gradient')) {
      mapRef.current.removeImage('cluster-gradient')
    }
  }

  const initializeCluster = async (map: mapboxgl.Map) => {
    if (map && typeof map.addSource === 'function') {
      await delay(800)
      if (!map.loaded()) return

      map.addSource('clusters', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      })

      // Add unclustered points source
      map.addSource('unclustered-points', {
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

      map.loadImage(path, (error, image) => {
        if (error) throw error
        if (!mapRef.current?.hasImage('cluster-gradient')) {
          mapRef.current?.addImage('cluster-gradient', image as any)
        }
      })

      // Add cluster layer
      map.addLayer({
        id: 'clusters',
        type: 'symbol',
        source: 'clusters',
        layout: {
          'icon-image': 'cluster-gradient',
          'icon-size': 0.25,
          'icon-allow-overlap': true,
        },
      })

      map.addLayer({
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
      map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'unclustered-points',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': '#11b4da',
          'circle-radius': 4,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
        },
      })
    }

    updateCluster(map)
  }

  return <></>
}

export default memo(MapClusters)
