import { Device, useDeviceStore } from '@/stores/device-store'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { GLTFWithBuffers } from '@loaders.gl/gltf'
import {
  AmbientLight,
  Color,
  LayersList,
  LightingEffect,
  PointLight,
  ScenegraphLayer,
} from 'deck.gl'
import { animate, linear } from 'popmotion'
import { useCallback, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { Material } from '@deck.gl/core'
import Supercluster from 'supercluster'
import { useGetDevices } from '@/hooks/useDevices'

type CreateRotatingLayerProps = {
  device: Device
  rotation?: number
  model: GLTFWithBuffers
}

// type Trip = {
//   vendor: number
//   path: Position[]
//   timestamps: number[]
// }

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

const cluster = new Supercluster({
  radius: 10,
  maxZoom: 13,
  extent: 256, // Kích thước lưới
  nodeSize: 64, // Kích thước node trong R-tree
})

export const useLoadDeviceModels = () => {
  const map = useRef<mapboxgl.Map | null>(null)

  const { models, deviceSelected, setDeviceSelected } = useDeviceStore(
    useShallow((state) => ({
      devices: state.devices,
      models: state.models,
      deviceSelected: state.deviceSelected,
      setDeviceSelected: state.setDeviceSelected,
      initializedSuccess: state.initializedSuccess,
    }))
  )

  const { data } = useGetDevices()

  const devices = data || {}

  const startAnimation = useCallback(
    (device: Device, modelsProps: Record<string, GLTFWithBuffers>) => {
      const deckLayers =
        (window.devicesMapOverlay as any)?._props?.layers[0] || []
      animate({
        from: 0,
        to: 360,
        repeat: Infinity,
        ease: linear,
        duration: 5000,
        onUpdate: (rotation) => {
          const newLayers = deckLayers.map((layer: any) => {
            if (layer.id === device.id) {
              return createRotatingLayer({
                device,
                rotation,
                model: modelsProps[device.type],
              })
            }
            return createRotatingLayer({
              device: devices[layer.id],
              model: modelsProps[devices[layer.id].type],
            })
          })

          //update the layers after rotation
          window.devicesMapOverlay.setProps({
            layers: [newLayers],
          })
        },
      })
    },
    []
  )

  useEffect(() => {
    if (!map.current || !window.devicesMapOverlay || !deviceSelected) return

    map.current.flyTo({
      center: devices[deviceSelected].location,
      zoom: 19,
      duration: 2000,
      essential: true,
      pitch: 77,
    })

    const currentDevice = devices[deviceSelected]

    startAnimation(currentDevice, models)
  }, [deviceSelected, models])

  const createRotatingLayer = ({
    device,
    model,
    rotation,
  }: CreateRotatingLayerProps) => {
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
      data: [{ position: [...(device.location as [number, number]), 20] }],
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
  }

  const startShowDevice3D = useCallback(
    (mapInstance: mapboxgl.Map) => {
      const layers: LayersList = []

      map.current = mapInstance

      Object.values(devices).forEach((device) => {
        const model = models[device.type]
        layers.push(createRotatingLayer({ device, model }))
      })

      const devicePoints = Object.values(devices)
        .filter(
          (device) =>
            Array.isArray(device.location) && device.location.length === 2
        ) // Ensure valid locations
        .map((device) => ({
          type: 'Feature',
          properties: { id: device.id, type: device.type },
          geometry: {
            type: 'Point',
            coordinates: device.location as [number, number],
          },
        }))

      cluster.load(devicePoints as any)

      window.cluster = cluster

      window.mapLayer = window.mapLayer.concat(layers)

      window.devicesMapOverlay = new MapboxOverlay({
        interleaved: true,
        layers: [layers],
        effects: DEFAULT_THEME.effects,
      })

      mapInstance.addControl(window.devicesMapOverlay)
    },
    [models]
  )

  return { startShowDevice3D }
}

export const getClusters = (
  bounds: [number, number, number, number],
  zoom: number
) => {
  return cluster.getClusters(bounds, zoom)
}
