'use client'
import { useMounted } from '@/hooks'
import { useLayout } from '@/stores'
import { MapboxOverlay } from '@deck.gl/mapbox'
import {
  ArcLayer,
  Deck,
  IconLayer,
  log,
  PickingInfo,
  ScatterplotLayer,
  ScenegraphLayer,
  type Layer,
} from 'deck.gl'

import mapboxgl, { LngLatLike } from 'mapbox-gl'

import React, { memo, useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { delay } from '@/utils'
import { load } from '@loaders.gl/core'
import { GLBLoader, GLTFLoader } from '@loaders.gl/gltf'

interface CustomMapProps {
  layers?: Layer[]
}

type BartStation = {
  name: string
  entries: number
  exits: number
  coordinates: [longitude: number, latitude: number]
}

const layer = new IconLayer({
  id: 'IconLayer',
  data: 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/bart-stations.json',
  getColor: (d) => [Math.sqrt(d.exits), 140, 0],
  getIcon: (d) => 'marker',
  getPosition: (d) => [108.2204122, 16.0608127],
  getSize: 40,
  iconAtlas:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png',
  iconMapping:
    'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.json',
  pickable: true,
})

const centerPoint: [number, number] = [108.22003, 16.05486]

const radius = 0.0005 // Radius of circular path
const speed = 0.01 // Speed of rotation

const MapOverlay: React.FC<CustomMapProps> = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const { mounted } = useMounted()
  const [startBlur, setStartBlur] = useState(false)
  const { theme, systemTheme } = useTheme()

  const angleRef = useRef(0) // Track the current angle

  // useEffect(() => {
  //   if (!mounted || !window?.mapInstance) return

  //   const fetchModel = async () => {

  //     setModelUrl(model)
  //   }
  //   fetchModel()
  // }, [mounted, !!window?.mapInstance])

  function createRotatingLayer(rotation: number, model: any) {
    return new ScenegraphLayer({
      id: 'rotating-model',
      data: [{ position: [...centerPoint, 30] }], // Dữ liệu vị trí
      scenegraph: model,
      getPosition: (d) => d.position,
      getOrientation: [0, rotation, 0], // Xoay quanh trục Y (yaw)
      sizeScale: 200,
      pickable: true,
      _lighting: 'pbr',
    })
  }

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
    if (!mounted) return
    const mapInstance = window.mapInstance

    if (!mapContainerRef.current || !mapInstance) return

    initialMapInstance()

    return () => {
      // Clean up: remove controls and observers, destroy map instance
      if (mapContainerRef.current) {
        mapInstance.destroyMap()
      }
    }
  }, [mounted])

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

      const response = await fetch('/3d-model/RAK_3D.glb')
      const arrayBuffer = await response.arrayBuffer()

      const model = await load(arrayBuffer, GLTFLoader)

      const layers = [
        new ScenegraphLayer({
          id: '3d-model',
          data: [{ position: [...centerPoint, 30] }],
          scenegraph: model,
          getPosition: (d) => d.position,
          getOrientation: [0, 90, 90],
          sizeScale: 200,
          pickable: true,
          _lighting: 'pbr',
        }),
      ]

      const deckOverlay = new MapboxOverlay({
        interleaved: true,
        layers: [layers],
      })

      map.addControl(deckOverlay)

      map.addControl(new mapboxgl.NavigationControl())

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
        zoom: 18,
        duration: 8000,
        essential: true,
      })

      // center = [108.2204122, 16.0608127],

      map?.resize()
    })

    await delay(2000)

    // map?.style.map?.easeTo({
    //   zoom: 17,
    //   duration: 3000,
    // })

    // Load event to add overlay control
  }

  const animateModel = (model: any) => {
    angleRef.current += speed

    const newPosition = [
      centerPoint[0] + radius * Math.cos(angleRef.current),
      centerPoint[1] + radius * Math.sin(angleRef.current),
      50, // Altitude
    ]

    const rotatingModelLayer = new ScenegraphLayer({
      id: '3d-model',
      data: [{ position: centerPoint }],
      scenegraph: model,
      getPosition: (d) => d.position,
      getOrientation: [0, 90, 90],
      sizeScale: 200,
      pickable: true,
      // _lighting: 'pbr',
    })

    const deckOverlay = new MapboxOverlay({
      interleaved: true,
      layers: [rotatingModelLayer],
    })

    const map = window.mapInstance.getMapInstance()

    map?.addControl(deckOverlay)

    // Recursively call `animateModel` for continuous rotation
    window.requestAnimationFrame(animateModel)
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
