import { Device } from '@/stores/device-store'
import EventEmitter from '@/utils/event'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { load } from '@loaders.gl/core'
import { GLTFLoader } from '@loaders.gl/gltf'
import { ScatterplotLayer, ScenegraphLayer } from 'deck.gl'
import isEqual from 'fast-deep-equal'
import MapLibreGL from 'maplibre-gl'
import { linear } from 'popmotion'
import { MAP_PITCH } from '../../constant'
import { GlobalDeckGLInstance, LAYER_IDS } from '../global-layer-instance'
import { pulseController } from '../pulse-controller'

type LayerResource = {
  id: string
  position: [number, number]
  direction: number
}

const MODEL_URLS = {
  light:
    'https://d33et8skld5wvq.cloudfront.net/glbs/spacedf/location-model-logo-grey.glb',
  dark: 'https://d33et8skld5wvq.cloudfront.net/glbs/spacedf/location-model-logo-purple.glb',
}

const modelCache: Record<string, any> = {}

async function preloadModel(theme: 'dark' | 'light') {
  if (!modelCache[theme]) {
    modelCache[theme] = await load(MODEL_URLS[theme], GLTFLoader)
  }

  return modelCache[theme]
}

const globalDeckGLInstance = GlobalDeckGLInstance.getInstance()
export class LocationDeckGLInstance {
  private static instance: LocationDeckGLInstance | undefined
  private map: MapLibreGL.Map | null = null
  private globalOverlay: MapboxOverlay | null = null
  private layerSource: LayerResource[] = []
  private previousDevices: Device[] = []
  private devices: Device[] = []
  private mapZoom: number = 0
  private hasVisibleBefore: boolean = false
  private emitter: EventEmitter = new EventEmitter()
  private _deviceSelected: string = ''
  private ungroupedDeviceIds: string[] = []
  private initialized = false

  private theme: 'dark' | 'light' = 'dark'

  private constructor() {}

  static getInstance() {
    if (!LocationDeckGLInstance.instance) {
      LocationDeckGLInstance.instance = new LocationDeckGLInstance()
    }
    return LocationDeckGLInstance.instance
  }

  private _handleMapMove = () => {
    if (!this.map || !this.hasVisibleBefore) return
    const zoom = this.map.getZoom()

    if (zoom === this.mapZoom) return

    this.mapZoom = zoom

    this._buildLayer()
  }

  on(event: string, handler: (...args: any[]) => void) {
    this.emitter.on(event, handler)
  }

  off(event: string, handler: (...args: any[]) => void) {
    this.emitter.off(event, handler)
  }

  private _getPixelConstantScale() {
    const deck = (this.globalOverlay as any)?._deck

    if (deck && deck.viewManager) {
      const viewport = deck.getViewports()[0]

      if (!viewport) return 1

      const metersPerPixel = viewport.metersPerPixel

      return 16 * metersPerPixel
    }

    return 1
  }

  private _getPixelConstantRadius(pixelSize: number) {
    const deck = (this.globalOverlay as any)?._deck

    if (!deck) return pixelSize

    const viewport = deck.getViewports()[0]
    if (!viewport) return pixelSize

    const metersPerPixel = viewport.metersPerPixel

    return pixelSize * metersPerPixel
  }

  private _build3DOutlineLayer() {
    const baseRadius = this._getPixelConstantRadius(27)

    const PERIOD = 1.2

    const phase = (pulseController.time % PERIOD) / PERIOD
    const radiusFactor = 1 + phase * 0.5
    const alpha = Math.exp(-3 * phase)

    const locationDeckGLPulseLayer = new ScatterplotLayer<LayerResource>({
      id: LAYER_IDS.LOCATION_OUTLINE_PULSE,
      data: this.layerSource,

      getPosition: (d) => [d.position[0], d.position[1], 0],

      getRadius: (d) => {
        if (!this.ungroupedDeviceIds.includes(d.id)) return 0
        if (d.id !== this._deviceSelected) return baseRadius

        return baseRadius * radiusFactor
      },

      getFillColor: (d) => {
        if (!this.ungroupedDeviceIds.includes(d.id)) return [255, 255, 255, 0]

        if (d.id !== this._deviceSelected) return [121, 88, 255, 100]

        // const phase = (pulseController.time % PERIOD) / PERIOD

        return [121, 88, 255, Math.floor(160 * alpha)]
      },

      radiusUnits: 'meters',
      stroked: false,
      filled: true,
      pickable: false,

      transitions: {
        getPosition: { duration: 300, easing: linear },
      },

      updateTriggers: {
        getPosition: isEqual(this.devices, this.previousDevices) ? false : true,

        getRadius: pulseController.time,
        getFillColor: pulseController.time,
      },

      parameters: {
        depthTest: false,
      } as any,
    })

    const alreadyHasPulseLayer = !!globalDeckGLInstance.getLayers(
      LAYER_IDS.LOCATION_OUTLINE_PULSE
    )

    if (alreadyHasPulseLayer) {
      globalDeckGLInstance.updateLayer(locationDeckGLPulseLayer)
    } else {
      globalDeckGLInstance.appendLayer(locationDeckGLPulseLayer)
    }
  }

  private _zoomFollowDevice() {
    if (!this.map || !this._deviceSelected) return

    const prevCheckpoint = this.previousDevices.find(
      (device) => device.id === this._deviceSelected
    )?.deviceProperties?.latest_checkpoint_arr

    const currentCheckpoint = this.devices.find(
      (device) => device.id === this._deviceSelected
    )?.deviceProperties?.latest_checkpoint_arr

    if (isEqual(prevCheckpoint, currentCheckpoint)) return

    this.map.easeTo({
      center: currentCheckpoint,
      zoom: 18,
      duration: 500,
      pitch: MAP_PITCH['3d'],
    })
  }

  private _buildLayer() {
    const layerResource: LayerResource[] = this.devices.map((deviceData) => {
      const coordinates = deviceData.deviceProperties
        ?.latest_checkpoint_arr ?? [0, 0]

      const direction = deviceData.deviceProperties?.direction ?? 0
      return {
        id: deviceData.id,
        position: coordinates,
        direction,
      }
    })

    this.layerSource = layerResource

    const locationDeckGLLayer = new ScenegraphLayer<LayerResource>({
      id: LAYER_IDS.LOCATION_DECKGL_LAYER,
      data: layerResource,
      getPosition: (d) => [d.position[0], d.position[1], 0],

      getColor: (d) => {
        const isVisible = this.ungroupedDeviceIds.includes(d.id)

        return isVisible ? [255, 255, 255, 255] : [255, 255, 255, 0]
      },
      getOrientation: () => [0, 0, 0],

      sizeScale: this._getPixelConstantScale(),
      pickable: true,
      scenegraph: modelCache[this.theme],
      transitions: {
        getPosition: { duration: 300, easing: linear },
      },

      onClick: ({ object }) => {
        if (!this.ungroupedDeviceIds.includes(object.id)) return

        this.emitter.emit('location-device-selected', {
          deviceId: object.id,
          deviceData: this.devices.find((device) => device.id === object.id),
        })
      },

      updateTriggers: {
        getPosition: !isEqual(this.devices, this.previousDevices),
      },

      parameters: {
        blend: true,
      } as any,
    })

    this._build3DOutlineLayer()

    const alreadyHasLayer = !!globalDeckGLInstance.getLayers(
      LAYER_IDS.LOCATION_DECKGL_LAYER
    )

    if (alreadyHasLayer) {
      globalDeckGLInstance.updateLayer(locationDeckGLLayer)
    } else {
      globalDeckGLInstance.appendLayer(locationDeckGLLayer)
    }
  }

  init(map: MapLibreGL.Map) {
    if (!map || this.globalOverlay || this.map) return

    this.globalOverlay = globalDeckGLInstance.getGlobalOverlay()
    this.map = map
    map.on('move', this._handleMapMove)
  }

  async syncDevices(devices: Device[], allUngroupedDeviceIds: string[]) {
    if (!this.map || !this.globalOverlay) return

    const devicesIds = devices.map((device) => device.deviceId)

    const ungroupedDeviceIds = allUngroupedDeviceIds.filter((id) =>
      devicesIds.includes(id)
    )

    if (!this.initialized && !ungroupedDeviceIds.length) return

    this.ungroupedDeviceIds = ungroupedDeviceIds
    this.hasVisibleBefore = !!ungroupedDeviceIds.length

    this.previousDevices = this.devices
    this.devices = devices

    this._buildLayer()
    this._zoomFollowDevice()

    const isLocationDevice = devicesIds.includes(this._deviceSelected)

    if (
      isLocationDevice &&
      this._deviceSelected &&
      !this.ungroupedDeviceIds.includes(this._deviceSelected)
    ) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('unfocus_devices', {}))
      }
    }

    this.initialized = true
  }

  focusDevice(deviceId: string) {
    this.clearFocus()

    this._deviceSelected = deviceId

    const device = this.devices.find((device) => device.id === deviceId)
    if (!this.map || !deviceId || !device) return

    pulseController.start(() => {
      this._build3DOutlineLayer()
    })
  }

  async syncTheme(theme: 'dark' | 'light') {
    this.theme = theme

    await preloadModel(theme)
    if (this.hasVisibleBefore) {
      this._buildLayer()
    }
  }

  clearFocus() {
    pulseController.stop()
  }
}
