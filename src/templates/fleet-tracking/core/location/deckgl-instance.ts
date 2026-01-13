import { Device } from '@/stores/device-store'
import EventEmitter from '@/utils/event'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ScatterplotLayer, ScenegraphLayer } from 'deck.gl'
import isEqual from 'fast-deep-equal'
import MapLibreGL from 'maplibre-gl'
import { easeOut, linear } from 'popmotion'
import { GlobalDeckGLInstance, LAYER_IDS } from '../global-layer-instance'
import { pulseController } from '../pulse-controller'
import { MAP_PITCH } from '../../constant'

type LayerResource = {
  id: string
  position: [number, number]
  direction: number
}

const globalDeckGLInstance = GlobalDeckGLInstance.getInstance()
export class LocationDeckGLInstance {
  private static instance: LocationDeckGLInstance | undefined
  private map: MapLibreGL.Map | null = null
  private globalOverlay: MapboxOverlay | null = null
  private layerSource: LayerResource[] = []
  private previousDevices: Device[] = []
  private devices: Device[] = []
  private type: 'visible' | 'hidden' = 'hidden'
  private mapZoom: number = 0
  private hasVisibleBefore: boolean = false
  private emitter: EventEmitter = new EventEmitter()
  private _pulseValue: number = 0
  private _deviceSelected: string = ''

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

  private _build3DOutlineLayer() {
    const baseRadius = this._getScaleByZoom(this.mapZoom) * 1.5

    const PERIOD = 1.2

    const phase = (pulseController.time % PERIOD) / PERIOD
    const radiusFactor = 1 + phase * 0.5
    const alpha = Math.exp(-3 * phase)

    const locationDeckGLPulseLayer = new ScatterplotLayer<LayerResource>({
      id: LAYER_IDS.LOCATION_OUTLINE_PULSE,
      data: this.layerSource,

      getPosition: (d) => [d.position[0], d.position[1], 4],

      getRadius: (d) => {
        if (d.id !== this._deviceSelected) return baseRadius

        // const phase = (pulseController.time % PERIOD) / PERIOD

        return baseRadius * radiusFactor
      },

      getFillColor: (d) => {
        if (d.id !== this._deviceSelected) return [121, 88, 255, 100]

        // const phase = (pulseController.time % PERIOD) / PERIOD

        return [121, 88, 255, Math.floor(140 * alpha)]
      },

      radiusUnits: 'meters',
      stroked: false,
      filled: true,
      pickable: false,

      opacity: this.type === 'visible' ? 1 : 0,

      transitions: {
        opacity: { duration: 300, easing: easeOut },
        getPosition: { duration: 300, easing: linear },
      },

      updateTriggers: {
        opacity: this.type,
        getPosition: isEqual(this.devices, this.previousDevices) ? false : true,

        getRadius: pulseController.time,
        getFillColor: pulseController.time,
      },

      parameters: {
        depthTest: false,
        depthMask: false,
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
      getPosition: (d) => [d.position[0], d.position[1], 5],
      getOrientation: (d) => [0, -d.direction, 0],
      opacity: this.type === 'visible' ? 1 : 0,
      sizeScale: this._getScaleByZoom(this.mapZoom),
      pickable: true,
      scenegraph:
        'https://d33et8skld5wvq.cloudfront.net/glbs/Pointer-SpaceDF.glb',
      transitions: {
        opacity: { duration: 300, easing: easeOut },
        getPosition: { duration: 300, easing: linear },
        getOrientation: { duration: 300, easing: easeOut },
      },

      onClick: ({ object }) => {
        this.emitter.emit('location-device-selected', {
          deviceId: object.id,
          deviceData: this.devices.find((device) => device.id === object.id),
        })
      },

      updateTriggers: {
        opacity: this.type,
        getPosition: isEqual(this.devices, this.previousDevices) ? false : true,
        getOrientation: this.devices.map(
          (d) => d.deviceProperties?.direction ?? 0
        ),
      },
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

  syncDevices(devices: Device[], type: 'visible' | 'hidden') {
    if (!this.map || !this.globalOverlay) return
    this.type = type
    this.hasVisibleBefore = type === 'visible'

    this.previousDevices = this.devices
    this.devices = devices

    this._buildLayer()
    this._zoomFollowDevice()
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

  clearFocus() {
    pulseController.stop()
  }
}
