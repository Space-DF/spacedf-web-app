import { Device } from '@/stores/device-store'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { GLTFWithBuffers } from '@loaders.gl/gltf'
import { ScenegraphLayer } from 'deck.gl'
import { animate, easeOut, linear } from 'popmotion'
import { SupportedModels } from '../model-objects/devices/gps-tracker/type'
import EventEmitter from '../event'
import { IControl } from 'mapbox-gl'

const DESTROY_LAYERS_INTERVAL = 30000 // 60 seconds

class DeckGLInstance {
  private static instance: DeckGLInstance
  private emitter = new EventEmitter()
  private map: mapboxgl.Map | null = null
  private deck: MapboxOverlay | null = null
  private layers: ScenegraphLayer[] = []
  private deviceModels: Record<string, GLTFWithBuffers> = {}
  private isInitialized = false
  private hasLayerRotation = false
  private isLayersAvailable = false
  private destroyTimer: NodeJS.Timeout | null = null
  private isVisible = false
  private devices: Record<string, Device> = {}
  private focusedDevice: string | null = null
  private rotationRef: {
    stop: () => void
  } | null = null

  private constructor() {}

  static getInstance() {
    if (!DeckGLInstance.instance) {
      DeckGLInstance.instance = new DeckGLInstance()
    }
    return DeckGLInstance.instance
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

    if (freshLayers?.length) {
      this.deck?.setProps({
        layers: freshLayers,
      })
    }
  }

  deviceRotationAnimation(deviceId: string) {
    if (!this.map || !this.isInitialized || !this.isVisible) return

    this.hasLayerRotation = true
    this.focusedDevice = deviceId

    const deviceData = this.devices[deviceId]

    this.stopDeviceRotationAnimation()

    const initialLocation = deviceData.latestLocation
      ? [...deviceData.latestLocation]
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
            const latest = this.devices[deviceId]?.latestLocation

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

        const newLayers = this.buildLayers(newDevicesData, 'visible')

        if (newLayers?.length) {
          this.deck?.setProps({
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
    if (!this.map || !this.isInitialized) return

    const visibleDevices = Object.values(devices).filter(
      (d) => Array.isArray(d.latestLocation) && d.latestLocation.length === 2
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
      const layer = new ScenegraphLayer({
        id: `layer-${typeKey}`,
        data: group.map((d) => {
          const pitch = d.layerProps?.orientation?.pitch || 0
          const yaw = d.layerProps?.orientation?.yaw || 0
          const roll = d.layerProps?.orientation?.roll || 0

          const [lng, lat] = d.latestLocation || [0, 0]

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

        _lighting: 'pbr',
      })

      layers.push(layer)
    })

    return layers
  }

  init(map: mapboxgl.Map, deviceModels: Record<string, GLTFWithBuffers>) {
    this.map = map
    this.deviceModels = deviceModels

    this.deck = new MapboxOverlay({
      interleaved: true,
      layers: this.layers,
    })

    map.addControl(this.deck)

    this.isInitialized = true
  }

  scheduleLayerDestroy() {
    if (this.destroyTimer) {
      clearTimeout(this.destroyTimer)
    }

    this.destroyTimer = setTimeout(() => {
      this.deck?.setProps({
        layers: [],
      })
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

    this.deck?.setProps({
      layers: layers,
    })

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

    this.map.removeControl(this.deck as unknown as IControl)
    this.deck = null
    this.layers = []
    this.devices = {}
    this.focusedDevice = null
    this.isInitialized = false
  }
}

export { DeckGLInstance }
