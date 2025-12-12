import { Device } from '@/stores/device-store'
import { MapboxOverlay } from '@deck.gl/mapbox'
import * as turf from '@turf/turf'
import { ColumnLayer, PolygonLayer } from 'deck.gl'
import { easeOut } from 'popmotion'
import {
  appendLayerForGlobalOverlay,
  LAYER_IDS,
  removeLayersFromGlobalOverlay,
} from './global-overlay-instance'

const DESTROY_LAYERS_INTERVAL = 60000 // 60 seconds

type WaterLevelDataType = {
  location: [number, number]
  waterLevel: number
  color: [number, number, number]
}

class WaterLevelInstance {
  private static instance: WaterLevelInstance | undefined
  private isInitialized = false
  private devices: Record<string, Device> = {}
  private map: mapboxgl.Map | null = null

  private type: 'visible' | 'hidden' = 'visible'
  private destroyTimer: NodeJS.Timeout | null = null
  private isHasVisibleBefore = false

  private globalOverlay: MapboxOverlay | null = null

  private constructor() {}

  static getInstance() {
    if (!WaterLevelInstance.instance) {
      WaterLevelInstance.instance = new WaterLevelInstance()
    }
    return WaterLevelInstance.instance
  }

  private _getLevelColor = (waterLevel: number) => {
    const waterLevelMeter = waterLevel / 100

    if (waterLevelMeter > 0 && waterLevelMeter < 2)
      return {
        polygon: [1, 202, 148, 80],
        column: [1, 202, 148, 220],
      }

    if (waterLevelMeter >= 2 && waterLevelMeter < 5)
      return {
        polygon: [227, 191, 139, 80],
        column: [227, 191, 13, 220],
      }

    return {
      polygon: [246, 79, 82, 50],
      column: [246, 79, 82, 220],
    }
  }

  //draw or remove polygon based on devices
  private _handlePolygon(
    devices: Device[],
    type: 'visible' | 'hidden' = 'visible'
  ) {
    if (!this.globalOverlay) return

    const dataLayers = devices.map((device) => {
      return {
        circle: turf.circle(
          device.deviceProperties?.latest_checkpoint_arr || [0, 0],
          0.03,
          {
            steps: 64,
            units: 'kilometers',
          }
        ),
        color: this._getLevelColor(device.deviceProperties?.water_level || 0)
          .polygon,
      }
    })

    const polygonLayer = new PolygonLayer({
      id: LAYER_IDS.DEVICE_POLYGON_LAYER,
      data: dataLayers,
      getPolygon: (d) => d.circle.geometry.coordinates[0],
      getFillColor: (d: any) => d.color,
      getLineColor: () => [0, 0, 0, 0],
      opacity: type === 'visible' ? 1 : 0,

      transitions: {
        opacity: { duration: 200, easing: easeOut },
      },
      pickable: true,

      parameters: {
        depthTest: true,
      } as any,
    })

    if (this.globalOverlay) {
      const newLayers = appendLayerForGlobalOverlay(
        [polygonLayer],
        this.globalOverlay
      )

      this.globalOverlay.setProps({
        layers: newLayers,
      })
    }
  }

  private _buildWaterLevelLayer(
    devices: Device[],
    type: 'visible' | 'hidden' = 'visible'
  ) {
    if (!this.globalOverlay) return
    const dataLayers = devices.map((device) => {
      return {
        location: device.deviceProperties?.latest_checkpoint_arr || [0, 0],
        waterLevel: device.deviceProperties?.water_level
          ? device.deviceProperties?.water_level
          : 0,
        color: this._getLevelColor(device.deviceProperties?.water_level || 0)
          .column,
      }
    })

    const layer = new ColumnLayer<WaterLevelDataType>({
      id: LAYER_IDS.DEVICE_WATER_LEVEL_LAYER,
      data: dataLayers,
      diskResolution: 300,
      extruded: true,
      radius: 8,
      elevationScale: 0.1,
      getElevation: (d: WaterLevelDataType) => d.waterLevel,
      getPosition: (d: WaterLevelDataType) => d.location,
      getFillColor: (d: WaterLevelDataType) => d.color,
      pickable: true,
      opacity: type === 'visible' ? 1 : 0,
      transitions: {
        opacity: { duration: 200, easing: easeOut },
      },
      parameters: {
        depthTest: true,
      } as any,
    })

    if (this.globalOverlay) {
      const newLayers = appendLayerForGlobalOverlay([layer], this.globalOverlay)

      this.globalOverlay.setProps({
        layers: newLayers,
      })
    }
  }

  private _scheduleLayerDestroy() {
    if (this.destroyTimer) {
      clearTimeout(this.destroyTimer)
    }

    this.destroyTimer = setTimeout(() => {
      if (this.globalOverlay) {
        const idsToRemove = [
          LAYER_IDS.DEVICE_POLYGON_LAYER,
          LAYER_IDS.DEVICE_WATER_LEVEL_LAYER,
        ]

        const newLayers = removeLayersFromGlobalOverlay(
          idsToRemove,
          this.globalOverlay
        )

        console.log({ newLayers })

        this.globalOverlay.setProps({
          layers: newLayers,
        })
      }
    }, DESTROY_LAYERS_INTERVAL)
  }

  init(map: mapboxgl.Map, globalOverlay: MapboxOverlay) {
    if (this.isInitialized) return
    this.map = map

    this.globalOverlay = globalOverlay

    this.isInitialized = true
  }

  syncDevices(
    devices: Record<string, Device>,
    type: 'visible' | 'hidden' = 'visible'
  ) {
    if (!this.isInitialized) return
    this.devices = devices

    if (type === 'visible') {
      this.isHasVisibleBefore = true
    }

    this.buildLayers(type)
  }

  buildLayers(type: 'visible' | 'hidden' = 'visible') {
    if (!this.isHasVisibleBefore) return

    this.type = type

    if (type === 'hidden') {
      this._scheduleLayerDestroy()
    } else {
      if (this.destroyTimer) clearTimeout(this.destroyTimer)
    }

    this._handlePolygon(Object.values(this.devices), type)
    this._buildWaterLevelLayer(Object.values(this.devices), type)
  }
}

export { WaterLevelInstance }
