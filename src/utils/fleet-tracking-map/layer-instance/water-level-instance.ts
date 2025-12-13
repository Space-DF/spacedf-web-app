import { Device } from '@/stores/device-store'
import { MapboxOverlay } from '@deck.gl/mapbox'
import * as turf from '@turf/turf'
import { ColumnLayer, PolygonLayer } from 'deck.gl'
import { easeOut, linear, animate } from 'popmotion'
import {
  appendLayerForGlobalOverlay,
  LAYER_IDS,
  removeLayersFromGlobalOverlay,
} from './global-overlay-instance'
import EventEmitter from '@/utils/event'
import { RainSpecification } from 'mapbox-gl'

const DESTROY_LAYERS_INTERVAL = 60000 // 60 seconds

type WaterLevelDataType = {
  location: [number, number]
  waterLevel: number
  color: [number, number, number]
  deviceId: string
  elevationForDraw: number
}

const WATER_LEVEL_THRESHOLDS = {
  safe: 0.25,
  warning: 1,
  danger: 1.5,
}

const WATER_DISPLAY_MULTIPLIER = 3

class WaterLevelInstance {
  private static instance: WaterLevelInstance | undefined
  private isInitialized = false
  private devices: Record<string, Device> = {}
  private map: mapboxgl.Map | null = null

  private type: 'visible' | 'hidden' = 'visible'
  private destroyTimer: NodeJS.Timeout | null = null
  private isHasVisibleBefore = false
  private rainLayer: RainSpecification | null = null

  private selectedWaterDeviceId: string | null = null
  private selectedWaterDeviceProgress = 1
  private animateState: 'idle' | 'animating' = 'idle'
  private selectedWaterDeviceAnimation: any = null

  private globalOverlay: MapboxOverlay | null = null
  private emitter = new EventEmitter()

  private constructor() {}

  static getInstance() {
    if (!WaterLevelInstance.instance) {
      WaterLevelInstance.instance = new WaterLevelInstance()
    }
    return WaterLevelInstance.instance
  }

  on(event: string, handler: (...args: any[]) => void) {
    this.emitter.on(event, handler)
  }

  off(event: string, handler: (...args: any[]) => void) {
    this.emitter.off(event, handler)
  }

  private _getWaterLevelName = (waterLevel: number) => {
    const waterLevelMeter = waterLevel / 100

    if (waterLevelMeter > 0 && waterLevelMeter < WATER_LEVEL_THRESHOLDS.safe)
      return 'safe'

    if (
      waterLevelMeter >= WATER_LEVEL_THRESHOLDS.safe &&
      waterLevelMeter <= WATER_LEVEL_THRESHOLDS.warning
    )
      return 'warning'

    return 'danger'
  }

  private _getRainLevel = (
    waterLevelName: 'safe' | 'warning' | 'danger'
  ): [number, number] => {
    if (waterLevelName === 'safe') return [1, 3]
    if (waterLevelName === 'warning') return [3, 5]
    return [2, 18]
  }

  private _getLevelColor = (waterLevelName: 'safe' | 'warning' | 'danger') => {
    if (waterLevelName === 'safe')
      return { polygon: [1, 202, 148, 80], column: [1, 202, 148, 220] }
    if (waterLevelName === 'warning')
      return { polygon: [227, 191, 139, 80], column: [227, 191, 13, 220] }

    return { polygon: [246, 79, 82, 50], column: [246, 79, 82, 220] }
  }

  handleRain = () => {
    if (!this.map) return

    const zoomBasedReveal = (value: number) => {
      return ['interpolate', ['linear'], ['zoom'], 11, 0.0, 13, value]
    }

    this.rainLayer = {
      density: zoomBasedReveal(0.5) as any,
      intensity: 1.0,
      color: '#a8adbc',
      opacity: 0.7,
      vignette: zoomBasedReveal(1.0) as any,
      'vignette-color': '#464646',
      direction: [0, 80],
      'droplet-size': [1, 3],
      'distortion-strength': 0.7,
      'center-thinning': 0, // Rain to be displayed on the whole screen area
    }
    this.map?.setRain(this.rainLayer)
  }

  private _stopAnimation = () => {
    if (this.selectedWaterDeviceAnimation?.stop) {
      this.selectedWaterDeviceAnimation.stop()
      this.animateState = 'idle'
    } else if (this.selectedWaterDeviceAnimation?.cancel) {
      this.selectedWaterDeviceAnimation.cancel()
    }

    this.selectedWaterDeviceProgress = 0
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
        color: this._getLevelColor(
          device.deviceProperties?.water_level_name || 'safe'
        ).polygon,
        deviceId: device.id,
      }
    })

    const polygonLayer = new PolygonLayer({
      id: LAYER_IDS.DEVICE_POLYGON_LAYER,
      data: dataLayers,
      getPolygon: (d) => d.circle.geometry.coordinates[0],
      getFillColor: (d: any) => d.color,
      getLineColor: () => [0, 0, 0, 0],
      opacity: type === 'visible' ? 1 : 0,
      onClick: ({ object }) => {
        this.emitter.emit('water-level-selected', object.deviceId)
      },
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

  private _buildWrapperLayer(devices: Device[]) {
    if (!this.globalOverlay) return

    const dataLayers = devices.map((device) => {
      const isSelected = device.id === this.selectedWaterDeviceId
      const color = this._getLevelColor(
        device.deviceProperties?.water_level_name || 'safe'
      ).column

      return {
        location: device.deviceProperties?.latest_checkpoint_arr || [0, 0],
        waterLevel: device.deviceProperties?.water_depth
          ? device.deviceProperties?.water_depth
          : 0,
        color: isSelected
          ? [color[0], color[1], color[2], 50]
          : [255, 255, 255, 70],
        deviceId: device.id,
      }
    })

    const wrapperLayer = new ColumnLayer<WaterLevelDataType>({
      id: LAYER_IDS.DEVICE_WATER_LEVEL_WRAPPER_LAYER,
      data: dataLayers,
      diskResolution: 300,
      extruded: true,
      radius: 12,
      elevationScale: 0.1,
      getElevation: () => 1500,
      getPosition: (d: WaterLevelDataType) => d.location,
      getFillColor: (d: WaterLevelDataType) => d.color,
      onClick: ({ object }) => {
        this.emitter.emit('water-level-selected', object.deviceId)
      },
      pickable: true,
      opacity: this.type === 'visible' ? 1 : 0,
      transitions: {
        opacity: { duration: 200, easing: easeOut },
      },
    })

    if (this.globalOverlay) {
      const newLayers = appendLayerForGlobalOverlay(
        [wrapperLayer],
        this.globalOverlay
      )

      this.globalOverlay.setProps({
        layers: newLayers,
      })
    }
  }

  private _buildWaterLevelLayer(devices: Device[]) {
    if (!this.globalOverlay) return

    const dataLayers = devices.map((device) => {
      const waterLevel = device.deviceProperties?.water_depth
        ? device.deviceProperties?.water_depth
        : 0

      return {
        location: device.deviceProperties?.latest_checkpoint_arr || [0, 0],
        waterLevel: waterLevel * WATER_DISPLAY_MULTIPLIER,
        color: this._getLevelColor(
          device.deviceProperties?.water_level_name || 'safe'
        ).column,
        deviceId: device.id,
      }
    })

    const layer = new ColumnLayer<WaterLevelDataType>({
      id: LAYER_IDS.DEVICE_WATER_LEVEL_LAYER,
      data: dataLayers,
      diskResolution: 300,
      extruded: true,
      radius: 8,
      elevationScale: 0.1,
      getElevation: (d: WaterLevelDataType) => {
        if (d.deviceId === this.selectedWaterDeviceId) {
          return d.waterLevel * this.selectedWaterDeviceProgress
        }
        return d.waterLevel
      },
      getPosition: (d: WaterLevelDataType) => d.location,
      getFillColor: (d: WaterLevelDataType) => d.color,
      pickable: true,
      opacity: this.type === 'visible' ? 1 : 0,
      onClick: ({ object }) => {
        this.emitter.emit('water-level-selected', object.deviceId)
      },
      transitions: {
        opacity: { duration: 200, easing: easeOut },
        ...(this.animateState === 'idle' && {
          getElevation: {
            duration: 2000,
            easing: linear,
            enter: () => 0,
          },
        }),
      },

      parameters: {
        depthTest: true,
      } as any,
    })

    if (this.globalOverlay) {
      const prevLayers = (this.globalOverlay as any)._props.layers
      const baseLayers = prevLayers.filter(
        (l: any) => l.id !== LAYER_IDS.DEVICE_WATER_LEVEL_LAYER
      )

      const mergedLayers = [layer, ...baseLayers]
      this.globalOverlay.setProps({ layers: mergedLayers })
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
    this.devices = Object.fromEntries(
      Object.entries(devices).map(([key, device]) => [
        key,
        {
          ...device,
          deviceProperties: {
            ...device.deviceProperties,
            water_level_name: this._getWaterLevelName(
              device.deviceProperties?.water_depth || 0
            ),
          },
        } as Device,
      ])
    )

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
    this._buildWaterLevelLayer(Object.values(this.devices))
    this._buildWrapperLayer(Object.values(this.devices))
  }

  handleWaterLevelSelected(selectedId: string) {
    if (!this.map) return

    const deviceData = this.devices?.[selectedId]

    if (deviceData) {
      this.map.flyTo({
        center: deviceData.deviceProperties?.latest_checkpoint_arr as [
          number,
          number,
        ],
        zoom: 18,
        duration: 500,
        essential: true,
        pitch: 70,
      })

      this._stopAnimation()

      this.selectedWaterDeviceId = selectedId

      this._buildWrapperLayer(Object.values(this.devices))

      this.animateState = 'animating'

      this.selectedWaterDeviceAnimation = animate({
        from: 0,
        to: 1,
        duration: 2000,
        ease: linear,
        onUpdate: (latest: number) => {
          this.selectedWaterDeviceProgress = latest
          this._buildWaterLevelLayer(Object.values(this.devices))
        },
        onComplete: () => {
          this.animateState = 'idle'
          this.selectedWaterDeviceProgress = 1
          this.selectedWaterDeviceAnimation = null
        },
      })
    } else {
      this.selectedWaterDeviceId = null

      this._stopAnimation()
      this._buildWaterLevelLayer(Object.values(this.devices))
      this._buildWrapperLayer(Object.values(this.devices))
    }
  }
}

export { WaterLevelInstance }
