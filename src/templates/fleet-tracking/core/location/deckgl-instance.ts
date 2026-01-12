import { Device } from '@/stores/device-store'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ScenegraphLayer } from 'deck.gl'
import MapLibreGL from 'maplibre-gl'
import { easeOut, linear } from 'popmotion'
import { GlobalDeckGLInstance, LAYER_IDS } from '../global-layer-instance'
import isEqual from 'fast-deep-equal'

type LayerResource = {
  id: string
  position: [number, number]
}

const globalDeckGLInstance = GlobalDeckGLInstance.getInstance()
export class LocationDeckGLInstance {
  private static instance: LocationDeckGLInstance | undefined
  private map: MapLibreGL.Map | null = null
  private globalOverlay: MapboxOverlay | null = null

  private previousDevices: Device[] = []
  private devices: Device[] = []
  private type: 'visible' | 'hidden' = 'hidden'
  private mapZoom: number = 0
  private hasVisibleBefore: boolean = false

  private constructor() {}

  static getInstance() {
    if (!LocationDeckGLInstance.instance) {
      LocationDeckGLInstance.instance = new LocationDeckGLInstance()
    }
    return LocationDeckGLInstance.instance
  }

  _handleMapMove = () => {
    if (!this.map || !this.hasVisibleBefore) return
    const zoom = this.map.getZoom()

    if (zoom === this.mapZoom) return

    this.mapZoom = zoom

    this._buildLayer()
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

  private _buildLayer() {
    const layerResource: LayerResource[] = this.devices.map((deviceData) => {
      const coordinates = deviceData.deviceProperties
        ?.latest_checkpoint_arr ?? [0, 0]

      return {
        id: deviceData.id,
        position: coordinates,
      }
    })

    const locationDeckGLLayer = new ScenegraphLayer<LayerResource>({
      id: LAYER_IDS.LOCATION_DECKGL_LAYER,
      data: layerResource,
      getPosition: (d) => [d.position[0], d.position[1], 5],
      getOrientation: () => [0, 0, 0],
      opacity: this.type === 'visible' ? 1 : 0,
      sizeScale: this._getScaleByZoom(this.mapZoom),
      pickable: true,
      scenegraph: '/3d-model/Pointer-SpaceDF.glb',
      transitions: {
        opacity: { duration: 300, easing: easeOut },
        getPosition: { duration: 300, easing: linear },
      },

      updateTriggers: {
        opacity: this.type,
        getPosition: isEqual(this.devices, this.previousDevices) ? false : true,
      },
    })

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
  }
}
