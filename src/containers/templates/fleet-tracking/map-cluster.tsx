'use client'

import { useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { FleetTrackingMap } from '@/utils/fleet-tracking-map/map-instance'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useRef } from 'react'
import Supercluster from 'supercluster'
import { useShallow } from 'zustand/react/shallow'

const MaxZoom = 15

const fleetTrackingMap = FleetTrackingMap.getInstance()
export const MapCluster = () => {
  const supercluster = useRef<Supercluster | null>(null)

  const devices = useDeviceStore(
    useShallow((state) => state.devicesFleetTracking)
  )
  const { resolvedTheme } = useTheme()

  const { mapType, updateBooleanState } = useFleetTrackingStore(
    useShallow((state) => ({
      mapType: state.mapType,
      isClusterVisible: state.isClusterVisible,
      updateBooleanState: state.updateBooleanState,
    }))
  )

  useEffect(() => {
    const handleClusterClicked = (e: mapboxgl.MapMouseEvent) => {
      const map = fleetTrackingMap.getMap()
      if (!map || !supercluster.current) return

      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters'],
      })
      if (!features.length) return

      const clusterFeature = features[0]
      const { cluster_id } = clusterFeature.properties ?? {}

      try {
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

        if (
          typeof cluster_id === 'number' &&
          supercluster.current.getClusterExpansionZoom
        ) {
          let expansionZoom =
            supercluster.current.getClusterExpansionZoom(cluster_id)
          expansionZoom = Math.min(expansionZoom, 16)

          map.flyTo({
            center: (clusterFeature.geometry as any).coordinates,
            zoom: expansionZoom,
            duration: 500,
          })
        }
      } catch (error) {
        console.error('❌ Error getting expansion zoom:', error)

        map.flyTo({
          center: (clusterFeature.geometry as any).coordinates,
          zoom: Math.min(map.getZoom() + 2, 16),
          duration: 500,
        })
      }
    }

    const handleClusterClick = (e: mapboxgl.MapMouseEvent) => {
      const map = fleetTrackingMap.getMap()
      if (!map) return
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['clusters'],
      })

      if (!features.length) return
      handleClusterClicked(e)
    }

    const handleMapLoaded = (map: mapboxgl.Map) => {
      initializeCluster(map)
    }

    fleetTrackingMap.on('style.load', handleMapLoaded)
    fleetTrackingMap.on('click', (e: unknown) =>
      handleClusterClick(e as mapboxgl.MapMouseEvent)
    )

    return () => {
      const map = fleetTrackingMap.getMap()
      fleetTrackingMap.off('style.load', handleMapLoaded)

      if (map?.getLayer('clusters')) {
        map.off('click', 'clusters', handleClusterClicked)
      }
    }
  }, [devices])

  useEffect(() => {
    fleetTrackingMap.on('move', updateCluster)

    return () => {
      fleetTrackingMap.off('move', updateCluster)
    }
  }, [])

  useEffect(() => {
    loadClusterFromDevices()
    if (fleetTrackingMap?.getMap()) {
      updateCluster(fleetTrackingMap.getMap()!)
    }
  }, [devices])

  useEffect(() => {
    const handleClusterImage = (map: mapboxgl.Map) => {
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
      })

      updateCluster(map)
    }

    fleetTrackingMap.on('style.load', handleClusterImage)

    return () => {
      fleetTrackingMap.off('style.load', handleClusterImage)
    }
  }, [mapType, resolvedTheme])

  const loadClusterFromDevices = () => {
    if (!supercluster.current) return
    const devicesArray = Object.values(devices)

    const geoJsonPoints = devicesArray.map((device) => ({
      type: 'Feature',
      properties: device,
      geometry: {
        type: 'Point',
        coordinates: [
          device.deviceProperties?.latest_checkpoint_arr?.[0] ?? 0,
          device.deviceProperties?.latest_checkpoint_arr?.[1] ?? 0,
        ],
      },
    }))
    supercluster.current.load(geoJsonPoints as any)
  }

  const initializeCluster = (map: mapboxgl.Map) => {
    if (!map) return

    supercluster.current = new Supercluster({
      radius: 60,
      maxZoom: MaxZoom,
    })

    if (!map.getSource('clusters')) {
      map.addSource('clusters', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      })
    }

    if (!map.getSource('unclustered-points')) {
      map.addSource('unclustered-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      })
    }

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

    loadClusterFromDevices()
  }

  const updateCluster = useCallback((map: mapboxgl.Map) => {
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
              cluster: map.getZoom() < MaxZoom + 1 ? false : true,
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

    const hasCluster = !!clusterFeatures.length || zoom < MaxZoom + 1

    updateBooleanState('isClusterVisible', hasCluster)

    if (map.getSource('unclustered-points')) {
      ;(map.getSource('unclustered-points') as any)?.setData({
        type: 'FeatureCollection',
        features: pointFeatures,
      })
    }
  }, [])
  return <></>
}
