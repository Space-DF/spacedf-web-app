'use client'

import { usePrevious } from '@/hooks/usePrevious'
import { Device as DeviceType, useDeviceStore } from '@/stores/device-store'
import { createMQTTStore } from '@/stores/mqtt'
import { Material } from '@deck.gl/core'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { GLTFWithBuffers } from '@loaders.gl/gltf'
import {
  AmbientLight,
  Color,
  LightingEffect,
  PointLight,
  Position,
  ScenegraphLayer,
  TripsLayer,
} from 'deck.gl'
import mapboxgl from 'mapbox-gl'
import { animate, easeOut, linear } from 'popmotion'
import { useCallback, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useMapGroupCluster } from './useMapGroupCluster'
import { delay } from '@/utils'

type CreateRotatingLayerProps = {
  device: DeviceType
  rotation?: number
  model: GLTFWithBuffers
  sizeScale?: number
}

export type Trip = {
  vendor: number
  path: Position[]
}

type Theme = {
  buildingColor: Color
  trailColor0: Color
  trailColor1: Color
  material: Material
  effects: [LightingEffect]
}

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0,
})

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000],
})

const lightingEffect = new LightingEffect({ ambientLight, pointLight })

const DEFAULT_THEME: Theme = {
  buildingColor: [74, 80, 87],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material: {
    ambient: 0.1,
    diffuse: 0.6,
    shininess: 32,
    specularColor: [60, 64, 70],
  },
  effects: [lightingEffect],
}

const useMQTTStore = createMQTTStore()

export const useLoadDeviceModel = (deviceId: string) => {
  const {
    models,
    deviceSelected,
    currentDeviceData,
    setDeviceSelected,
    setDeviceState,
  } = useDeviceStore(
    useShallow((state) => ({
      devices: state.devices,
      models: state.models,
      deviceSelected: state.deviceSelected,
      currentDeviceData: state.devices[deviceId],
      setDeviceSelected: state.setDeviceSelected,
      setDeviceState: state.setDeviceState,
      modelPreview: state.modelPreview,
    }))
  )

  const { subscribeToDevice, deviceReceivedData } = useMQTTStore(
    useShallow((state) => ({
      subscribeToDevice: state.subscribeToDevice,
      deviceReceivedData: state.deviceReceivedData[deviceId],
    }))
  )

  const { updateClusters } = useMapGroupCluster()

  // console.log({
  //   clusteredDeviceIds,
  //   isDeviceClustered: isDeviceClustered(deviceId),
  // })

  const previousDevice = usePrevious(currentDeviceData)

  const deviceModelOverlayRef = useRef<MapboxOverlay | null>(null)
  const deviceTripRealtimeRef = useRef<MapboxOverlay | null>(null)
  const currentDeviceDataRef = useRef<DeviceType | null>(null)
  const deviceModelRef = useRef<GLTFWithBuffers | null>(null)
  const animationRef = useRef<{ stop: () => void } | null>(null)
  const dataStartUpdated = useRef(false)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const overlayId = `device-model-overlay-${deviceId}`

  // const [, setZoom] = useState<number>(0)

  useEffect(() => {
    loadDeviceModel()
    subscribeToDevice(deviceId)
  }, [])

  useEffect(() => {
    window.mapInstance.getMapInstance()?.on('moveend', () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        const isDeviceInCluster = window.mapResource.clusterIds.has(deviceId)

        const map = window.mapInstance.getMapInstance()
        const zoom = map?.getZoom() || 0

        if (!isDeviceInCluster) {
          showDeviceMarker()

          if (zoom <= 16) {
            stopDeviceAnimation()
            removeDeviceTripRealtime()

            setDeviceSelected('')
          }
        } else {
          hideDeviceMarker()
          stopDeviceAnimation()
          removeDeviceTripRealtime()

          setDeviceSelected('')
        }
      }, 300)
    })
  }, [])

  const hideDeviceMarker = () => {
    if (!markerRef.current) return

    const el = markerRef.current.getElement()

    el.classList.add('fade-out')

    setTimeout(() => {
      if (markerRef.current) {
        markerRef.current.remove()
        markerRef.current = null
      }
    }, 600)
  }

  const showDeviceMarker = () => {
    if (!markerRef.current && !deviceModelOverlayRef.current) {
      renderMarker()
    }
  }

  useEffect(() => {
    if (deviceReceivedData) {
      let newData = deviceReceivedData

      if (
        deviceSelected === deviceId &&
        'latestLocation' in deviceReceivedData
      ) {
        newData = {
          ...deviceReceivedData,
          realtimeTrip: [
            ...(currentDeviceData.realtimeTrip || []),
            deviceReceivedData.latestLocation as [number, number],
          ],
        }

        const map = window.mapInstance.getMapInstance()

        map?.easeTo({
          center: deviceReceivedData.latestLocation as [number, number],
          zoom: 17,
          duration: 500,
          essential: true,
          pitch: 60,
        })
      }

      setDeviceState(deviceId, newData)

      dataStartUpdated.current = true
    }
  }, [JSON.stringify(deviceReceivedData), deviceSelected])

  useEffect(() => {
    if (!dataStartUpdated.current) return

    if (JSON.stringify(currentDeviceData) !== JSON.stringify(previousDevice)) {
      currentDeviceDataRef.current = currentDeviceData
      deviceModelOverlayRef.current?.setProps({
        id: overlayId,
        layers: [
          createRotatingLayer({
            device: currentDeviceDataRef.current as any,
            model: deviceModelRef.current as any,
          }),
        ],
      })

      updateClusters()
    }
  }, [JSON.stringify(currentDeviceData)])

  // const loadDeviceTrip = (data) => {
  //   return new TripsLayer<Trip>({
  //     id: 'device-realtime-trip',
  //     data: data,
  //     getPath: (d) => d.path,
  //     getColor: (d) =>
  //       d.vendor === 1 ? DEFAULT_THEME.trailColor0 : DEFAULT_THEME.trailColor1,
  //     opacity: 0.3,
  //     widthMinPixels: 2,
  //     rounded: true,
  //     trailLength: 180,
  //   })
  // }

  const createRotatingLayer = useCallback(
    (
      { device, model, rotation }: CreateRotatingLayerProps,
      opacity: number = 0
    ) => {
      if (!model) return new ScenegraphLayer()

      const isPassedRotation = typeof rotation === 'number'

      const getOrientation = () => {
        if (isPassedRotation)
          return {
            ...(device?.layerProps?.orientation || {}),
            [device?.layerProps?.rotation || '']: rotation,
          }

        return device?.layerProps?.orientation
      }

      const { pitch = 0, yaw = 0, roll = 0 } = getOrientation()

      return new ScenegraphLayer({
        id: device.id,
        data: [
          { position: [...(device.latestLocation as [number, number]), 20] },
        ],
        scenegraph: model,
        getPosition: (d) => d.position,
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
        pickable: true,
        _lighting: 'pbr',
        ...(device.layerProps || {}),
        getOrientation: [pitch, yaw, roll],
        onClick: () => {
          setDeviceSelected(device.id)
        },
      })
    },
    [deviceId]
  )

  useEffect(() => {
    //handle device focus and animation
    if (deviceSelected === deviceId) {
      deviceFocusAnimation()
      startDeviceAnimation()
    } else {
      stopDeviceAnimation()
      removeDeviceTripRealtime()
    }
  }, [deviceSelected])

  useEffect(() => {
    if (deviceSelected === deviceId) {
      if (currentDeviceData.realtimeTrip?.length) {
        drawDeviceHistory()
      }
    } else {
    }
  }, [deviceSelected, JSON.stringify(currentDeviceData.realtimeTrip)])

  // useEffect(() => {
  //   if (firstRender.current) {
  //     window.mapInstance.getMapInstance()?.on('idle', () => {
  //       showDeviceMarker()
  //       firstRender.current = false
  //     })
  //   }

  //   return () => {
  //     firstRender.current = true
  //   }
  // }, [])

  const loadDeviceModel = () => {
    currentDeviceDataRef.current = currentDeviceData
  }

  const renderMarker = () => {
    const map = window.mapInstance.getMapInstance()

    if (!map) return
    const el = document.createElement('div')

    el.className = `${currentDeviceData.type}-marker`
    el.id = `${currentDeviceData.type}-marker-${currentDeviceData.id}`

    // Add style for opacity and transition
    el.style.opacity = '0'
    // el.style.transition = 'opacity 0.5s ease-in-out'

    markerRef.current = new mapboxgl.Marker(el, {
      offset: [0, -90],
    })
      .setLngLat([...(currentDeviceData.latestLocation || [0, 0])])
      .addTo(map)

    // requestAnimationFrame(() => {
    //   el.style.opacity = '1'
    // })

    el.classList.add('fade-in')

    el.addEventListener('click', () => {
      setDeviceSelected(currentDeviceData.id)
    })
  }

  const deviceFocusAnimation = () => {
    const map = window.mapInstance.getMapInstance()

    map?.flyTo({
      center: currentDeviceDataRef.current?.latestLocation,
      zoom: 19,
      duration: 1000,
      essential: true,
      pitch: 77,
    })
  }

  const startDeviceAnimation = async () => {
    if (!currentDeviceDataRef.current) return

    const map = window.mapInstance.getMapInstance()

    hideDeviceMarker()

    const model = models[currentDeviceData.type]

    deviceModelRef.current = model

    if (deviceModelOverlayRef.current) return

    const deviceModelLayer = createRotatingLayer(
      {
        device: currentDeviceData,
        model,
      },
      1
    )

    await delay(500)

    const deviceModelOverlay = new MapboxOverlay({
      layers: [deviceModelLayer],
      id: `device-model-overlay-${currentDeviceData.id}`,
    })

    deviceModelOverlayRef.current = deviceModelOverlay

    map?.addControl(deviceModelOverlay)

    animationRef.current = animate({
      from: 0,
      to: 360,
      repeat: Infinity,
      ease: linear,
      duration: 5000,
      onUpdate: (rotation) => {
        deviceModelOverlayRef.current?.setProps({
          id: `device-model-overlay-${currentDeviceData.id}`,
          layers: [
            createRotatingLayer(
              {
                device: currentDeviceDataRef.current as any,
                rotation,
                model: deviceModelRef.current as any,
              },
              100
            ),
          ],
        })
      },
    })
  }

  const stopDeviceAnimation = () => {
    if (!deviceModelOverlayRef.current) return

    animationRef.current?.stop()

    const map = window.mapInstance.getMapInstance()

    if (map) {
      setTimeout(() => {
        map.removeControl(deviceModelOverlayRef.current as any)

        deviceModelOverlayRef.current = null

        if (!markerRef.current) {
          renderMarker()
        }
      }, 500)
    }
  }

  const drawDeviceHistory = () => {
    const dataRealtime = [
      {
        waypoints: (currentDeviceData.realtimeTrip || []).map(
          (location, index) => ({
            coordinates: location,
            timestamp: index * 1000,
          })
        ),
      },
    ]

    const map = window.mapInstance.getMapInstance()

    const layer = new TripsLayer({
      id: 'trips-layer',
      data: dataRealtime,

      getPath: (d) => d.waypoints.map((p: any) => p.coordinates),
      getTimestamps: (d) => d.waypoints.map((p: any) => p.timestamp),

      getColor: () => [253, 128, 93],
      currentTime: dataRealtime[0].waypoints.length * 1000,
      trailLength: 1000000,

      capRounded: true,
      jointRounded: true,
      widthMinPixels: 8,
    })

    // const layer = new TripsLayer<Trip>({
    //   id: 'device-realtime-trip',
    //   data: trip,
    //   getPath: (d) => d.path,
    //   getTimestamps: (d: any) => d.timestamps,
    //   getColor: (d) =>
    //     d.vendor === 1 ? DEFAULT_THEME.trailColor0 : DEFAULT_THEME.trailColor1,
    //   opacity: 0.3,
    //   widthMinPixels: 2,
    //   rounded: true,
    //   trailLength: 180,
    //   currentTime: 105,
    // })

    const deviceModelOverlay = new MapboxOverlay({
      layers: [layer],
      effects: DEFAULT_THEME.effects,
      id: `device-trip-realtime-${deviceId}`,
    })

    deviceTripRealtimeRef.current = deviceModelOverlay

    map?.addControl(deviceModelOverlay)

    // console.log('123', map?.getSource('realtime-trip'))
    // if (map?.getSource('device-realtime-trip')) {
    //   ;(map?.getSource('device-realtime-trip') as any)?.setData(geojson)
    // } else {
    //   map?.addControl(loadDeviceTrip(trip))
    //   // map?.addLayer({
    //   //   id: 'realtime-trip',
    //   //   type: 'line',
    //   //   source: {
    //   //     type: 'geojson',
    //   //     data: geojson as any,
    //   //   },
    //   //   layout: {
    //   //     'line-join': 'round',
    //   //     'line-cap': 'round',
    //   //   },
    //   //   paint: {
    //   //     'line-color': '#1052FF',
    //   //     'line-width': 8,
    //   //     'line-opacity': 0.75,
    //   //   },
    //   // })
    // }
  }

  const removeDeviceTripRealtime = () => {
    // if (!deviceTripRealtimeRef.current) return
    // const map = window.mapInstance.getMapInstance()
    // map?.removeLayer('trips-layer')
    // console.log({ deviceTripRealtimeRef })
    // window.mapInstance
    //   .getMapInstance()
    //   ?.removeControl(deviceTripRealtimeRef.current as any)
  }

  return { removeDeviceTripRealtime }
}
