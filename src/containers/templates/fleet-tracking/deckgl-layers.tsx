'use client'
import { usePrevious } from '@/hooks/usePrevious'
import { Device, useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { Deck, ScenegraphLayer } from 'deck.gl'
import mapboxgl from 'mapbox-gl'
import { animate, easeOut, linear } from 'popmotion'
import { useCallback, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'

type LayerProps = {
  deviceData: Device
  opacity?: number
  rotation?: number
  hasPositionTransition?: boolean
}

function getMapViewState(map: mapboxgl.Map) {
  const center = map.getCenter()
  return {
    longitude: center.lng,
    latitude: center.lat,
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  }
}

const DeckglLayers = () => {
  const deckRef = useRef<Deck | null>(null)

  const markerRef = useRef<Record<string, mapboxgl.Marker | null> | null>(null)

  const deviceRotationRef = useRef<any>(null)

  const { map, modelType, isClusterVisible } = useFleetTrackingStore(
    useShallow((state) => ({
      map: state.map,
      modelType:
        state.modelType ||
        (localStorage.getItem('fleet-tracking:modelType') as '2d' | '3d') ||
        '2d',
      setModelType: state.setModelType,
      isClusterVisible: state.isClusterVisible,
    }))
  )

  const prevModelType = usePrevious(modelType)

  const { devices, deviceModels, setDeviceSelected, deviceSelected } =
    useDeviceStore(
      useShallow((state) => ({
        devices: state.devices,
        deviceIds: Object.keys(state.devices),
        deviceModels: state.models,
        deviceSelected: state.deviceSelected,
        setDeviceSelected: state.setDeviceSelected,
      }))
    )

  useEffect(() => {
    if (prevModelType !== modelType && map) {
      const zoom = map.getZoom()
      map?.easeTo({
        pitch: modelType === '2d' ? 0 : 90,
        zoom: zoom >= 18 ? zoom - 3 : zoom,
      })
    }
  }, [prevModelType, modelType, map])

  useEffect(() => {
    if (!map) return

    if (!isClusterVisible) {
      showDeviceLayerOnMap(modelType)
    } else {
      setDeviceSelected('')
      hideDeviceLayerOnMap(modelType)
    }
  }, [isClusterVisible, modelType, devices, prevModelType])

  useEffect(() => {
    if (map && map.getCanvasContainer() && !deckRef.current) {
      initializeDeck(map)
    }

    if (!markerRef.current) {
      initializeDeviceMarker()
    }
  }, [devices, map])

  useEffect(() => {
    if (!map) return

    const handleMove = () => {
      if (deckRef.current) {
        deckRef.current.setProps({
          viewState: getMapViewState(map),
        })
      }
    }

    const handleResize = () => {
      if (deckRef.current) {
        deckRef.current.setProps({
          width: map.getCanvas().clientWidth,
          height: map.getCanvas().clientHeight,
          viewState: getMapViewState(map),
        })
      }
    }

    map.on('move', handleMove)

    map.on('resize', handleResize)

    return () => {
      map.off('move', handleMove)
      map.off('resize', handleResize)
    }
  }, [map])

  useEffect(() => {
    if (!deviceSelected || modelType !== '3d') return

    const device = devices[deviceSelected]

    if (!device) return

    startDeviceRotation(device)

    return () => {
      stopDeviceRotation()
    }
  }, [deviceSelected, devices, modelType])

  const showDeviceLayerOnMap = (modelType: '2d' | '3d') => {
    if (modelType === '2d') {
      stopDeviceRotation()
      handleDevice3DModel('hidden')
      handleMarkerVisible()
    }

    if (modelType === '3d') {
      handleMarkerHidden()
      handleDevice3DModel('visible')
    }
  }

  const hideDeviceLayerOnMap = (modelType: '2d' | '3d') => {
    stopDeviceRotation()
    if (modelType === '2d') {
      handleMarkerHidden()
    }

    if (modelType === '3d') {
      handleDevice3DModel('hidden')
    }
  }

  const handleMarkerVisible = () => {
    if (!markerRef.current) return
    let timeoutId: any
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    Object.values(markerRef.current).forEach(async (marker) => {
      const el = marker?.getElement()

      if (el) {
        el.classList.remove('fade-out')
        el.classList.add('fade-in')
        timeoutId = setTimeout(() => {
          if (el) {
            el.style.display = 'block'
          }
        }, 300)
      }
    })
  }

  const handleMarkerHidden = () => {
    if (!markerRef.current) return
    let timeoutId: any

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    Object.values(markerRef.current).forEach(async (marker) => {
      const el = marker?.getElement()
      el?.classList.remove('fade-in')
      el?.classList.add('fade-out')
      timeoutId = setTimeout(() => {
        if (el) {
          el.style.display = 'none'
        }
      }, 300)
    })
  }

  const handleDevice3DModel = (type: 'visible' | 'hidden' = 'visible') => {
    const deviceIds = Object.keys(devices)
    if (!deviceIds.length) return

    const layers = deviceIds.map((deviceId) => {
      const device = devices[deviceId]

      const layer = getLayer({
        deviceData: device,
        opacity: type === 'visible' ? 1 : 0,
        hasPositionTransition: true,
      })

      return layer
    })

    deckRef.current?.setProps({
      layers,
    })
  }

  const stopDeviceRotation = () => {
    if (deviceRotationRef.current) {
      deviceRotationRef.current.stop()
      deviceRotationRef.current = null
    }
  }

  const initializeDeck = (map: mapboxgl.Map) => {
    if (!map) return
    const canvasContainer = map.getCanvasContainer()
    if (!canvasContainer || !Object.keys(devices).length) return

    const deck = new Deck({
      layers: [],
      viewState: {
        longitude: map.getCenter().lng,
        latitude: map.getCenter().lat,
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      },
      parent: canvasContainer as HTMLDivElement,
      controller: false, // Important: Let Mapbox handle interactions
      useDevicePixels: true,
    })

    deckRef.current = deck
  }

  const initializeDeviceMarker = useCallback(() => {
    const deviceIds = Object.keys(devices)

    if (!map || !deviceIds.length) return

    const deviceMarkers: Record<string, mapboxgl.Marker | null> = {}

    deviceIds.forEach((deviceId) => {
      const device = devices[deviceId]

      if (!device) return

      const marker = createDeviceMarker(device)

      if (marker && map) {
        marker.setLngLat([...(device.latestLocation || [0, 0])]).addTo(map)
      }

      deviceMarkers[deviceId] = marker
    })

    markerRef.current = deviceMarkers
  }, [devices, map])

  const createDeviceMarker = useCallback(
    (deviceData: Device) => {
      const el = document.createElement('div')

      el.className = `${deviceData.type}-marker`
      el.id = `${deviceData.type}-marker-${deviceData.id}`

      el.addEventListener('click', () => {
        setDeviceSelected(deviceData.id)
      })

      // Add style for opacity and transition
      el.style.display = 'none'
      // el.style.transition = 'opacity 0.5s ease-in-out'

      // Dynamic sizing based on zoom level to maintain consistent visual size
      const updateMarkerSize = () => {
        if (!map) return
        const zoom = map.getZoom()

        // Use original marker dimensions as base at zoom level 17
        const baseZoom = 17
        const baseWidth = 70
        const baseHeight = 100

        // Calculate scale factor (minimum 0.5x for visibility, maximum 1x)
        const scaleFactor = Math.min(1, Math.max(0.6, zoom / baseZoom))

        const scaledWidth = baseWidth * scaleFactor
        const scaledHeight = baseHeight * scaleFactor

        el.style.width = `${scaledWidth}px`
        el.style.height = `${scaledHeight}px`
      }

      // Initial sizing
      updateMarkerSize()

      // Update size when zoom changes
      const marker = new mapboxgl.Marker(el, {
        anchor: 'center', // Use center anchor for small circular markers
        pitchAlignment: 'viewport', // Keep marker aligned with viewport, not map plane
        rotationAlignment: 'viewport', // Keep marker rotation aligned with viewport
      })

      // Listen for zoom changes to update marker size
      if (map) {
        map.on('zoom', updateMarkerSize)
      }

      return marker
    },
    [map]
  )

  const getLayer = useCallback(
    (props: LayerProps) => {
      const { deviceData, opacity, rotation } = props
      const deviceId = deviceData.id
      const model = deviceModels[deviceData.type]

      const deviceOpacity = typeof opacity === 'number' ? opacity : 1

      const isPassedRotation = typeof rotation === 'number'

      const getOrientation = () => {
        if (isPassedRotation)
          return {
            ...(deviceData?.layerProps?.orientation || {}),
            [deviceData?.layerProps?.rotation || '']: rotation,
          }

        return deviceData?.layerProps?.orientation
      }

      const { pitch = 0, yaw = 0, roll = 0 } = getOrientation()

      return new ScenegraphLayer({
        id: deviceId,
        data: [
          {
            position: deviceData.latestLocation,
            orientation: [pitch, yaw, roll],
          },
        ],
        getPosition: (d) => [d.position[0], d.position[1], 20],
        getOrientation: (d) => [
          d.orientation[0],
          d.orientation[1],
          d.orientation[2],
        ],

        scenegraph: model,
        pickable: true,
        _lighting: 'pbr',
        opacity: deviceOpacity,
        onClick: () => {
          setDeviceSelected(deviceData.id)
        },
        transitions: {
          opacity: { duration: 500, easing: easeOut },
          getPosition: { duration: 500, easing: linear },
        },
        updateTriggers: {
          getPosition: [
            deviceData.latestLocation?.[0] ?? 0,
            deviceData.latestLocation?.[1] ?? 0,
            20,
          ],
          getOrientation: [pitch, yaw, roll],
        },
        ...(deviceData.layerProps || {}),
      })
    },
    [deviceModels, devices]
  )

  const startDeviceRotation = useCallback(
    (deviceData: Device) => {
      if (deviceRotationRef.current) {
        deviceRotationRef.current.stop()
        deviceRotationRef.current = null
      }

      const animation = animate({
        from:
          deviceData.layerProps?.orientation?.yaw === 360
            ? 0
            : deviceData.layerProps?.orientation?.yaw || 0,
        to: 360 - (deviceData.layerProps?.orientation?.yaw || 0) || 360,
        duration: 2000,
        repeat: Infinity,
        ease: linear,
        onUpdate: (rotation) => {
          const newLayers = Object.values(devices).map((device) => {
            if (device.id === deviceData.id) {
              return getLayer({
                deviceData: device,
                rotation,
              })
            }
            return getLayer({
              deviceData: device,
              opacity: 1,
            })
          }) as ScenegraphLayer[]

          if (deckRef.current) {
            deckRef.current.setProps({
              layers: newLayers,
            })
          }

          deviceRotationRef.current = animation
        },
      })
    },
    [devices]
  )

  return <></>
}

export default DeckglLayers
