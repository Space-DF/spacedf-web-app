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

//? function to animate the marker move
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

    //? calculate the new longitude and latitude
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

  const prevModelType = usePrevious(modelType)

  const prevDeviceSelected = usePrevious(deviceSelected)
  const prevDevices: Record<string, Device> = usePrevious(devices) || {}

  //? use effect to show/hide the device layer when the cluster is visible/hidden
  useEffect(() => {
    if (!map) return

    if (!isClusterVisible) {
      showDeviceLayerOnMap(modelType)
    } else {
      setDeviceSelected('')
      hideDeviceLayerOnMap(modelType)
    }
  }, [isClusterVisible, modelType, prevModelType, devices])

  //? use effect to handle devices count changed so we need to add/remove the markers
  useEffect(() => {
    if (!devices) return
    const currentDeviceCount = Object.keys(devices).length
    const prevDeviceCount = Object.keys(prevDevices).length

    if (!markerRef.current || !map) return
    if (currentDeviceCount === prevDeviceCount || !markerRef.current) return

    const handleDeviceSelected = (deviceId: string) => {
      setDeviceSelected(deviceId)
    }

    const deviceCountIncrease = currentDeviceCount - prevDeviceCount > 0

    if (deviceCountIncrease) {
      const firstMarker = Object.values(
        markerRef.current!
      )[0] as mapboxgl.Marker

      const newDeviceIds = Object.keys(devices).filter(
        (deviceId) => !Object.keys(prevDevices).includes(deviceId)
      )

      newDeviceIds.forEach((deviceId) => {
        const deviceData = devices[deviceId]

        if (!deviceData) return

        const newEl = firstMarker.getElement().cloneNode(true) as HTMLElement
        newEl.id = `marker-${deviceId}`
        newEl.className = `${deviceData.type}-marker`

        const newMarkerOptions: mapboxgl.MarkerOptions = {
          element: newEl,
          anchor: 'center',
          pitchAlignment: 'viewport',
          rotationAlignment: 'viewport',
        }

        newEl.addEventListener('click', () => {
          handleDeviceSelected(deviceId)
        })

        const newMarker = new mapboxgl.Marker(newEl, newMarkerOptions)
        newMarker.setLngLat(deviceData.latestLocation!)
        newMarker.addTo(map)
        markerRef.current![deviceId] = newMarker
      })
    } else {
      const removedDeviceIds = Object.keys(prevDevices).filter(
        (deviceId) => !Object.keys(devices).includes(deviceId)
      )

      removedDeviceIds.forEach((deviceId) => {
        const marker = markerRef.current![deviceId]
        if (!marker) return
        marker.remove()

        delete markerRef.current![deviceId]
      })
    }

    return () => {
      Object.keys(markerHandlersRef.current).forEach((deviceId) => {
        const handler = markerHandlersRef.current![deviceId]
        if (!handler) return
        handler()
      })

      markerHandlersRef.current = {}
    }
  }, [devices, prevDevices, map])

  //? use effect to update the marker size when the zoom changes
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

    //? initial sizing
    map?.on('zoom', updateMarkerSize)

    return () => {
      map?.off('zoom', updateMarkerSize)
    }
  }, [map])

  //? use effect to update the pitch when the model type changes
  useEffect(() => {
    if (!map) return

    const handleModelTypeUpdated = (event: any) => {
      const { modelType } = event.detail
      const newPitch = modelType === '2d' ? 0 : 90

      map?.easeTo({
        pitch: newPitch,
        duration: 500,
        essential: true,
      })
    }

    window.addEventListener('modelTypeUpdated', handleModelTypeUpdated)

    return () => {
      window.removeEventListener('modelTypeUpdated', handleModelTypeUpdated)
    }
  }, [map])

  //? use effect to initialize the deck and device markers
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

  //? use effect to start device rotation when the model type is 3d
  useEffect(() => {
    if (!deviceSelected || modelType !== '3d' || !map) return

    const device = devices[deviceSelected]

    if (!device) return

    startDeviceRotation(device)
    return () => {
      stopDeviceRotation()
    }
  }, [deviceSelected, devices, modelType])

  //? use effect to zoom to the selected device when it changes
  useEffect(() => {
    if (!map || !deviceSelected || deviceSelected === prevDeviceSelected) return
    const device = devices[deviceSelected]
    if (!device) return
    let timeoutId: any = null

    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      map?.easeTo({
        center: device.latestLocation,
        zoom: 18,
        duration: 500,
        essential: true,
        pitch: modelType === '3d' ? 90 : 0,
      })
    }, 200)
  }, [map, deviceSelected, devices, prevDeviceSelected, modelType])

  useEffect(() => {
    if (!map) return
    if (deviceSelected !== prevDeviceSelected && modelType === '3d') {
      const resetLayers = createDevicesLayers(
        devices,
        isClusterVisible ? 'hidden' : 'visible'
      )
      deckRef.current?.setProps({
        layers: resetLayers,
      })
    }
  }, [devices, deviceSelected, prevDevices, modelType, isClusterVisible])

  //? function to show the device layer on the map
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

  //? function to hide the device layer on the map
  const hideDeviceLayerOnMap = (modelType: '2d' | '3d') => {
    stopDeviceRotation()
    if (modelType === '2d') {
      handleMarkerHidden()
    }

    if (modelType === '3d') {
      handleDevice3DModel('hidden')
    }
  }

  //? function to handle the marker visible
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

      //? if the marker is not at the same position as the device, animate the marker to the device
      if (
        currentPos.lng !== currentDeviceLocation?.[0] ||
        currentPos.lat !== currentDeviceLocation?.[1]
      ) {
        const newLngLat = {
          lng: currentDeviceLocation?.[0] || 0,
          lat: currentDeviceLocation?.[1] || 0,
        }

        animateMarkerMove(marker, currentPos, newLngLat)

        //? if the device is selected and the marker is not at the same position as the device, zoom to the device
        if (deviceSelected === deviceId) {
          map?.easeTo({
            center: newLngLat,
            zoom: 19,
            duration: 1000,
            essential: true,
          })
        }
      }
    })
  }

  //? function to handle the marker hidden
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

  //? function to handle the device 3d model
  const handleDevice3DModel = (type: 'visible' | 'hidden' = 'visible') => {
    const deviceIds = Object.keys(devices)
    if (!deviceIds.length) return

    const layers = createDevicesLayers(devices, type)

    if (!layers.length) return

    deckRef.current?.setProps({
      layers: layers,
    })
  }

  //? function to create the devices layers
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
          setDeviceSelected(object.id)
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

        //? update triggers for the devices layers
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

  const initializeDeviceMarker = () => {
    const deviceIds = Object.keys(devices)

    if (!map || !deviceIds.length) return

    const deviceMarkers: Record<string, mapboxgl.Marker | null> = {}

    //? loop through the devices and create the markers
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
  }

  const createDeviceMarker = useCallback(
    (deviceData: Device) => {
      const el = document.createElement('div')

      el.className = `${deviceData.type}-marker`
      el.id = `marker-${deviceData.id}`

      const handleClick = () => {
        setDeviceSelected(deviceData.id)
      }

      //? add the handler to the marker click event
      el.addEventListener('click', handleClick)

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
