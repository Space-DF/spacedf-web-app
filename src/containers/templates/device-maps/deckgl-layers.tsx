'use client'
import { Device, useDeviceStore } from '@/stores/device-store'
import { useDeviceMapsStore } from '@/stores/template/device-maps'
import { delay } from '@/utils'
import { Deck, ScenegraphLayer } from 'deck.gl'
import mapboxgl from 'mapbox-gl'
import { animate, easeOut, linear } from 'popmotion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

function getMapViewState(map: mapboxgl.Map) {
  return {
    longitude: map.getCenter().lng,
    latitude: map.getCenter().lat,
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  }
}

const DeckglLayers = () => {
  const deckRef = useRef<Deck | null>(null)
  const [isStartRender, setIsStartRender] = useState(false)

  const markerRef = useRef<Record<string, mapboxgl.Marker | null>>({})

  const [isMinZoom, setIsMinZoom] = useState(false)

  const animationRef = useRef<
    Record<
      string,
      {
        stop: () => void
      }
    >
  >({})

  const isFirstLoad = useRef(true)

  const { map, modelType } = useDeviceMapsStore(
    useShallow((state) => ({
      map: state.map,
      modelType:
        state.modelType ||
        (localStorage.getItem('modelType') as '2d' | '3d') ||
        '2d',
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
        deckRef.current.redraw()
      }
    })

    map.on('zoomend', () => {
      if (isFirstLoad.current) {
        isFirstLoad.current = false
        setIsStartRender(true)
      }
    })

    return () => {
      if (deckRef.current) {
        deckRef.current.finalize()
        deckRef.current = null
      }
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
        modelType || (localStorage.getItem('modelType') as '2d' | '3d')
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
    if (!isStartRender) return

    const mapType = (localStorage.getItem('modelType') as '2d' | '3d') || '2d'

    if (mapType === '2d') {
      render2DLayers(false)
    }
    handleRender3DLayer(false, mapType === '3d' ? 1 : 0)
  }, [isStartRender])

  useEffect(() => {
    if (deviceSelected) {
      handleDeviceSelected(
        deviceSelected,
        modelType || (localStorage.getItem('modelType') as '2d' | '3d')
      )
    }
  }, [deviceSelected, modelType])

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

  const stopAnimation = useCallback((deviceId: string) => {
    if (animationRef.current[deviceId]) {
      animationRef.current[deviceId].stop()
      delete animationRef.current[deviceId]
    }
  }, [])

  const stopAllAnimations = useCallback(() => {
    Object.keys(animationRef.current).forEach((deviceId) => {
      stopAnimation(deviceId)
    })

    animationRef.current = {}
  }, [stopAnimation])

  const updateMapResources = (modelType: '2d' | '3d') => {
    if (!map) return

    setDeviceSelected('')

    switch (modelType) {
      case '2d':
        stopAllAnimations()
        handleRender3DLayer(false, 0)
        render2DLayers(true)
        return

      case '3d':
        removeAllMarkers()
        handleRender3DLayer(true, 1)
        return
    }
  }

  const render2DLayers = useCallback(
    (hasFling: boolean = false) => {
      if (!map) return

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

        markerRef.current[deviceId]
          ?.setLngLat([...(device.latestLocation || [0, 0])])
          .addTo(map)
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

        const layer = getLayer(device, opacity)
        return layer
      })

      deckRef.current?.setProps({
        layers,
      })

      deckRef.current?.redraw()
    },
    [map, devices, deviceModels]
  )

  const getMarker = useCallback((deviceData: Device) => {
    const el = document.createElement('div')

    el.className = `${deviceData.type}-marker`
    el.id = `${deviceData.type}-marker-${deviceData.id}`

    el.addEventListener('click', () => {
      setDeviceSelected(deviceData.id)
    })

    // Add style for opacity and transition
    el.style.opacity = '0'
    // el.style.transition = 'opacity 0.5s ease-in-out'

    return new mapboxgl.Marker(el, {
      offset: [0, -90],
    })
  }, [])

  const removeAllMarkers = () => {
    Object.values(markerRef.current).forEach((marker) => {
      marker?.remove()
    })

    markerRef.current = {}
  }

  const getLayer = useCallback(
    (deviceData: Device, opacity: number = 1, rotation?: number) => {
      const deviceId = deviceData.id
      const model = deviceModels[deviceData.type]

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
        data: [{ position: deviceData.latestLocation }],
        scenegraph: model,
        getPosition: (d) => [d.position[0], d.position[1], 20],
        pickable: true,
        _lighting: 'pbr',
        opacity: opacity,
        transitions: {
          opacity: {
            duration: 500,
            easing: easeOut,
          },
          getOrientation: {
            duration: 1000,
            easing: easeOut,
          },
        },
        ...(deviceData.layerProps || {}),
        getOrientation: () => [pitch, yaw, roll],
      })
    },
    [deviceModels]
  )

  const handleDeviceSelected = useCallback(
    async (deviceId: string, modelType: '2d' | '3d') => {
      const device = devices[deviceId]
      if (!device) return

      if (modelType === '2d') {
        map?.flyTo({
          center: device.latestLocation,
          zoom: 20,
        })
      }

      if (modelType === '3d') {
        map?.flyTo({
          center: device.latestLocation,
          zoom: 19,
          pitch: 90,
        })
        await delay(500)
        startAnimation(deviceId)
      }
    },
    [devices, map]
  )

  const startAnimation = useCallback(
    (deviceId: string) => {
      const device = devices[deviceId]
      if (!device) return

      const animation = animate({
        from: 0,
        to: 360,
        duration: 5000,
        repeat: Infinity,
        ease: linear,
        onUpdate: (rotation) => {
          const newLayer = getLayer(device, 1, rotation)

          const newLayers = deckRef.current?.props.layers.map((layer: any) => {
            if (layer.id === deviceId) {
              return newLayer
            }

            return getLayer(devices[layer.id], 1)
          })

          deckRef.current?.setProps({
            layers: newLayers,
          })

          deckRef.current?.redraw()
        },
      })

      animationRef.current[deviceId] = {
        stop: animation.stop,
      }
    },
    [devices]
  )

  return <></>
}

export default DeckglLayers
