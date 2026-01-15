import { Device } from '@/stores/device-store'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ScatterplotLayer, ScenegraphLayer } from 'deck.gl'
import { IControl } from 'mapbox-gl'
import { easeOut, linear } from 'popmotion'
import EventEmitter from '../../event'

import {
  appendLayerForGlobalOverlay,
  LAYER_IDS,
  removeLayersFromGlobalOverlay,
} from './global-overlay-instance'

const DESTROY_LAYERS_INTERVAL = 60000 // 60 seconds\

const MODEL_URLS = {
  light:
    'https://d33et8skld5wvq.cloudfront.net/glbs/spacedf/location-model-logo-grey.glb',
  dark: 'https://d33et8skld5wvq.cloudfront.net/glbs/spacedf/location-model-logo-purple.glb',
}

const COLORS = {
  dark: [139, 27, 198],
  light: [121, 88, 255],
}

class MultiTrackerLayerInstance {
  private static instance: MultiTrackerLayerInstance | undefined
  private emitter = new EventEmitter()
  private map: mapboxgl.Map | null = null
  private layers: ScenegraphLayer[] = []
  private isInitialized = false
  private hasLayerRotation = false
  private isLayersAvailable = false
  private destroyTimer: NodeJS.Timeout | null = null
  private isVisible = false
  private devices: Record<string, Device> = {}
  private focusedDevice: string | null = null
  private deviceTypes: Set<string> = new Set()
  private mapZoom: number = 0
  private currentTheme: 'light' | 'dark' = 'light'

  private globalOverlay: MapboxOverlay | null = null
  private constructor() {}

  private _handleMapMove = () => {
    if (!this.map) return
    const zoom = this.map.getZoom()

    if (zoom === this.mapZoom) return

    this.mapZoom = zoom

    const layers = this.buildLayers(
      this.devices,
      this.isVisible ? 'visible' : 'hidden'
    )
    if (this.globalOverlay && layers?.length) {
      const newLayers = appendLayerForGlobalOverlay(layers, this.globalOverlay)
      this.globalOverlay.setProps({ layers: newLayers })
    }

    this._build3DLayerOutline()
  }

  private _getScaleByZoom(zoom: number) {
    const minZoom = 9
    const maxZoom = 17

    const minScale = 9
    const maxScale = 400

    const tRaw =
      1 - Math.max(0, Math.min(1, (zoom - minZoom) / (maxZoom - minZoom)))
    const t = Math.pow(tRaw, 1.8)

    return minScale + t * (maxScale - minScale)
  }

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

  private _build3DLayerOutline() {
    const baseRadius = this._getScaleByZoom(this.mapZoom) * 1.5

    const layerData = Object.values(this.devices).map((d) => {
      const [lng, lat] = d.deviceProperties?.latest_checkpoint_arr || [0, 0]

      return {
        id: d.id,
        position: [lng, lat],
      }
    })

    const color = COLORS[this.currentTheme] as [number, number, number]

    const locationDeckGLPulseLayer = new ScatterplotLayer({
      id: LAYER_IDS.LOCATION_OUTLINE_PULSE,
      data: layerData,

      getPosition: (d) => [d.position[0], d.position[1], 4],

      getRadius: () => baseRadius,

      getFillColor: (d) => {
        if (d.id !== this.focusedDevice) return [...color, 80]

        return [...color, 220]
      },

      radiusUnits: 'meters',
      stroked: false,
      filled: true,
      pickable: false,

      opacity: this.isVisible ? 1 : 0,

      transitions: {
        opacity: { duration: 300, easing: easeOut },
        getPosition: { duration: 300, easing: linear },
        getFillColor: { duration: 300, easing: linear },
      },

      updateTriggers: {
        opacity: this.isVisible,
        getPosition: Object.values(this.devices).map((d) => {
          const [lng, lat] = d.deviceProperties?.latest_checkpoint_arr || [0, 0]
          return `${lng}-${lat}`
        }),
      },
    })

    if (this.globalOverlay) {
      const newLayers = appendLayerForGlobalOverlay(
        [locationDeckGLPulseLayer],
        this.globalOverlay
      )

      this.globalOverlay.setProps({
        layers: newLayers,
      })
    }
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

    console.log(MODEL_URLS[this.currentTheme])

    Object.entries(grouped).forEach(([typeKey, group]) => {
      this.deviceTypes.add(typeKey)

      const layer = new ScenegraphLayer({
        id: `${LAYER_IDS.DEVICE_LAYER}-${typeKey}`,
        data: group.map((d) => {
          const [lng, lat] = d.deviceProperties?.latest_checkpoint_arr || [0, 0]

          return {
            id: d.id,
            position: [lng, lat, 20],
            /* Object-level triggers: KEY FOR PERFORMANCE */
            positionTrigger: `${lng}-${lat}`,
            opacityTrigger: type === 'visible' ? 1 : 0,
          }
        }),
        scenegraph: MODEL_URLS[this.currentTheme],
        getPosition: (d) => [d.position[0], d.position[1], 5],
        getOrientation: () => [0, 0, 0],
        sizeScale: this._getScaleByZoom(this.mapZoom),
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
          sizeScale: this.mapZoom,
        },
        onClick: ({ object }) => {
          if (!this.isVisible || !this.isLayersAvailable) return
          this.emitter.emit('layer-click', object)
        },

        parameters: {
          depthTest: true,
        },
      })

      layers.push(layer)
    })

    return layers
  }

  init(map: mapboxgl.Map, globalOverlay: MapboxOverlay) {
    this.map = map
    this.map.on('move', this._handleMapMove)
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
    this.devices = devices

    this.isVisible = type === 'visible'

    if (type === 'hidden') {
      this.scheduleLayerDestroy()
      this.clearFocusDevice()
      this.hasLayerRotation = false
    } else {
      if (this.destroyTimer) clearTimeout(this.destroyTimer)
    }

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

    this._build3DLayerOutline()

    this.isLayersAvailable = true
  }

  focusDevice(deviceId: string) {
    this.focusedDevice = deviceId
    const device = this.devices[deviceId]
    if (!this.map || !deviceId || !device) return

    this._build3DLayerOutline()
  }

  clearFocusDevice() {
    this.focusedDevice = null
    this._build3DLayerOutline()
  }

  checkLayerAvailable() {
    return this.isLayersAvailable
  }

  checkLayerVisible() {
    return this.isVisible
  }

  async syncTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme
    if (!this.map || !this.isInitialized || !this.globalOverlay) return

    const layers = this.buildLayers(
      this.devices,
      this.isVisible ? 'visible' : 'hidden'
    )

    await new Promise((resolve) => setTimeout(resolve, 100))

    if (this.globalOverlay && layers?.length) {
      const newLayers = appendLayerForGlobalOverlay(layers, this.globalOverlay)
      this.globalOverlay.setProps({ layers: newLayers })
    }

    await new Promise((resolve) => setTimeout(resolve, 100))

    this._build3DLayerOutline()
  }

  remove() {
    if (!this.map) return

    this.clearFocusDevice()
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
