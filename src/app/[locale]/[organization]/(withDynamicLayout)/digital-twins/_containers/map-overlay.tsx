'use client'
import { useMounted } from '@/hooks'
import { useGlobalStore } from '@/stores'
import { type Layer } from 'deck.gl'

import mapboxgl from 'mapbox-gl'

import { cn } from '@/lib/utils'
import { delay } from '@/utils'
import { useTheme } from 'next-themes'
import React, { memo, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useGetDevices } from '@/hooks/useDevices'
import { useDeviceStore } from '@/stores/device-store'
import MapInstance from '@/utils/map-instance'
import { getClusters, useLoadDeviceModels } from '../_hooks/useLoadDeviceModels'
import { useSession } from 'next-auth/react'

interface CustomMapProps {
  layers?: Layer[]
}

const mapInstanceGlobal = MapInstance.getInstance()

const centerPoint: [number, number] = [108.223, 16.067]

const MapOverlay: React.FC<CustomMapProps> = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const { mounted } = useMounted()
  // const [isMapBlur, setStartBlur] = useState(false)
  const { theme, systemTheme } = useTheme()

  const { startShowDevice3D } = useLoadDeviceModels()
  // const { startLoadTrip } = useLoadTrip()
  const { isLoading: isDeviceFetching } = useGetDevices()

  const { initializedSuccess } = useDeviceStore(
    useShallow((state) => ({
      initializedSuccess: state.initializedSuccess,
    }))
  )

  const { status } = useSession()

  const prevAuthStatus = useRef(status)

  useEffect(() => {
    if (!window.mapInstance) return
    const map = window.mapInstance.getMapInstance()

    if (!map) return
    if (status !== prevAuthStatus.current) {
      map?.flyTo({
        center: centerPoint,
        zoom: 13,
        pitch: 45,
        bearing: 0,
        duration: 5000,
      })
    }
  }, [status, prevAuthStatus])

  const { setGlobalLoading, setMapInitialized, isMapBlur } = useGlobalStore(
    useShallow((state) => ({
      setGlobalLoading: state.setGlobalLoading,
      setMapInitialized: state.setMapInitialized,
      isMapInitialized: state.isMapInitialized,
      isMapBlur: state.isMapBlur,
    }))
  )

  const currentTheme = (theme === 'system' ? systemTheme : theme) as
    | 'dark'
    | 'light'

  useEffect(() => {
    if (!isDeviceFetching && initializedSuccess && mounted) {
      setGlobalLoading(false)
      initialMapInstance()
    } else {
      setGlobalLoading(true)
    }
    return () => {
      // Clean up: remove controls and observers, destroy map instance
      if (mapContainerRef.current && window.mapInstance) {
        window.mapInstance.destroyMap()
      }
    }
  }, [isDeviceFetching, initializedSuccess, mounted])

  const initialMapInstance = async () => {
    // Only initialize if not already initialized

    if (!mapContainerRef.current) return

    mapInstanceGlobal.initializeMap({
      container: mapContainerRef.current,
      // style: 'mapbox://styles/mapbox/standard',

      style: `mapbox://styles/mapbox/${currentTheme}-v11`,
    })

    window.mapInstance = mapInstanceGlobal
    window.mapLayer = []

    const map = mapInstanceGlobal.getMapInstance()

    setMapInitialized(true)

    map?.on('load', async () => {
      startShowDevice3D(map)

      map.addControl(new mapboxgl.NavigationControl())

      const updateClusters = () => {
        const bounds = map?.getBounds?.()?.toArray().flat() as [
          number,
          number,
          number,
          number,
        ]
        const zoom = Math.floor(map.getZoom())

        const clusters = getClusters(bounds, zoom)
        const source = map.getSource(
          'clusters-source'
        ) as mapboxgl.GeoJSONSource

        if (source) {
          source.setData({
            type: 'FeatureCollection',
            features: clusters,
          })
        }
      }

      addMapClusters(map)

      map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['clusters'], // Ensure this matches the layer ID
        })

        if (!features.length) {
          console.error('No cluster feature found.')
          return
        }

        const clusterFeature = features[0]

        const clusterId = clusterFeature?.properties?.cluster_id

        if (!clusterId) {
          console.error('Invalid cluster ID:', clusterFeature)
          return
        }

        // const source = map.getSource(
        //   'clusters-source'
        // ) as mapboxgl.GeoJSONSource

        if (clusterId) {
          const coordinates = (clusterFeature.geometry as any).coordinates

          onClusterClick(clusterId, coordinates)
        } else {
          console.error('Cluster ID not found.')
        }
      })

      const handleZoom = () => {
        console.log('zoom')
      }

      map.on('move', () => {
        updateClusters()
        handleZoom()
      })
      map.on('zoom', () => {
        updateClusters()
        handleZoom()
      })

      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        })
      )

      map.addControl(new mapboxgl.FullscreenControl())

      await delay(100)

      map.flyTo({
        center: centerPoint,
        zoom: 13,
        pitch: 45,
        bearing: 0,
        duration: 5000,
      })

      map?.resize()
    })

    await delay(2000)
  }

  const addMapClusters = (map: any) => {
    map.addSource('clusters-source', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [],
      },
      cluster: true,
      clusterMaxZoom: 16,
      clusterRadius: 50,
      extent: 256, // Kích thước lưới
      nodeSize: 64, // Kích thước node trong R-tree
    })

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

  const onClusterClick = (
    clusterId: number,
    clusterCoordinates: [number, number]
  ) => {
    try {
      const zoom = window.cluster.getClusterExpansionZoom(clusterId) + 4
      const map = window.mapInstance?.getMapInstance()

      if (map) {
        if (
          ['mercator', 'equirectangular'].includes(map.getProjection().name)
        ) {
          while (Math.abs(clusterCoordinates[0] - map.getCenter().lng) > 180) {
            clusterCoordinates[0] +=
              clusterCoordinates[0] > map.getCenter().lng ? -360 : 360
          }
        }

        map?.flyTo({
          center: clusterCoordinates,
          zoom: zoom,
          duration: 2000,
        })
      }
    } catch (error) {
      console.error('Error calculating expansion zoom:', error)
    }
  }

  if (!mounted) return <></>

  if (isDeviceFetching) return <MapSkeleton />

  return (
    <div
      ref={mapContainerRef}
      className={cn(
        '!absolute inset-0 h-full !w-full !overflow-hidden !duration-1000',
        isMapBlur
          ? 'bg-[#DBDBDC] bg-opacity-80 blur-md backdrop-blur-md dark:!bg-black'
          : 'blur-none'
      )}
      id="map-container"
    />
  )
}

const MapSkeleton = () => {
  return (
    <div role="status" className="max-w-sm animate-pulse">
      <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
      <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export default memo(MapOverlay)
