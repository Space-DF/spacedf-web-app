import { MapboxOverlay } from '@deck.gl/mapbox'
import MapLibreGL, { IControl } from 'maplibre-gl'

export const LAYER_IDS = {
  LOCATION_DECKGL_LAYER: 'location-deckgl-layer',
  LOCATION_OUTLINE_PULSE: 'location-outline-pulse',
}

export class GlobalDeckGLInstance {
  private static instance: GlobalDeckGLInstance | undefined
  private map: MapLibreGL.Map | null = null
  private globalOverlay: MapboxOverlay | null = null
  private layerMap = new Map<string, any>()

  private constructor() {}

  static getInstance() {
    if (!GlobalDeckGLInstance.instance) {
      GlobalDeckGLInstance.instance = new GlobalDeckGLInstance()
    }
    return GlobalDeckGLInstance.instance
  }

  private _syncLayers() {
    if (!this.globalOverlay) return
    const layers = Array.from(this.layerMap.values())

    this.globalOverlay.setProps({ layers })
  }

  init(map: MapLibreGL.Map) {
    if (!map || this.globalOverlay || this.map) return
    this.map = map

    const globalOverlay = new MapboxOverlay({
      interleaved: true,
      layers: [],
    })

    this.globalOverlay = globalOverlay
    map.addControl(globalOverlay as unknown as IControl)
  }

  getGlobalOverlay() {
    return this.globalOverlay
  }

  getLayers(layerId?: string) {
    if (!layerId) return Array.from(this.layerMap.values())
    return this.layerMap.get(layerId)
  }

  destroyGlobalDeckGLLayer() {
    if (!this.globalOverlay || !this.map) return
    this.globalOverlay.setProps({
      layers: [],
    })
  }

  appendLayer(layer: any) {
    if (!this.globalOverlay) return

    if (!layer.id) {
      throw new Error('Deck.gl layer must have a stable id')
    }

    this.layerMap.set(layer.id, layer)
    this._syncLayers()
  }

  removeLayer(layerId: string) {
    if (!this.globalOverlay) return
    if (!this.layerMap.has(layerId)) return

    this.layerMap.delete(layerId)

    this._syncLayers()
  }

  updateLayer(layer: any) {
    if (!this.globalOverlay) return
    if (!layer.id) return

    if (!this.layerMap.has(layer.id)) {
      console.warn(`Layer ${layer.id} does not exist, append instead`)
    }

    this.layerMap.set(layer.id, layer)
    this._syncLayers()
  }
}
