'use client'

import { useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { useTheme } from 'next-themes'
import { memo, useEffect, useRef } from 'react'
import Supercluster from 'supercluster'
import { useShallow } from 'zustand/react/shallow'

const MaxZoom = 14

const MapClusters = () => {
  const supercluster = useRef<Supercluster | null>(null)

  const { resolvedTheme } = useTheme()

  const { devices } = useDeviceStore(
    useShallow((state) => ({
      devices: state.devices,
    }))
  )

  const { map, updateBooleanState } = useFleetTrackingStore(
    useShallow((state) => ({
      map: state.map,
      isClusterVisible: state.isClusterVisible,
      updateBooleanState: state.updateBooleanState,
    }))
  )

  useEffect(() => {
    if (!map) return

    map.on('style.load', () => {
      supercluster.current = new Supercluster({
        radius: 60,
        maxZoom: MaxZoom,
        minPoints: 1,
      })

      const devicesArray = Object.values(devices)

      //   // Convert to GeoJSON and load
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

      initializeCluster(map)
      updateCluster(map)

      // loadCluster()
    })

    map.on('moveend', () => {
      updateCluster(map)
    })

    map.on('zoomend', () => {
      handleClusterVisibleChange(map)
      updateCluster(map)
    })

    map.on('move', () => {
      updateCluster(map)
    })

    return () => {
      if (map) {
        map.off('style.load', () => {
          initializeCluster(map)
          updateCluster(map)
        })

        map.off('moveend', () => {
          updateCluster(map)
        })

        map.off('zoomend', () => {
          updateCluster(map)
        })

        map.off('move', () => {
          updateCluster(map)
        })
      }
    }
  }, [map, devices])

  // useEffect(() => {
  //   setClusterImagePath(
  //     resolvedTheme === 'dark'
  //       ? '/images/cluster-dark.png'
  //       : '/images/cluster-light.png'
  //   )
  // }, [resolvedTheme])

  useEffect(() => {
    if (!map) return

    const path =
      resolvedTheme === 'dark'
        ? '/images/cluster-dark.png'
        : '/images/cluster-light.png'

    if (map.hasImage('cluster-gradient')) {
      map.removeImage('cluster-gradient')
    }

    map.loadImage(path, (error, image) => {
      if (error) throw error
      map.addImage('cluster-gradient', image as any)
      updateCluster(map)
    })
  }, [map, resolvedTheme])

  useEffect(() => {
    if (!map) return
    const handleClusterClicked = (e: mapboxgl.MapMouseEvent) => {
      const features = e.features
      if (!features?.length || !supercluster.current || !map) return

      const clusterFeature = features[0]
      const { cluster_id } = clusterFeature.properties!

      try {
        // If it's a fake cluster (single point)
        if (
          typeof cluster_id === 'string' &&
          cluster_id.startsWith('single-')
        ) {
          map.flyTo({
            center: (clusterFeature.geometry as any).coordinates,
            zoom: Math.max(map.getZoom() + 2, 15),
            duration: 500,
          })
          return
        }

        // If it's a real cluster (in Supercluster)
        let expansionZoom =
          supercluster.current.getClusterExpansionZoom(cluster_id)

        // Limit max zoom to prevent zooming too close
        expansionZoom = Math.min(expansionZoom, 16)

        map.flyTo({
          center: (clusterFeature.geometry as any).coordinates,
          zoom: expansionZoom,
          duration: 500,
        })
      } catch (error) {
        console.error('❌ Error getting expansion zoom:', error)

        // Fallback: only zoom slightly
        map.flyTo({
          center: (clusterFeature.geometry as any).coordinates,
          zoom: Math.min(map.getZoom() + 2, 16),
          duration: 500,
        })
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
      map.off('move', () => {
        // handleClusterVisibleChange(map)
        updateCluster(map)
      })
      map.off('moveend', () => updateCluster(map))
      map.off('zoomend', () => updateCluster(map))
      map.off('click', 'clusters', handleClusterClicked)
      map.off('mouseenter', 'clusters', handleMouseEnter)
      map.off('mouseleave', 'clusters', handleMouseLeave)
    }
  }, [map])

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

    const zoom = map.getZoom()

    const clusters = supercluster.current.getClusters(bbox as any, zoom)

    const clusterFeatures = [] as any[]
    const pointFeatures = [] as any[]

    clusters.forEach((cluster) => {
      if (cluster.properties.cluster) {
        clusterFeatures.push(cluster)
      } else {
        if (zoom < MaxZoom + 1) {
          //handle fake cluster when only one device is visible
          const fakeCluster = {
            type: 'Feature',
            geometry: cluster.geometry,
            properties: {
              ...cluster.properties,
              cluster: true,
              cluster_id: `single-${cluster.properties.id || cluster.properties.deviceId}`,
              point_count: 1,
              point_count_abbreviated: 1,
            },
          }
          clusterFeatures.push(fakeCluster)
        } else {
          //show normal point when zoom >= MaxZoom
          pointFeatures.push(cluster)
        }
      }
    })

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

    window.supercluster = supercluster.current as any
  }

  const initializeCluster = (map: mapboxgl.Map) => {
    if (!map) return
    if (!map.getSource('clusters')) {
      map.addSource('clusters', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      })
    }
    // Add unclustered points source
    if (!map.getSource('unclustered-points')) {
      map.addSource('unclustered-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      })
    }

    // Add cluster layer
    if (!map.getLayer('clusters')) {
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
    }

    if (!map.getLayer('cluster-count')) {
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
    }

    // Add individual points layer
    if (!map.getLayer('unclustered-point')) {
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
  }

  const handleClusterVisibleChange = (map: mapboxgl.Map) => {
    if (!map || !supercluster.current) return

    const zoom = map.getZoom()
    const bounds = map.getBounds()
    if (!bounds) return

    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ]

    const clusters = supercluster.current?.getClusters(bbox as any, zoom)

    const hasCluster = clusters.some((f: any) => !!f.properties.cluster)

    updateBooleanState('isClusterVisible', hasCluster)
  }

  return <></>
}

export default memo(MapClusters)
