import { Device, useDeviceStore as useDeviceStore } from '@/stores/device-store'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { GLTFBuffer, GLTFWithBuffers } from '@loaders.gl/gltf'
import { LayersList, ScenegraphLayer } from 'deck.gl'
import { animate, linear } from 'popmotion'
import {
  MutableRefObject,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { useShallow } from 'zustand/react/shallow'

import Supercluster from 'supercluster'

const centerPoint: [number, number] = [108.22003, 16.05486]

type CreateRotatingLayerProps = {
  device: Device
  rotation?: number
  model: GLTFWithBuffers
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
  const deckOverlayRef = useRef<MapboxOverlay | null>(null)

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
    (device: Device, model: GLTFWithBuffers) => {
      const deckLayers =
        (deckOverlayRef.current as any)?._props?.layers[0] || []

      console.log({ device, models })

      animate({
        from: 0,
        to: 360,
        repeat: Infinity,
        ease: linear,
        duration: 5000,
        onUpdate: (rotation) => {
          console.log({ rotation })
          const newLayers = deckLayers.map((layer: any) => {
            if (layer.id === device.id) {
              return createRotatingLayer({
                device,
                rotation,
                model: model,
              })
            }
            return createRotatingLayer({
              device: devices[layer.id],
              model: models[devices[layer.id].type],
            })
          })

          //update the layers after rotation
          deckOverlayRef.current?.setProps({
            layers: [newLayers],
          })
        },
      })
    },
    [],
  )

  useEffect(() => {
    if (!map.current || !deckOverlayRef.current || !deviceSelected) return

    map.current.flyTo({
      center: devices[deviceSelected].location,
      zoom: 19,
      duration: 2000,
      essential: true,
      pitch: 77,
    })

    const currentDevice = devices[deviceSelected]

    startAnimation(currentDevice, models[currentDevice.type])
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

      const deckOverlay = new MapboxOverlay({
        interleaved: true,
        layers: [layers],
      })

      deckOverlayRef.current = deckOverlay

      mapInstance.addControl(deckOverlay)
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
