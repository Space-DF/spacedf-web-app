import { MapboxOverlay } from '@deck.gl/mapbox'
import { IconLayer, ScenegraphLayer } from 'deck.gl'
import { useEffect, useRef } from 'react'
import { useDeviceStore } from '@/stores/device-store'
import { useShallow } from 'zustand/react/shallow'
import { useGlobalStore } from '@/stores'
import { usePrevious } from './usePrevious'
import { Checkpoint } from '@/types/trip'
import { LngLatBoundsLike, Popup } from 'mapbox-gl'
import { FleetTrackingMap } from '@/utils/fleet-tracking-map/map-instance'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { MultiTrackerLayerInstance } from '@/utils/fleet-tracking-map/layer-instance/multi-tracker-instance'
import { animate, linear } from 'popmotion'
import { MarkerInstance } from '@/utils/fleet-tracking-map/layer-instance/marker-instance'

const markerInstance = MarkerInstance.getInstance()
const fleetTrackingMap = FleetTrackingMap.getInstance()
const multiTrackerLayerInstance = MultiTrackerLayerInstance.getInstance()
export const useDeviceHistory = () => {
  const controlRef = useRef<any>(null)
  const rotationRef = useRef<number>(0)
  const animationControlRef = useRef<any>(null)
  const deviceHistory = useDeviceStore(
    useShallow((state) => state.deviceHistory)
  )
  const deviceSelected = useDeviceStore((state) => state.deviceSelected)
  const devices = useDeviceStore(
    useShallow((state) => state.devicesFleetTracking)
  )
  const deviceModels = useDeviceStore(useShallow((state) => state.models))
  const setDeviceHistory = useDeviceStore((state) => state.setDeviceHistory)

  const { isClusterVisible, modelType, updateBooleanState } =
    useFleetTrackingStore(
      useShallow((state) => ({
        isClusterVisible: state.isClusterVisible,
        modelType:
          state.modelType ||
          (typeof window !== 'undefined' &&
            (localStorage.getItem('fleet-tracking:modelType') as
              | '2d'
              | '3d')) ||
          '2d',
        updateBooleanState: state.updateBooleanState,
      }))
    )

  const map = fleetTrackingMap.getMap()

  useEffect(() => {
    const handleMouseEnter = (e: any) => {
      if (!map) return
      map.getCanvas().style.cursor = 'pointer'

      // Remove existing popup first to prevent duplicates
      if ((map as any)._routePointPopup) {
        ;(map as any)._routePointPopup.remove()
      }

      const coordinates = (e.features?.[0]?.geometry as any).coordinates.slice()
      const { title } = e.features?.[0]?.properties || {}

      const popup = new Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'route-point-popup',
        offset: 15,
        maxWidth: 'none',
      })
        .setLngLat(coordinates)
        .setHTML(
          `<div class="font-semibold text-brand-component-text-light text-base">${title}</div>`
        )
        .addTo(map)

      ;(map as any)._routePointPopup = popup
      ;(map as any)._routePointPopupActive = true
    }

    const handleMouseLeave = () => {
      if (!map) return
      map.getCanvas().style.cursor = ''
      ;(map as any)._routePointPopupActive = false

      // Delay removal slightly to ensure mouseleave is detected
      setTimeout(() => {
        if (
          (map as any)._routePointPopup &&
          !(map as any)._routePointPopupActive
        ) {
          ;(map as any)._routePointPopup.remove()
          ;(map as any)._routePointPopup = null
        }
      }, 50)
    }

    map?.on('mouseenter', 'route-points-inner', handleMouseEnter)
    map?.on('mouseleave', 'route-points-inner', handleMouseLeave)

    return () => {
      map?.off('mouseenter', 'route-points-inner', handleMouseEnter)
      map?.off('mouseleave', 'route-points-inner', handleMouseLeave)
    }
  }, [])

  const mapType = useGlobalStore((state) => state.mapType)
  const isMapInitialized = useGlobalStore((state) => state.isMapInitialized)

  const previousMapType = usePrevious(mapType)

  const is3DModel = modelType === '3d'

  useEffect(() => {
    if (!map) return
    const handleStyleChange = () => {
      const isHasRouteLayer = !!map._controls.find(
        (control: any) => control._props?.id === 'device-histories'
      )

      if (isHasRouteLayer) {
        startDrawHistory(deviceHistory)
      }
    }

    if (previousMapType !== mapType) {
      setTimeout(() => {
        handleStyleChange()
      }, 500)
    }
  }, [
    deviceSelected,
    isMapInitialized,
    mapType,
    previousMapType,
    deviceHistory,
  ])

  const getIconLayer = (coordinates: number[] = []) => {
    // For 3D models, use ScenegraphLayer
    if (is3DModel && deviceModels?.rak) {
      const layer = new ScenegraphLayer({
        id: 'device-history-3d',
        data: [
          {
            name: 'Device Location',
            coordinates,
            position: [...coordinates, 40], // [longitude, latitude, altitude]
          },
        ],
        scenegraph: deviceModels.rak,
        getPosition: (d: any) => d.position,
        getOrientation: () => [0, rotationRef.current, 90], // [pitch, yaw, roll] - animated rotation
        sizeScale: 200,
        pickable: false, // Don't intercept pointer events
        _lighting: 'pbr',
      })

      return layer
    }

    const layer = new IconLayer({
      id: 'device-history-2d',
      data: [
        {
          name: 'Device Location',
          coordinates,
        },
      ],
      getColor: () => [255, 140, 0],
      getIcon: () => ({
        url: '/images/3d-preview/rak.png',
        width: 70,
        height: 100,
      }),
      getPosition: (d: any) => d.coordinates,
      getSize: 100,
      pickable: false,
    })

    return layer
  }

  const startDrawHistory = async (checkpoints?: Checkpoint[]) => {
    const histories = checkpoints || deviceHistory
    if (!histories?.length) return
    setDeviceHistory(histories)
    const coordinates = histories.map((checkpoint) => [
      checkpoint.longitude,
      checkpoint.latitude,
    ])
    if (!map) return

    markerInstance.hideAllMarkers()
    if (multiTrackerLayerInstance.checkLayerAvailable() && is3DModel) {
      multiTrackerLayerInstance.syncLayers(devices, 'hidden')
    }

    // Hide cluster layer if exists
    if (map.getLayer('clusters')) {
      map.setLayoutProperty('clusters', 'visibility', 'none')
    }
    if (map.getLayer('cluster-count')) {
      map.setLayoutProperty('cluster-count', 'visibility', 'none')
    }
    if (map.getLayer('unclustered-point')) {
      map.setLayoutProperty('unclustered-point', 'visibility', 'none')
    }

    const controlIcon = (map?._controls as any).find(
      (control: any) => control._props?.id === 'device-histories'
    )

    if (controlIcon) {
      map?.removeControl(controlIcon)
    }

    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates,
      },
    }

    if (map?.getSource('route')) {
      ;(map?.getSource('route') as any)?.setData(geojson)
    } else {
      map?.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: geojson as any,
          lineMetrics: true,
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-width': 6,
          'line-gradient': [
            'interpolate',
            ['linear'],
            ['line-progress'],
            0,
            '#282B38',
            1,
            '#70799E',
          ],
        },
      })
    }

    // Add start and end point markers
    const startPoint = {
      type: 'Feature',
      properties: {
        type: 'start',
        title: 'Start',
      },
      geometry: {
        type: 'Point',
        coordinates: coordinates[coordinates.length - 1],
      },
    }

    const pointsGeojson = {
      type: 'FeatureCollection',
      features: [startPoint],
    }

    if (map?.getSource('route-points')) {
      ;(map?.getSource('route-points') as any)?.setData(pointsGeojson)
    } else {
      map?.addSource('route-points', {
        type: 'geojson',
        data: pointsGeojson as any,
      })

      map?.addLayer({
        id: 'route-points-inner',
        type: 'circle',
        source: 'route-points',
        paint: {
          'circle-radius': 7,
          'circle-color': [
            'match',
            ['get', 'type'],
            'start',
            '#70799E', // Start point color (matches line start)
            'end',
            '#282B38', // End point color (matches line end)
            '#1052FF', // Default
          ],
        },
      })
    }

    const icon = getIconLayer(coordinates[0])

    if (controlRef.current) {
      try {
        map?.removeControl(controlRef.current)
      } catch {
        // Control might already be removed
      }
    }

    const deckOverlay = new MapboxOverlay({
      layers: [icon],
      id: 'device-histories',
    })

    controlRef.current = deckOverlay

    map?.addControl(deckOverlay)

    if (is3DModel) {
      if (animationControlRef.current) {
        animationControlRef.current.stop()
      }

      animationControlRef.current = animate({
        from: 0,
        to: 360,
        duration: 2000,
        repeat: Infinity,
        ease: linear,
        onUpdate: (latest) => {
          rotationRef.current = latest

          // Update the overlay with new rotation
          const updatedIcon = getIconLayer(coordinates[0])
          deckOverlay.setProps({
            layers: [updatedIcon],
          })
        },
      })
    }

    // Calculate bounds to fit all checkpoints
    if (coordinates.length > 0) {
      const bounds = coordinates.reduce(
        (bounds, coord) => {
          return [
            [
              Math.min(bounds[0][0], coord[0]),
              Math.min(bounds[0][1], coord[1]),
            ],
            [
              Math.max(bounds[1][0], coord[0]),
              Math.max(bounds[1][1], coord[1]),
            ],
          ]
        },
        [
          [coordinates[0][0], coordinates[0][1]],
          [coordinates[0][0], coordinates[0][1]],
        ]
      )

      map?.fitBounds(bounds as LngLatBoundsLike, {
        padding: { top: 100, bottom: 100, left: 100, right: 100 },
        duration: 5000,
        pitch: 45,
        bearing: 0,
        maxZoom: 18,
      })
    }

    updateBooleanState('isAlreadyShowTripRoute', true)
  }

  const removeRoute = () => {
    if (!map) return

    if (animationControlRef.current) {
      animationControlRef.current.stop()
      animationControlRef.current = null
      rotationRef.current = 0
    }

    // Remove the route layer if it exists
    if (map?.getLayer('route')) {
      map.removeLayer('route')
    }
    if (map?.getSource('route')) {
      map.removeSource('route')
    }

    // Remove point layers
    if (map?.getLayer('route-points-inner')) {
      map.removeLayer('route-points-inner')
    }
    if (map?.getLayer('route-points-outer')) {
      map.removeLayer('route-points-outer')
    }
    if (map?.getSource('route-points')) {
      map.removeSource('route-points')
    }

    const controlIcon = (map?._controls as any).find(
      (control: any) => control._props?.id === 'device-histories'
    )
    if (controlIcon) {
      map?.removeControl(controlIcon)
    }

    // Restore markers and clusters after removing route
    // Show 2D markers based on model type
    if (!is3DModel) {
      markerInstance.displayAllMarkers()
    }
    // Show 3D models (DeckGL layers) based on model type
    if (is3DModel && multiTrackerLayerInstance.checkLayerAvailable()) {
      multiTrackerLayerInstance.syncLayers(devices, 'visible')
    }

    // Restore cluster visibility if it was enabled
    if (isClusterVisible) {
      if (map.getLayer('clusters')) {
        map.setLayoutProperty('clusters', 'visibility', 'visible')
      }
      if (map.getLayer('cluster-count')) {
        map.setLayoutProperty('cluster-count', 'visibility', 'visible')
      }
      if (map.getLayer('unclustered-point')) {
        map.setLayoutProperty('unclustered-point', 'visibility', 'visible')
      }
    }

    updateBooleanState('isAlreadyShowTripRoute', false)
    setDeviceHistory([])
  }

  useEffect(() => {
    return () => {
      if (animationControlRef.current) {
        animationControlRef.current.stop()
      }
    }
  }, [])

  return {
    startDrawHistory,
    removeRoute,
  }
}
