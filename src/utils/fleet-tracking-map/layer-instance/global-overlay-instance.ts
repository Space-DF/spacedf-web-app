import { MapboxOverlay } from '@deck.gl/mapbox'
import { PickingInfo } from 'deck.gl'

const LAYER_IDS = {
  DEVICE_LAYER: 'device-layer',
  DEVICE_WATER_LEVEL_LAYER: 'device-water-level-layer',
  DEVICE_POLYGON_LAYER: 'device-polygon-layer',
  DEVICE_WATER_LEVEL_WRAPPER_LAYER: 'device-water-level-wrapper-layer',
}

class GlobalOverlayInstance {
  private static instance: GlobalOverlayInstance | undefined

  private isInitialized = false
  private map: mapboxgl.Map | null = null
  private overlay: MapboxOverlay | null = null
  private layers: any[] = []

  private constructor() {}

  static getInstance() {
    if (!GlobalOverlayInstance.instance) {
      GlobalOverlayInstance.instance = new GlobalOverlayInstance()
    }
    return GlobalOverlayInstance.instance
  }

  init(map: mapboxgl.Map) {
    if (this.isInitialized) return this.overlay
    this.map = map

    const globalOverlay = new MapboxOverlay({
      id: 'global-overlay',
      interleaved: true,
      layers: [],
      getTooltip: ({ object, layer }: PickingInfo<any>): any => {
        const isWaterLevelLayer =
          layer?.id === LAYER_IDS.DEVICE_WATER_LEVEL_WRAPPER_LAYER
        if (isWaterLevelLayer && object) {
          return `Water Level: ${object.waterLevel / 100}m`
        }
        return undefined
      },
    })

    map.addControl(globalOverlay)

    this.overlay = globalOverlay

    this.isInitialized = true

    return globalOverlay
  }

  destroy() {
    if (!this.overlay) return
    this.overlay.setProps({
      layers: [],
    })
    this.layers = []
  }

  getOverlay() {
    return this.overlay
  }
}

const appendLayerForGlobalOverlay = (
  layers: any[],
  overlay?: MapboxOverlay
) => {
  if (!overlay) return []

  const prevLayers = (overlay as any)._props.layers
  const layersIds = layers.map((layer: any) => layer?.id || '')
  const prevLayersToKeep = prevLayers?.filter(
    (layer: any) => !layersIds.includes(layer?.id || '')
  )

  return [...(prevLayersToKeep || []), ...layers]
}

const removeLayersFromGlobalOverlay = (
  layerIds: string[],
  overlay?: MapboxOverlay
) => {
  if (!overlay) return []

  const prevLayers = (overlay as any)._props.layers

  const prevLayersToKeep = prevLayers?.filter(
    (layer: any) => !layerIds.includes(layer?.id || '')
  )

  return [...(prevLayersToKeep || [])]
}
export {
  GlobalOverlayInstance,
  appendLayerForGlobalOverlay,
  removeLayersFromGlobalOverlay,
  LAYER_IDS,
}
