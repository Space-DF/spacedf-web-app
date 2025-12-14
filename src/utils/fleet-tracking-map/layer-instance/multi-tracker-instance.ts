import { Device } from '@/stores/device-store'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { GLTFWithBuffers } from '@loaders.gl/gltf'
import { ScenegraphLayer } from 'deck.gl'
import { animate, easeOut, linear } from 'popmotion'
import EventEmitter from '../../event'
import { IControl } from 'mapbox-gl'
import {
  appendLayerForGlobalOverlay,
  LAYER_IDS,
  removeLayersFromGlobalOverlay,
} from './global-overlay-instance'
import { SupportedModels } from '@/constants/device-property'

const DESTROY_LAYERS_INTERVAL = 60000 // 60 seconds

class MultiTrackerLayerInstance {
  private static instance: MultiTrackerLayerInstance | undefined
  private emitter = new EventEmitter()
  private map: mapboxgl.Map | null = null
  private layers: ScenegraphLayer[] = []
  private deviceModels: Record<string, GLTFWithBuffers> = {}
  private isInitialized = false
  private hasLayerRotation = false
  private isLayersAvailable = false
  private destroyTimer: NodeJS.Timeout | null = null
  private isVisible = false
  private devices: Record<string, Device> = {}
  private focusedDevice: string | null = null
  private deviceTypes: Set<string> = new Set()

  private rotationRef: {
    stop: () => void
  } | null = null

  private globalOverlay: MapboxOverlay | null = null
  private constructor() {}

  static getInstance() {
    if (!MultiTrackerLayerInstance.instance) {
      MultiTrackerLayerInstance.instance = new MultiTrackerLayerInstance()
    }
    return MultiTrackerLayerInstance.instance
  }

  on(event: string, handler: Function) {
    this.emitter.on(event, handler)
  }

  off(event: string, handler: Function) {
    this.emitter.off(event, handler)
  }

  stopDeviceRotationAnimation() {
    if (this.rotationRef) {
      this.rotationRef.stop()
      this.rotationRef = null
    }

    this.focusedDevice = null

    if (this.isVisible) {
      this.resetLayersState()
    }
  }

  resetLayersState() {
    if (!this.isInitialized) return
    const freshLayers = this.buildLayers(this.devices, 'visible')

    if (this.globalOverlay && freshLayers?.length) {
      const newLayers = appendLayerForGlobalOverlay(
        freshLayers || [],
        this.globalOverlay
      )

      this.globalOverlay.setProps({
        layers: newLayers,
      })
    }
  }

  deviceRotationAnimation(deviceId: string) {
    if (!this.map || !this.isInitialized || !this.isVisible) return

    this.hasLayerRotation = true
    this.focusedDevice = deviceId

    const deviceData = this.devices[deviceId]

    this.stopDeviceRotationAnimation()

    const initialLocation = deviceData.deviceProperties?.latest_checkpoint_arr
      ? [...deviceData.deviceProperties?.latest_checkpoint_arr]
      : null

    this.rotationRef = animate({
      from:
        deviceData.layerProps?.orientation?.yaw === 360
          ? 0
          : deviceData.layerProps?.orientation?.yaw || 0,
      to: 360 - (deviceData.layerProps?.orientation?.yaw || 0) || 360,
      duration: 2000,
      repeat: Infinity,
      ease: linear,
      onUpdate: (rotation) => {
        const newDevices = Object.entries(this.devices).map(([key, device]) => {
          if (device.id === deviceId) {
            const latest =
              this.devices[deviceId]?.deviceProperties?.latest_checkpoint_arr

            if (
              latest &&
              initialLocation &&
              (latest[0] !== initialLocation[0] ||
                latest[1] !== initialLocation[1])
            ) {
              this.map?.easeTo({
                center: latest as [number, number],
                zoom: 18,
                duration: 500,
                essential: true,
                pitch: 90,
              })
            }

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
        })

        const newDevicesData = Object.fromEntries(newDevices)

        const newLayersToAppend = this.buildLayers(newDevicesData, 'visible')

        if (this.globalOverlay && newLayersToAppend?.length) {
          const newLayers = appendLayerForGlobalOverlay(
            newLayersToAppend || [],
            this.globalOverlay
          )

          this.globalOverlay.setProps({
            layers: newLayers,
          })
        }
      },
    })
  }

  private buildLayers(
    devices: Record<string, Device>,
    type: 'visible' | 'hidden' = 'visible'
  ) {
    if (!this.map || !this.isInitialized || !this.globalOverlay) return

    const visibleDevices = Object.values(devices).filter(
      (d) =>
        Array.isArray(d.deviceProperties?.latest_checkpoint_arr) &&
        d.deviceProperties?.latest_checkpoint_arr.length === 2
    )

    if (!visibleDevices.length) return []

    const grouped = visibleDevices.reduce(
      (acc, d) => {
        acc[d.type] = acc[d.type] || []
        acc[d.type].push(d)
        return acc
      },
      {} as Record<string, Device[]>
    )

    const layers: ScenegraphLayer[] = []

    Object.entries(grouped).forEach(([typeKey, group]) => {
      this.deviceTypes.add(typeKey)

      const layer = new ScenegraphLayer({
        id: `${LAYER_IDS.DEVICE_LAYER}-${typeKey}`,
        data: group.map((d) => {
          const pitch = d.layerProps?.orientation?.pitch || 0
          const yaw = d.layerProps?.orientation?.yaw || 0
          const roll = d.layerProps?.orientation?.roll || 0

          const [lng, lat] = d.deviceProperties?.latest_checkpoint_arr || [0, 0]

          return {
            id: d.id,
            position: [lng, lat, 20],
            orientation: [pitch, yaw, roll],

            /* Object-level triggers: KEY FOR PERFORMANCE */
            positionTrigger: `${lng}-${lat}`,
            orientationTrigger: `${pitch}-${yaw}-${roll}`,
            opacityTrigger: type === 'visible' ? 1 : 0,
          }
        }),
        scenegraph: this.deviceModels[typeKey as SupportedModels],
        getPosition: (d) => d.position,
        getOrientation: (d) => d.orientation,
        sizeScale: group[0]?.layerProps?.sizeScale || 200,
        pickable: true,
        opacity: type === 'visible' ? 1 : 0,
        transitions: {
          getPosition: this.hasLayerRotation
            ? { duration: 0 }
            : {
                duration: 400,
                easing: easeOut,
              },
          getOrientation: { duration: 800, easing: easeOut },
          opacity: { duration: 300, easing: linear },
        },
        updateTriggers: {
          getPosition: (d: any) => d.positionTrigger,
          getOrientation: (d: any) => d.orientationTrigger,
          getOpacity: (d: any) => d.opacityTrigger,
        },
        onClick: ({ object }) => {
          if (!this.isVisible || !this.isLayersAvailable) return
          this.emitter.emit('layer-click', object)
        },

        parameters: {
          depthTest: true,
        },

        _lighting: 'pbr',
      })

      layers.push(layer)
    })

    return layers
  }

  init(
    map: mapboxgl.Map,
    deviceModels: Record<string, GLTFWithBuffers>,
    globalOverlay: MapboxOverlay
  ) {
    this.map = map
    this.deviceModels = deviceModels

    this.globalOverlay = globalOverlay

    this.isInitialized = true
  }

  scheduleLayerDestroy() {
    if (this.destroyTimer) {
      clearTimeout(this.destroyTimer)
    }

    this.destroyTimer = setTimeout(() => {
      const layerIdsToRemove = Array.from(this.deviceTypes).map(
        (type) => `${LAYER_IDS.DEVICE_LAYER}-${type}`
      )

      if (this.globalOverlay) {
        const newLayers = removeLayersFromGlobalOverlay(
          layerIdsToRemove,
          this.globalOverlay
        )

        this.globalOverlay?.setProps({
          layers: newLayers,
        })
      }
      this.layers = []
    }, DESTROY_LAYERS_INTERVAL)
  }

  syncLayers(
    devices: Record<string, Device>,
    type: 'visible' | 'hidden' = 'visible'
  ) {
    if (!this.map || !this.isInitialized) return

    const hadDeviceDeleted =
      this.hasLayerRotation &&
      Object.keys(this.devices).some((id) => !devices[id])

    const rotatingDeviceDeleted =
      this.hasLayerRotation &&
      this.focusedDevice &&
      !devices[this.focusedDevice]

    this.devices = devices

    this.isVisible = type === 'visible'

    if (type === 'hidden') {
      this.scheduleLayerDestroy()
      this.stopDeviceRotationAnimation()
      this.hasLayerRotation = false
    } else {
      if (this.destroyTimer) clearTimeout(this.destroyTimer)
    }

    if (rotatingDeviceDeleted) {
      this.stopDeviceRotationAnimation()
      this.hasLayerRotation = false
    }

    if (this.hasLayerRotation && !hadDeviceDeleted) return

    const layers = this.buildLayers(devices, type)
    this.layers = layers || []

    if (this.globalOverlay) {
      const newLayers = appendLayerForGlobalOverlay(
        layers || [],
        this.globalOverlay
      )

      this.globalOverlay.setProps({
        layers: newLayers,
      })
    }

    this.isLayersAvailable = true
  }

  focusDevice(deviceId: string) {
    this.focusedDevice = deviceId
  }

  clearFocusDevice() {
    this.focusedDevice = null
  }

  checkLayerAvailable() {
    return this.isLayersAvailable
  }

  checkLayerVisible() {
    return this.isVisible
  }

  remove() {
    if (!this.map) return

    this.stopDeviceRotationAnimation()
    if (this.destroyTimer) {
      clearTimeout(this.destroyTimer)
      this.destroyTimer = null
    }

    this.emitter.clear()
    if (this.globalOverlay) {
      this.map.removeControl(this.globalOverlay as unknown as IControl)
      this.globalOverlay = null
    }

    this.layers = []
    this.devices = {}
    this.deviceModels = {}
    this.focusedDevice = null
    this.isInitialized = false
    this.hasLayerRotation = false
    this.isLayersAvailable = false
    this.isVisible = false
    this.map = null
    MultiTrackerLayerInstance.instance = undefined
  }
}

export { MultiTrackerLayerInstance }
