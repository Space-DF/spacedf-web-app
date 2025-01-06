'use client'
import { useMounted } from '@/hooks'
import { useLayout } from '@/stores'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ScenegraphLayer, type Layer } from 'deck.gl'

import Supercluster from 'supercluster'

import mapboxgl from 'mapbox-gl'

import { cn } from '@/lib/utils'
import { delay } from '@/utils'
import { useTheme } from 'next-themes'
import React, { memo, useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useDeviceStore } from '@/stores/device-store'
import { animate, linear } from 'popmotion'
import { getClusters, useLoadDeviceModels } from '../_hooks/useLoadDeviceModels'
import { useLoadTrip } from '../_hooks/useLoadTrip'

interface CustomMapProps {
  layers?: Layer[]
}

const centerPoint: [number, number] = [108.223, 16.067]

const MapOverlay: React.FC<CustomMapProps> = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const { mounted } = useMounted()
  const [startBlur, setStartBlur] = useState(false)
  const { theme, systemTheme } = useTheme()

  const { startShowDevice3D } = useLoadDeviceModels()
  const { startLoadTrip } = useLoadTrip()

  const { initializedSuccess } = useDeviceStore(
    useShallow((state) => ({
      initializedSuccess: state.initializedSuccess,
    })),
  )

  const currentTheme = (theme === 'system' ? systemTheme : theme) as
    | 'dark'
    | 'light'

  // [108.2204122, 16.0608127]

  const { dynamicLayouts, isCollapsed } = useLayout(
    useShallow((state) => ({
      dynamicLayouts: state.dynamicLayouts,
      isCollapsed: state.isCollapsed,
    })),
  )

  useEffect(() => {
    updateMapTheme(theme as typeof currentTheme)
  }, [theme])

  useEffect(() => {
    adjustMapPadding()
  }, [dynamicLayouts])

  const adjustMapPadding = async () => {
    setStartBlur(true)
    await delay(300)

    const dynamicLayoutElementWidth =
      document.getElementById('region-dynamic-layout')?.clientWidth || 0

    // Get the map instance and apply the right padding smoothly
    const map = window.mapInstance?.getMapInstance()

    if (map) {
      map.easeTo({
        padding: {
          right: dynamicLayoutElementWidth / 2,
        },
        duration: 1000, // Set the duration for smoothness
      })

      map?.resize()

      await delay(200)

      setStartBlur(false)
    }
  }

  useEffect(() => {
    if (!window.mapInstance) return
    resizeSidebar()
  }, [isCollapsed])

  useEffect(() => {
    if (!mounted || !initializedSuccess) return
    const mapInstance = window.mapInstance

    if (!mapContainerRef.current || !mapInstance) return

    initialMapInstance()

    return () => {
      // Clean up: remove controls and observers, destroy map instance
      if (mapContainerRef.current) {
        mapInstance.destroyMap()
      }
    }
  }, [mounted, initializedSuccess])

  const initialMapInstance = async () => {
    // Only initialize if not already initialized
    const mapInstance = window.mapInstance

    if (!mapInstance || !mapContainerRef.current) return

    mapInstance.initializeMap({
      container: mapContainerRef.current,
      style: `mapbox://styles/mapbox/${currentTheme}-v11`,
    })

    const map = mapInstance.getMapInstance()

    map?.on('load', async () => {
      mapInstance.apply3DBuildingLayer()

      startShowDevice3D(map)

      startLoadTrip()

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
          'clusters-source',
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

        const source = map.getSource(
          'clusters-source',
        ) as mapboxgl.GeoJSONSource

        if (clusterId) {
          const coordinates = (clusterFeature.geometry as any).coordinates

          onClusterClick(clusterId, coordinates)
        } else {
          console.error('Cluster ID not found.')
        }
      })

      map.on('move', updateClusters)
      map.on('zoom', updateClusters)

      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        }),
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
    clusterCoordinates: [number, number],
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

  const resizeSidebar = () => {
    const map = window.mapInstance?.getMapInstance()
    setStartBlur(true)

    setTimeout(() => {
      const sidebarWidth =
        document.getElementById('sidebar-id')?.clientWidth || 0

      map?.easeTo({
        padding: {
          left: sidebarWidth,
        },
        duration: 1000, // Set the duration for smoothness
      })

      map?.resize()

      setTimeout(() => {
        setStartBlur(false)
      }, 200)
    }, 300)
  }

  const updateMapTheme = async (theme: typeof currentTheme) => {
    const maps = window.mapInstance

    if (!maps) return

    const mapStyle = maps.getMapStyle()

    const layerId = mapStyle?.layers?.find(
      (layer: any) => layer.type === 'symbol',
    )?.id

    if (!layerId) return

    const allMapInstance = maps.getMapInstance()

    allMapInstance?.setStyle(`mapbox://styles/mapbox/${theme}-v11`, layerId)
    setStartBlur(true)

    await delay(300)

    maps.apply3DBuildingLayer()

    await delay(200)

    setStartBlur(false)

    addMapClusters(allMapInstance)
  }

  if (!mounted) return <></>

  return (
    <div
      ref={mapContainerRef}
      className={cn(
        '!absolute inset-0 h-full !w-full !overflow-hidden !duration-1000',
        startBlur
          ? 'bg-[#DBDBDC] bg-opacity-80 blur-md backdrop-blur-md dark:!bg-black'
          : 'blur-none',
      )}
      id="map-container"
    />
  )
}

export default memo(MapOverlay)
