'use client'
import { usePrevious } from '@/hooks/usePrevious'
import { Device, useDeviceStore } from '@/stores/device-store'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { SupportedModels } from '@/utils/model-objects/devices/gps-tracker/type'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ScenegraphLayer } from 'deck.gl'
import mapboxgl from 'mapbox-gl'
import { animate, easeOut, linear } from 'popmotion'
import { useCallback, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'

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

    try {
      if (marker && marker.getElement()) {
        marker.setLngLat([lng, lat])
      } else {
        return
      }
    } catch {
      return
    }

    if (t < 1) {
      requestAnimationFrame(animate)
    }
  }

  requestAnimationFrame(animate)
}

const DeckglLayers = () => {
  const deckRef = useRef<MapboxOverlay | null>(null)

  const markerRef = useRef<Record<string, mapboxgl.Marker | null> | null>(null)

  const deviceRotationRef = useRef<any>(null)
  const markerHandlersRef = useRef<Record<string, () => void>>({})

  const { map, modelType, isClusterVisible, isMapReady } =
    useFleetTrackingStore(
      useShallow((state) => ({
        map: state.map,
        isMapReady: state.isMapReady,
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
      handleZoom()
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
  }, [isClusterVisible, modelType, prevModelType, devices])

  useEffect(() => {
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

      if (!markerRef.current) return

      Object.values(markerRef.current).forEach((marker) => {
        if (!marker) return
        const el = marker.getElement()
        if (el) {
          el.style.width = `${scaledWidth}px`
          el.style.height = `${scaledHeight}px`
        }
      })
    }

    // Initial sizing
    map?.on('zoom', updateMarkerSize)

    return () => {
      map?.off('zoom', updateMarkerSize)
    }
  }, [map])

  useEffect(() => {
    if (map && map.getCanvasContainer() && !deckRef.current) {
      initializeDeck(map)
    }

    if (!markerRef.current && isMapReady && map) {
      initializeDeviceMarker()
    }

    return () => {
      markerRef.current = null
    }
  }, [map, isMapReady])

  useEffect(() => {
    return () => {
      stopDeviceRotation()

      Object.values(markerHandlersRef.current).forEach((handler) => handler())
      markerHandlersRef.current = {}

      map?.removeControl(deckRef.current as any)
      deckRef.current = null
      deviceRotationRef.current = null
    }
  }, [map])

  useEffect(() => {
    if (!deviceSelected || modelType !== '3d' || !map) return

    const device = devices[deviceSelected]

    if (!device) return

    startDeviceRotation(device)

    map?.flyTo({
      center: device.latestLocation,
      zoom: 19,
      duration: 1000,
      essential: true,
    })

    return () => {
      stopDeviceRotation()
    }
  }, [deviceSelected, devices, modelType])

  const handleZoom = () => {
    if (!map) return
    const zoom = map.getZoom()

    const pitch = modelType === '2d' ? 0 : 90
    map?.easeTo({
      pitch,

      zoom: zoom >= 18 ? zoom - 3 : zoom,
      essential: true,
    })
  }

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

    Object.values(markerRef.current).forEach((marker) => {
      if (!marker) return
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

      //handle marker move
      const currentPos = marker.getLngLat()
      if (!currentPos) return
      const deviceId = marker.getElement()?.id.split('marker-')[1]
      const currentDeviceLocation = devices[deviceId ?? '']?.latestLocation

      if (
        currentPos.lng !== currentDeviceLocation?.[0] ||
        currentPos.lat !== currentDeviceLocation?.[1]
      ) {
        const newLngLat = {
          lng: currentDeviceLocation?.[0] || 0,
          lat: currentDeviceLocation?.[1] || 0,
        }

        animateMarkerMove(marker, currentPos, newLngLat)

        if (deviceSelected === deviceId) {
          map?.flyTo({
            center: newLngLat,
            zoom: 19,
            duration: 1000,
            essential: true,
          })
        }
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

    const layers = createDevicesLayers(devices, type)

    if (!layers.length) return

    deckRef.current?.setProps({
      layers: layers,
    })
  }

  const createDevicesLayers = (
    devices: Record<string, Device>,
    type: 'visible' | 'hidden' = 'visible'
  ) => {
    const visibleDevices = Object.values(devices).filter(
      (d) => Array.isArray(d.latestLocation) && d.latestLocation.length === 2
    )

    if (!visibleDevices.length) return []

    const layers: ScenegraphLayer[] = []

    // group by model type
    const grouped = visibleDevices.reduce(
      (acc, d) => {
        acc[d.type] = acc[d.type] || []
        acc[d.type].push(d)
        return acc
      },
      {} as Record<string, Device[]>
    )

    Object.entries(grouped).forEach(([typeKey, group]) => {
      const layer = new ScenegraphLayer({
        id: `device-layer-${typeKey}`,
        data: group.map((d) => ({
          id: d.id,
          position: d.latestLocation,
          orientation: [
            d.layerProps?.orientation?.pitch || 0,
            d.layerProps?.orientation?.yaw || 0,
            d.layerProps?.orientation?.roll || 0,
          ],
          selected: d.id === deviceSelected,
        })),
        scenegraph: deviceModels[typeKey as SupportedModels],
        getPosition: (d) => [d.position[0], d.position[1], 20],
        getOrientation: (d) => d.orientation,
        sizeScale: group[0].layerProps?.sizeScale || 200,
        pickable: true,
        opacity: type === 'visible' ? 1 : 0,
        onClick: ({ object }) => {
          if (object) setDeviceSelected(object.id)
        },
        transitions: {
          getPosition: {
            duration: 0,
            easing: linear,
          },
          opacity: {
            duration: 300,
            easing: linear,
          },
          getOrientation: { duration: 800, easing: easeOut },
        },
        updateTriggers: {
          getPosition: group.map((d) => [
            d.latestLocation?.[0],
            d.latestLocation?.[1],
          ]),
          getOrientation: group.map((d) => [
            d.layerProps?.orientation?.pitch,
            d.layerProps?.orientation?.yaw,
            d.layerProps?.orientation?.roll,
          ]),
        },
        _lighting: 'pbr',
      })

      layers.push(layer)
    })

    return layers
  }

  const stopDeviceRotation = () => {
    if (deviceRotationRef.current) {
      deviceRotationRef.current.stop()
      deviceRotationRef.current = null
    }
  }

  const initializeDeck = (map: mapboxgl.Map) => {
    if (!map) return

    deckRef.current = new MapboxOverlay({
      interleaved: true,
      layers: [],
    })

    map.addControl(deckRef.current)
  }

  const initializeDeviceMarker = useCallback(() => {
    const deviceIds = Object.keys(devices)

    if (!map || !deviceIds.length) return

    const deviceMarkers: Record<string, mapboxgl.Marker | null> = {}

    deviceIds.forEach((deviceId) => {
      const device = devices[deviceId]

      if (!device) return

      const marker = createDeviceMarker(device)

      if (marker && map && map.loaded()) {
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
      el.id = `marker-${deviceData.id}`

      const handleClick = () => {
        setDeviceSelected(deviceData.id)
      }

      el.addEventListener('click', handleClick)

      markerHandlersRef.current[deviceData.id] = () => {
        el.removeEventListener('click', handleClick)
      }

      // Add style for opacity and transition
      el.style.display = 'none'
      // el.style.transition = 'opacity 0.5s ease-in-out'

      // Dynamic sizing based on zoom level to maintain consistent visual size

      // Update size when zoom changes
      const marker = new mapboxgl.Marker(el, {
        anchor: 'center', // Use center anchor for small circular markers
        pitchAlignment: 'viewport', // Keep marker aligned with viewport, not map plane
        rotationAlignment: 'viewport', // Keep marker rotation aligned with viewport
      })

      // Override remove method to cleanup

      return marker
    },
    [map]
  )

  const startDeviceRotation = useCallback(
    (deviceData: Device) => {
      if (deviceRotationRef.current) {
        deviceRotationRef.current.stop()
        deviceRotationRef.current = null
      }

      deviceRotationRef.current = animate({
        from:
          deviceData.layerProps?.orientation?.yaw === 360
            ? 0
            : deviceData.layerProps?.orientation?.yaw || 0,
        to: 360 - (deviceData.layerProps?.orientation?.yaw || 0) || 360,
        duration: 2000,
        repeat: Infinity,
        ease: linear,
        onUpdate: (rotation) => {
          const newDevicesData = Object.entries(devices).map(
            ([key, device]) => {
              if (device.id === deviceData.id) {
                return [
                  key,
                  {
                    ...device,
                    layerProps: {
                      ...device.layerProps,
                      orientation: {
                        ...device.layerProps?.orientation,
                        yaw: rotation,
                      },
                    },
                  },
                ]
              }

              return [key, device]
            }
          )

          const newDevices = Object.fromEntries(newDevicesData)

          const newLayers = createDevicesLayers(newDevices, 'visible')

          if (newLayers.length) {
            deckRef.current?.setProps({
              layers: newLayers,
            })
          }
        },
      })
    },
    [devices]
  )

  return <></>
}

export default DeckglLayers
