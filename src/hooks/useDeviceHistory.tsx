import { DEVICE_FEATURE_SUPPORTED } from '@/constants/device-property'
import { useGlobalStore } from '@/stores'
import { useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingMapStore } from '@/stores/template/fleet-tracking-map'
import ClusterInstance from '@/templates/fleet-tracking/core/cluster-instance'
import { LocationDeckGLInstance } from '@/templates/fleet-tracking/core/location/deckgl-instance'
import { LocationMarker } from '@/templates/fleet-tracking/core/location/marker-instance'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'
import { WaterDepthDeckInstance } from '@/templates/fleet-tracking/core/water-depth/water-depth-deckgl-instance'
import { Checkpoint } from '@/types/trip'
import { groupDeviceByFeature } from '@/utils/map'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { IconLayer, ScenegraphLayer } from 'deck.gl'
import { IControl, LngLatBoundsLike, Popup } from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'

const markerInstance = LocationMarker.getInstance()
const deckGLInstance = LocationDeckGLInstance.getInstance()
const mapInstance = MapInstance.getInstance()
const waterDepthInstance = WaterDepthDeckInstance.getInstance()
const clusterInstance = ClusterInstance.getInstance()

export const useDeviceHistory = () => {
  const controlRef = useRef<any>(null)
  const rotationRef = useRef<number>(0)
  const animationControlRef = useRef<any>(null)
  const viewModeRef = useRef<'2d' | '3d'>('2d')
  const deviceHistory = useDeviceStore(
    useShallow((state) => state.deviceHistory)
  )

  const {
    locationDevices = [],
    waterLevelDevices = [],
    deviceSelected,
  } = useDeviceStore(
    useShallow((state) => {
      const deviceGroup = groupDeviceByFeature(
        Object.values(state.devicesFleetTracking)
      )

      return {
        initializedSuccess: state.initializedSuccess,
        devices: state.devicesFleetTracking,
        locationDevices: deviceGroup[DEVICE_FEATURE_SUPPORTED.LOCATION],
        waterLevelDevices: deviceGroup[DEVICE_FEATURE_SUPPORTED.WATER_DEPTH],
        deviceSelected: state.deviceSelected,
        setDeviceSelected: state.setDeviceSelected,
      }
    })
  )
  const deviceModels = useDeviceStore(useShallow((state) => state.models))
  const setDeviceHistory = useDeviceStore((state) => state.setDeviceHistory)

  const { updateBooleanState, viewMode, ungroupedDeviceIds } =
    useFleetTrackingMapStore(
      useShallow((state) => ({
        updateBooleanState: state.updateBooleanState,
        viewMode: state.viewMode,
        ungroupedDeviceIds: state.ungroupedDeviceIds,
      }))
    )

  const map = mapInstance.getMap()

  // Avoid stale-closure bugs when `removeRoute` is called later
  useEffect(() => {
    viewModeRef.current = viewMode
  }, [viewMode])

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
          `<div class="font-semibold text-black text-base">${title}</div>`
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

  const isMapInitialized = useGlobalStore((state) => state.isMapInitialized)

  const is3DModel = viewMode === '3d'

  useEffect(() => {
    if (!map) return
    const handleStyleChange = () => {
      const isHasRouteLayer = !!map._controls.find(
        (control: any) => control._props?.id === 'device-histories'
      )

      if (isHasRouteLayer) {
        startDrawHistory(deviceHistory)
      } else {
        removeRoute()
      }
    }

    handleStyleChange()
  }, [deviceSelected, isMapInitialized, deviceHistory, viewMode])

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
        // scenegraph: deviceModels.rak,
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
      // getIcon: () => ({
      //   url: '/images/3d-preview/rak.png',
      //   width: 70,
      //   height: 100,
      // }),
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

    if (is3DModel) {
      deckGLInstance.syncDevices(locationDevices, [])
    } else {
      markerInstance.hideAllMarkers()
      markerInstance.focusMarker('')
    }

    waterDepthInstance.syncDevice({
      devices: waterLevelDevices,
      allUngroupedDeviceIds: [],
    })
    // Hide cluster layer if exists
    clusterInstance.setClusterVisibility('none')

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

    if (map?.getLayer('route')) {
      map.removeLayer('route')
    }
    if (map?.getSource('route')) {
      map.removeSource('route')
    }

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

    map?.addControl(deckOverlay as unknown as IControl)

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
    const is3DModelLatest = viewModeRef.current === '3d'
    if (animationControlRef.current) {
      animationControlRef.current.stop()
      animationControlRef.current = null
      rotationRef.current = 0
    }

    // Restore cluster visibility
    clusterInstance.setClusterVisibility('visible')

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
    if (!is3DModelLatest) {
      markerInstance.displayAllMarkers()
      if (deviceSelected) {
        markerInstance.focusMarker(deviceSelected)
      }
    } else {
      deckGLInstance.syncDevices(locationDevices, ungroupedDeviceIds)
    }
    waterDepthInstance.syncDevice({
      devices: waterLevelDevices,
      allUngroupedDeviceIds: ungroupedDeviceIds,
    })

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
