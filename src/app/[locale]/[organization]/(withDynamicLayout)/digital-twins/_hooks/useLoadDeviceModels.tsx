import { Device, useDeviceStore } from '@/stores/device-store'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { GLTFWithBuffers } from '@loaders.gl/gltf'
import {
  AmbientLight,
  Color,
  LayersList,
  LightingEffect,
  PointLight,
  Position,
  ScenegraphLayer,
  TripsLayer,
} from 'deck.gl'
import { animate, linear } from 'popmotion'
import { useCallback, useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { Material } from '@deck.gl/core'
import Supercluster from 'supercluster'

const centerPoint: [number, number] = [108.22003, 16.05486]

const data = [
  {
    timestamps: [0, 15, 30, 45, 60, 75, 90, 105],
    vendor: 1,
    path: [
      [108.223065, 16.067789], // Start near Dragon Bridge
      [108.223492, 16.068198], // Move along Bach Dang Street
      [108.224398, 16.068689], // Continue on Bach Dang
      [108.225945, 16.070017], // Pass Han Market
      [108.227567, 16.072003], // Near Da Nang Museum
      [108.22938, 16.07345], // Towards Da Nang City Hall
      [108.230583, 16.0739], // Da Nang Administrative Center
      [108.2317, 16.075], // End at nearby park
    ],
  },
  {
    timestamps: [0, 20, 40, 60, 80, 100, 120, 140, 160],
    vendor: 2,
    path: [
      [108.203089, 16.04329], // Start near My Khe Beach
      [108.20449, 16.04412], // Walk towards Vo Nguyen Giap street
      [108.20659, 16.0455], // Near Vinpearl Luxury Hotel
      [108.20986, 16.04673], // Approaching East Sea Park
      [108.21314, 16.04789], // Along Pham Van Dong Street
      [108.2175, 16.05013], // Cross Han River Bridge
      [108.22177, 16.05221], // Towards the city center
      [108.223065, 16.067789], // End back at Dragon Bridge
    ],
  },
  {
    timestamps: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90],
    vendor: 3,
    path: [
      [108.21178, 16.074728], // Start at Da Nang Train Station
      [108.21259, 16.07387], // Move along Hai Phong Street
      [108.2134, 16.0729], // Near Big C Supermarket
      [108.21421, 16.07193], // Along Dien Bien Phu Street
      [108.21502, 16.07097], // Near Con Market
      [108.21583, 16.07], // Towards Phan Chu Trinh Street
      [108.21664, 16.06905], // Near Nguyen Van Linh Street
      [108.21745, 16.06809], // Approach Cham Museum
      [108.21826, 16.06714], // Continue along Bach Dang Street
      [108.223065, 16.067789], // End near Dragon Bridge
    ],
  },
]

type CreateRotatingLayerProps = {
  device: Device
  rotation?: number
  model: GLTFWithBuffers
}

type Trip = {
  vendor: number
  path: Position[]
  timestamps: number[]
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

function createRotatingLayer(rotation: number, model: any) {
  return new ScenegraphLayer()
}

const cluster = new Supercluster({
  radius: 10,
  maxZoom: 13,
  extent: 256, // Kích thước lưới
  nodeSize: 64, // Kích thước node trong R-tree
})

export const useLoadDeviceModels = () => {
  const map = useRef<mapboxgl.Map | null>(null)

  const {
    devices,
    models,
    deviceSelected,
    initializedSuccess,
    setDeviceSelected,
  } = useDeviceStore(
    useShallow((state) => ({
      devices: state.devices,
      models: state.models,
      deviceSelected: state.deviceSelected,
      setDeviceSelected: state.setDeviceSelected,
      initializedSuccess: state.initializedSuccess,
    })),
  )

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
    [],
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

  const createTripLayer = (time: number) => {
    return new TripsLayer<Trip>({
      id: 'trips',
      data,
      getPath: (d) => d.path,
      getTimestamps: (d) => d.timestamps,
      getColor: (d) =>
        d.vendor === 0 ? DEFAULT_THEME.trailColor0 : DEFAULT_THEME.trailColor1,
      opacity: 0.3,
      widthMinPixels: 2,
      rounded: true,
      trailLength: 180,
      currentTime: time,
    })
  }

  const startShowDevice3D = useCallback(
    (mapInstance: mapboxgl.Map) => {
      let layers: LayersList = []

      map.current = mapInstance

      Object.values(devices).forEach((device) => {
        const model = models[device.type]
        layers.push(createRotatingLayer({ device, model }))
      })

      const devicePoints = Object.values(devices)
        .filter(
          (device) =>
            Array.isArray(device.location) && device.location.length === 2,
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
    [models],
  )

  return { startShowDevice3D }
}

export const getClusters = (
  bounds: [number, number, number, number],
  zoom: number,
) => {
  return cluster.getClusters(bounds, zoom)
}
