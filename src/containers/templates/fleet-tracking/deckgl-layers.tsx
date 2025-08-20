'use client'
import { Device, useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { Deck, ScenegraphLayer } from 'deck.gl'
import mapboxgl from 'mapbox-gl'
import { animate, easeOut, linear } from 'popmotion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

type LayerProps = {
  deviceData: Device
  opacity?: number
  rotation?: number
  hasPositionTransition?: boolean
}

type UpdateLayerProps = {
  id: string
  rotation?: number
  position?: [number, number]
  hasPositionTransition?: boolean
  isDeviceSelected?: boolean
}

function getMapViewState(map: mapboxgl.Map) {
  return {
    longitude: map.getCenter().lng,
    latitude: map.getCenter().lat,
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  }
}

function animateMarkerMove(
  marker: mapboxgl.Marker,
  from: mapboxgl.LngLat,
  to: { lng: number; lat: number },
  duration = 800 // ms
) {
  const start = performance.now()

  function animate(time: number) {
    const elapsed = time - start
    const t = Math.min(elapsed / duration, 1)

    const lng = from.lng + (to.lng - from.lng) * t
    const lat = from.lat + (to.lat - from.lat) * t

    marker.setLngLat([lng, lat])

    if (t < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

const DeckglLayers = () => {
  const deckRef = useRef<Deck | null>(null)
  const layerRef = useRef<ScenegraphLayer[]>([])
  const [isStartRender, setIsStartRender] = useState(false)

  const markerRef = useRef<Record<string, mapboxgl.Marker | null>>({})
  const latestLocationRef = useRef<Record<string, [number, number]>>({})

  const [isMinZoom, setIsMinZoom] = useState(false)

  const stopAnimation = useRef<() => void>(() => {})

  const isFirstLoad = useRef(true)

  const { map, modelType, setModelType } = useFleetTrackingStore(
    useShallow((state) => ({
      map: state.map,
      modelType:
        state.modelType ||
        (localStorage.getItem('fleet-tracking:modelType') as '2d' | '3d') ||
        '2d',
      setModelType: state.setModelType,
    }))
  )

  const {
    devices,
    deviceModels,
    deviceIds,
    setDeviceSelected,
    deviceSelected,
  } = useDeviceStore(
    useShallow((state) => ({
      devices: state.devices,
      deviceIds: Object.keys(state.devices),
      deviceModels: state.models,
      deviceSelected: state.deviceSelected,
      setDeviceSelected: state.setDeviceSelected,
    }))
  )

  useEffect(() => {
    Object.keys(devices).forEach((deviceId) => {
      latestLocationRef.current[deviceId] = devices[deviceId]
        .latestLocation || [0, 0]
    })
  }, [devices])

  useEffect(() => {
    const handle = (e: CustomEvent) => {
      const map = e.detail.map
      initializeDeck(map)
    }

    window.addEventListener('mapLoaded', handle as EventListener)

    return () => {
      window.removeEventListener('mapLoaded', handle as EventListener)
    }
  }, [])

  useEffect(() => {
    if (!map) return

    map.on('move', () => {
      if (deckRef.current) {
        deckRef.current.setProps({
          viewState: getMapViewState(map),
        })
      }
    })

    map.on('resize', () => {
      if (deckRef.current) {
        deckRef.current.setProps({
          width: map.getCanvas().clientWidth,
          height: map.getCanvas().clientHeight,
        })
      }
    })

    map.on('zoomend', () => {
      const features = map?.queryRenderedFeatures({
        layers: ['clusters'],
      })

      if (isFirstLoad.current && !features.length) {
        setIsStartRender(true)
        isFirstLoad.current = false
      }
    })

    return () => {
      if (deckRef.current) {
        deckRef.current.finalize()
        deckRef.current = null
      }

      removeAllMarkers()
      stopAllAnimations()
      setDeviceSelected('')
    }
  }, [map])

  useEffect(() => {
    const handler = (e: Event) => {
      const { isMinZoom } = (e as CustomEvent).detail
      setIsMinZoom(isMinZoom)
    }

    window.addEventListener('mapZoomEnd', handler)

    return () => {
      window.removeEventListener('mapZoomEnd', handler)
    }
  }, [])

  useEffect(() => {
    if (isMinZoom) {
      setDeviceSelected('')
      stopAllAnimations()
      removeAllMarkers()
      handleRender3DLayer(false, 0)
    } else {
      updateMapResources(
        modelType ||
          (localStorage.getItem('fleet-tracking:modelType') as '2d' | '3d')
      )
    }
  }, [isMinZoom, modelType])

  useEffect(() => {
    const handler = (e: Event) => {
      const { modelType } = (e as CustomEvent).detail

      updateMapResources(modelType)
    }

    window.addEventListener('modelTypeUpdated', handler)

    return () => {
      window.removeEventListener('modelTypeUpdated', handler)
    }
  }, [map, devices, deviceModels])

  useEffect(() => {
    if (!isStartRender || !map) return

    const mapType =
      (localStorage.getItem('fleet-tracking:modelType') as '2d' | '3d') || '2d'

    if (mapType === '2d') {
      render2DLayers(false)
    }
    handleRender3DLayer(false, mapType === '3d' ? 1 : 0)
  }, [isStartRender, map])

  const updateLayer = (props: UpdateLayerProps) => {
    const { id, rotation, position, hasPositionTransition, isDeviceSelected } =
      props

    if (!deckRef.current) return [] as ScenegraphLayer[]

    const currentLayers = deckRef.current?.props.layers || []

    const newLayers = currentLayers.map((layer: any) => {
      if (layer.id !== id) return layer
      const device = devices[id]

      if (
        isDeviceSelected &&
        JSON.stringify(layer.props.data[0].position) !==
          JSON.stringify(position)
      ) {
        map?.easeTo({
          center: position || device.latestLocation,
          zoom: 19,
          duration: 1000,
        })
      }

      return getLayer({
        deviceData: {
          ...device,
          latestLocation: position || device.latestLocation,
        },
        opacity: layer.props?.opacity,
        rotation,
        hasPositionTransition,
      })
    })

    return newLayers
  }

  useEffect(() => {
    if (!isStartRender || isFirstLoad.current) return
    const layers = deckRef.current?.props.layers || []

    if (modelType === '2d' && Object.keys(markerRef.current).length) {
      Object.values(devices).forEach((device) => {
        const latestLocation = device.latestLocation
        const marker = markerRef.current[device.id]

        const prevLocation = marker?.getLngLat()

        const isLocationChanged =
          JSON.stringify(prevLocation) !== JSON.stringify(latestLocation)

        if (isLocationChanged && latestLocation && marker) {
          // marker?.setLngLat([latestLocation[0], latestLocation[1]])
          animateMarkerMove(
            marker,
            {
              lat: prevLocation?.lat || 0,
              lng: prevLocation?.lng || 0,
            } as mapboxgl.LngLat,
            {
              lat: latestLocation[1],
              lng: latestLocation[0],
            }
          )
        }
      })
    }

    if (modelType === '3d' && deckRef.current) {
      layers.forEach((layer: any) => {
        if (
          JSON.stringify(layer.props.data[0].position) !==
            JSON.stringify(devices[layer.id].latestLocation) &&
          layer.id !== deviceSelected
        ) {
          const newLayers = updateLayer({
            id: layer.id,
            hasPositionTransition: true,
            isDeviceSelected: layer.id === deviceSelected,
          })

          deckRef.current?.setProps({
            layers: newLayers,
          })

          layerRef.current = newLayers || []
        }
      })
    }
  }, [devices, isStartRender, deviceSelected, modelType])

  const initializeDeck = useCallback((map: mapboxgl.Map) => {
    const deck = new Deck({
      layers: [],
      viewState: {
        longitude: map.getCenter().lng,
        latitude: map.getCenter().lat,
        zoom: map.getZoom(),
        bearing: map.getBearing(),
        pitch: map.getPitch(),
      },

      onClick(info) {
        if (info?.object) {
          const layer = info.layer
          if (layer?.id && layer?.id !== deviceSelected) {
            setDeviceSelected(layer?.id)
          }
        }
      },

      parent: map.getCanvasContainer() as HTMLDivElement,
      controller: false, // Important: Let Mapbox handle interactions
      useDevicePixels: true,
    })

    deckRef.current = deck
  }, [])

  useEffect(() => {
    if (deviceSelected) {
      startAnimation(deviceSelected)
    } else {
      stopAllAnimations()
    }
  }, [deviceSelected, modelType])

  const updateMapResources = (modelType: '2d' | '3d') => {
    if (!map) return
    setIsStartRender(true)

    switch (modelType) {
      case '2d':
        stopAllAnimations()
        handleRender3DLayer(false, 0)
        render2DLayers(true)
        setDeviceSelected('')
        return

      case '3d':
        removeAllMarkers()
        handleRender3DLayer(true, 1)
        return
    }
  }

  const stopAllAnimations = useCallback(() => {
    if (stopAnimation.current) {
      stopAnimation.current()
      stopAnimation.current = () => {}
    }
  }, [devices, map, deviceModels])

  const render2DLayers = useCallback(
    (hasFling: boolean = false) => {
      if (!map || !deviceIds.length) return

      if (hasFling) {
        map.easeTo({
          pitch: 0,
        })
      }

      deviceIds.forEach((deviceId) => {
        const device = devices[deviceId]

        if (!markerRef.current?.[deviceId]) {
          markerRef.current[deviceId] = getMarker(device)
        }

        if (markerRef.current[deviceId] && markerRef.current) {
          markerRef.current[deviceId]
            ?.setLngLat([...(device.latestLocation || [0, 0])])
            ?.addTo(map)
        }
      })
    },
    [map, devices, deviceModels]
  )

  const handleRender3DLayer = useCallback(
    (hasFling: boolean = false, opacity?: number) => {
      if (!map) return
      const deviceIds = Object.keys(devices)

      if (hasFling) {
        map.easeTo({
          pitch: 90,
        })
      }

      if (!deviceIds.length) return

      const layers = deviceIds.map((deviceId) => {
        const device = devices[deviceId]

        const layer = getLayer({
          deviceData: device,
          opacity,
          hasPositionTransition: true,
        })
        return layer
      })

      deckRef.current?.setProps({
        layers,
      })
    },
    [map, devices, deviceModels]
  )

  const getMarker = useCallback(
    (deviceData: Device) => {
      const el = document.createElement('div')

      el.className = `${deviceData.type}-marker`
      el.id = `${deviceData.type}-marker-${deviceData.id}`

      el.addEventListener('click', () => {
        setDeviceSelected(deviceData.id)
        setModelType('3d')
      })

      // Add style for opacity and transition
      el.style.opacity = '0'
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

  const removeAllMarkers = () => {
    Object.values(markerRef.current).forEach((marker) => {
      const el = marker?.getElement()

      el?.classList.add('fade-out')

      setTimeout(() => {
        el?.remove()
      }, 600)
    })

    markerRef.current = {}
  }

  const getLayer = useCallback(
    (props: LayerProps) => {
      const { deviceData, opacity, rotation, hasPositionTransition } = props
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
        transitions: {
          opacity: { duration: 500, easing: easeOut },
          ...(hasPositionTransition && {
            getPosition: { duration: 1000, easing: easeOut },
          }),
        },
        ...(deviceData.layerProps || {}),
      })
    },
    [deviceModels]
  )

  const startAnimation = useCallback(
    (deviceId: string) => {
      if (stopAnimation.current) {
        stopAnimation.current()
        stopAnimation.current = () => {}

        if (modelType === '3d') {
          handleRender3DLayer(false, 1)
        }
      }

      const device = devices[deviceId]
      if (!device) return

      const animation = animate({
        from:
          device.layerProps?.orientation?.yaw === 360
            ? 0
            : device.layerProps?.orientation?.yaw || 0,
        to: 360 - (device.layerProps?.orientation?.yaw || 0) || 360,
        duration: 2000,
        repeat: Infinity,
        ease: linear,
        onUpdate: (rotation) => {
          const newLayers = updateLayer({
            id: deviceId,
            rotation,
            position: latestLocationRef.current[deviceId],
            hasPositionTransition: false,
            isDeviceSelected: true,
          })

          deckRef.current?.setProps({
            layers: newLayers,
          })

          layerRef.current = newLayers || []
        },
      })

      stopAnimation.current = animation.stop
    },
    [devices, map, modelType]
  )

  return <></>
}

export default DeckglLayers
