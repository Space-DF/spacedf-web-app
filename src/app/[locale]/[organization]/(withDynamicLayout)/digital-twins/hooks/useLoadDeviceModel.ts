'use client'

import { usePrevious } from '@/hooks/usePrevious'
import { Device as DeviceType, useDeviceStore } from '@/stores/device-store'
import { createMQTTStore } from '@/stores/mqtt'
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
import { animate, linear } from 'popmotion'
import { useCallback, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useMapGroupCluster } from './useMapGroupCluster'
import { Material } from '@deck.gl/core'

type CreateRotatingLayerProps = {
  device: DeviceType
  rotation?: number
  model: GLTFWithBuffers
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
    setDeviceReceivedData,
  } = useDeviceStore(
    useShallow((state) => ({
      devices: state.devices,
      models: state.models,
      deviceSelected: state.deviceSelected,
      currentDeviceData: state.devices[deviceId],
      setDeviceSelected: state.setDeviceSelected,
      setDeviceReceivedData: state.setDeviceReceivedData,
    }))
  )

  const { subscribeToDevice, deviceReceivedData } = useMQTTStore(
    useShallow((state) => ({
      subscribeToDevice: state.subscribeToDevice,
      deviceReceivedData: state.deviceReceivedData[deviceId],
    }))
  )

  const { updateClusters } = useMapGroupCluster()

  const previousDevice = usePrevious(currentDeviceData)

  const deviceModelOverlayRef = useRef<MapboxOverlay | null>(null)
  const deviceTripRealtimeRef = useRef<MapboxOverlay | null>(null)
  const currentDeviceDataRef = useRef<DeviceType | null>(null)
  const deviceModelRef = useRef<GLTFWithBuffers | null>(null)
  const animationRef = useRef<{ stop: () => void } | null>(null)
  const dataStartUpdated = useRef(false)

  const overlayId = `device-model-overlay-${deviceId}`

  useEffect(() => {
    loadDeviceModel()
    subscribeToDevice(deviceId)
  }, [])

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

      setDeviceReceivedData(deviceId, newData)

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
    ({ device, model, rotation }: CreateRotatingLayerProps) => {
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
        sizeScale: 15,
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

  const loadDeviceModel = () => {
    currentDeviceDataRef.current = currentDeviceData

    const model = models[currentDeviceData.type]

    deviceModelRef.current = model

    const deviceModelLayer = createRotatingLayer({
      device: currentDeviceData,
      model,
    })

    const deviceModelOverlay = new MapboxOverlay({
      layers: [deviceModelLayer],
      id: `device-model-overlay-${currentDeviceData.id}`,
    })

    deviceModelOverlayRef.current = deviceModelOverlay

    window.mapInstance?.addControl(deviceModelOverlay)
  }

  const deviceFocusAnimation = () => {
    const map = window.mapInstance.getMapInstance()

    map?.flyTo({
      center: currentDeviceDataRef.current?.latestLocation,
      zoom: 19,
      duration: 2000,
      essential: true,
      pitch: 77,
    })
  }

  const startDeviceAnimation = () => {
    if (!currentDeviceDataRef.current) return

    animationRef.current = animate({
      from: 0,
      to: 360,
      repeat: Infinity,
      ease: linear,
      duration: 5000,
      onUpdate: (rotation) => {
        deviceModelOverlayRef.current?.setProps({
          id: overlayId,
          layers: [
            createRotatingLayer({
              device: currentDeviceDataRef.current as any,
              rotation,
              model: deviceModelRef.current as any,
            }),
          ],
        })
      },
    })
  }

  const stopDeviceAnimation = () => {
    if (!deviceModelOverlayRef.current) return

    animationRef.current?.stop()

    deviceModelOverlayRef.current.setProps({
      id: overlayId,
      layers: [
        createRotatingLayer({
          device: currentDeviceDataRef.current as any,
          model: deviceModelRef.current as any,
        }),
      ],
    })
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

    // // console.log({ deviceModelOverlay })

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
