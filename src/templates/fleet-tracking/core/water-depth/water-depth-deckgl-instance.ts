import { Device } from '@/stores/device-store'
import { WaterDepthLevelName } from '@/utils/water-depth'
import { LayerDataSource } from '@deck.gl/core'
import { MapboxOverlay } from '@deck.gl/mapbox'
import * as turf from '@turf/turf'
import { ColumnLayer, PolygonLayer, ScatterplotLayer, TextLayer } from 'deck.gl'
import MapLibreGL from 'maplibre-gl'
import { easeOut, linear } from 'popmotion'
import { GlobalDeckGLInstance, LAYER_IDS } from '../global-layer-instance'
import EventEmitter from '@/utils/event'

type SyncDeviceFn = {
  devices: Device[]
  type: 'hidden' | 'visible'
}

type PolygonData = {
  circle: any
  color: [number, number, number]
  deviceId: string
}

type MainColumData = {
  location: [number, number]
  waterLevel: number
  waterDepth: number
  color: [number, number, number]
  deviceId: string
}

const WATER_LEVEL_SCALE_FACTOR = 3
const WRAPPER_EXTRA_SIZE = 4
const COLUMN_MAXIMUM_LEVEL = 600
const CLUSTER_ELEVATION = 80 // Above maximum column height to ensure clusters always render on top

const globalDeckGLInstance = GlobalDeckGLInstance.getInstance()

class WaterDepthDeckInstance {
  private static instance: WaterDepthDeckInstance | undefined

  //other instance resource
  private map: MapLibreGL.Map | null = null
  private globalOverlay: MapboxOverlay | null = null
  private emitter: EventEmitter = new EventEmitter()

  //own instance resource
  private type: 'visible' | 'hidden' = 'hidden'
  private devices: Device[] = []
  private hasVisibleBefore = false
  private mapZoom: number = 0
  private focusedDevice: string | null = null
  private hasAnimated = false
  private _pendingClusterLayers: {
    background: any
    text: any
  } | null = null
  private displayedDeviceByLocation: Map<string, string> = new Map()

  private constructor() {}

  static getInstance() {
    if (!WaterDepthDeckInstance.instance) {
      WaterDepthDeckInstance.instance = new WaterDepthDeckInstance()
    }
    return WaterDepthDeckInstance.instance
  }

  private _handleMapMove = () => {
    if (!this.map) return
    const zoom = this.map.getZoom()

    if (zoom === this.mapZoom) return

    this.mapZoom = zoom

    this.hasAnimated = false

    this._buildWaterDepthLayer()
  }

  private getLocationKey = (device: Device): string => {
    const location = device.deviceProperties?.latest_checkpoint_arr || [0, 0]
    return `${location[0]},${location[1]}`
  }

  public getVisibleDevicesAndGroups = (devices: Device[]) => {
    const locationGroups = new Map<
      string,
      {
        location: [number, number]
        count: number
        deviceIds: string[]
        devices: Device[]
        displayedDeviceId: string
      }
    >()

    devices.forEach((device) => {
      const locationKey = this.getLocationKey(device)

      if (locationGroups.has(locationKey)) {
        const group = locationGroups.get(locationKey)!
        group.count += 1
        group.deviceIds.push(device.id)
        group.devices.push(device)
      } else {
        locationGroups.set(locationKey, {
          location: (device.deviceProperties?.latest_checkpoint_arr || [
            0, 0,
          ]) as [number, number],
          count: 1,
          deviceIds: [device.id],
          devices: [device],
          displayedDeviceId: device.id,
        })
      }
    })

    locationGroups.forEach((group, locationKey) => {
      const manuallySelected = this.displayedDeviceByLocation.get(locationKey)
      if (manuallySelected && group.deviceIds.includes(manuallySelected)) {
        group.displayedDeviceId = manuallySelected
      } else {
        const highestWaterLevelDevice = group.devices.reduce((prev, current) =>
          (current.deviceProperties?.water_depth || 0) >
          (prev.deviceProperties?.water_depth || 0)
            ? current
            : prev
        )
        group.displayedDeviceId = highestWaterLevelDevice.id
        this.displayedDeviceByLocation.set(
          locationKey,
          highestWaterLevelDevice.id
        )
      }
    })

    const visibleDevices: Device[] = []
    locationGroups.forEach((group) => {
      const displayedDevice = group.devices.find(
        (d) => d.id === group.displayedDeviceId
      )
      if (displayedDevice) {
        visibleDevices.push(displayedDevice)
      }
    })

    return { locationGroups, visibleDevices }
  }

  public setDisplayedDeviceForLocation(deviceId: string) {
    const device = this.devices.find((d) => d.id === deviceId)
    if (!device) return

    const locationKey = this.getLocationKey(device)
    this.displayedDeviceByLocation.set(locationKey, deviceId)

    this._buildWaterDepthLayer()

    this.emitter.emit('displayed-device-changed', deviceId)
  }

  private _buildPolygonLayer() {
    const { locationGroups, visibleDevices } = this.getVisibleDevicesAndGroups(
      this.devices
    )

    const polygonData = getPolygonData(
      visibleDevices,
      getCircleRadiusByZoom(this.mapZoom)
    )

    const polygonLayer = new PolygonLayer<PolygonData>({
      id: LAYER_IDS.WATER_DEPTH_POLYGON,
      data: polygonData,
      getPolygon: (d) => d.circle.geometry.coordinates[0],
      getFillColor: (d) => d.color,
      getLineColor: () => [0, 0, 0, 0],
      opacity: this.type === 'visible' ? 1 : 0,
      pickable: true,
      filled: true,
      transitions: {
        opacity: { duration: 200, easing: easeOut },
      },
      onClick: ({ object }) => {
        this.emitter.emit('water-depth-device-selected', {
          deviceId: object.deviceId,
          deviceData: this.devices.find(
            (device) => device.id === object.deviceId
          ),
        })
      },
      parameters: {
        depthTest: false,
        depthMask: false,
        blend: true,
      } as any,
    })

    // Create cluster-like layers to show device count at each location
    const deviceCountData = Array.from(locationGroups.values()).filter(
      (group) => group.count > 1
    )

    // Calculate zoom-based sizes for clusters
    const clusterRadius = getClusterRadiusByZoom(this.mapZoom)
    const clusterTextSize = getClusterTextSizeByZoom(this.mapZoom)

    // Cluster background circle layer
    const clusterBackgroundLayer = new ScatterplotLayer({
      id: LAYER_IDS.WATER_DEPTH_COUNT_CLUSTER_BG_LAYER,
      data: deviceCountData,
      getPosition: (d) =>
        [...d.location, CLUSTER_ELEVATION] as [number, number, number],
      getRadius: clusterRadius,
      getFillColor: [0, 0, 0, 230], // #000000 - black background
      getLineColor: [64, 6, 170, 255], // #4006AA - purple border
      getLineWidth: 2,
      stroked: true,
      filled: true,
      radiusUnits: 'pixels',
      lineWidthUnits: 'pixels',
      opacity: this.type === 'visible' ? 1 : 0,
      transitions: {
        opacity: { duration: 200, easing: easeOut },
        getRadius: { duration: 200, easing: easeOut },
      },
      billboard: true,
      antialiasing: true,
      pickable: true,
      parameters: {
        depthTest: false, // Disable depth testing to always render on top
        depthMask: false, // Don't write to depth buffer
      } as any,
      onClick: ({ object, x, y }) => {
        if (object) {
          this.emitter.emit('cluster-clicked', {
            deviceIds: object.deviceIds,
            location: object.location,
            count: object.count,
            screenPosition: { x, y },
          })
        }
      },
    })

    const clusterTextLayer = new TextLayer({
      id: LAYER_IDS.WATER_DEPTH_COUNT_TEXT_LAYER,
      data: deviceCountData,
      getPosition: (d) =>
        [...d.location, CLUSTER_ELEVATION] as [number, number, number],
      getText: (d) => `+${d.count - 1}`,
      getSize: clusterTextSize,
      getColor: [255, 255, 255, 255],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      fontFamily: 'Inter, Arial, sans-serif',
      fontWeight: 'bold',
      opacity: this.type === 'visible' ? 1 : 0,
      transitions: {
        opacity: { duration: 200, easing: easeOut },
        getSize: { duration: 200, easing: easeOut },
      },
      billboard: true,
      pickable: true,
      parameters: {
        depthTest: false, // Disable depth testing to always render on top
        depthMask: false, // Don't write to depth buffer
      } as any,
      onClick: ({ object, x, y }) => {
        if (object) {
          this.emitter.emit('cluster-clicked', {
            deviceIds: object.deviceIds,
            location: object.location,
            count: object.count,
            screenPosition: { x, y },
          })
        }
      },
    })

    const alreadyHasPolygonLayer = !!globalDeckGLInstance.getLayers(
      LAYER_IDS.WATER_DEPTH_POLYGON
    )

    if (alreadyHasPolygonLayer) {
      globalDeckGLInstance.updateLayer(polygonLayer)
    } else {
      globalDeckGLInstance.appendLayer(polygonLayer)
    }
    this._pendingClusterLayers = {
      background: clusterBackgroundLayer,
      text: clusterTextLayer,
    }
  }

  private _buildMainWaterDepthColumn = () => {
    const { visibleDevices } = this.getVisibleDevicesAndGroups(this.devices)

    const dataLayer: LayerDataSource<MainColumData> = visibleDevices.map(
      (device) => {
        const waterDepth = device.deviceProperties?.water_depth
          ? device.deviceProperties?.water_depth
          : 0

        return {
          waterLevel: waterDepth * WATER_LEVEL_SCALE_FACTOR,
          waterDepth: waterDepth,
          color: getLevelColor(
            device.deviceProperties?.water_level_name || 'safe'
          ).column,
          deviceId: device.id,
          location: device.deviceProperties?.latest_checkpoint_arr || [0, 0],
        }
      }
    )

    const radiusByZoom = getColumnRadiusByZoom(this.mapZoom)
    const elevationScaleByZoom = getColumnElevationScaleByZoom(this.mapZoom)

    const mainColumLayer = new ColumnLayer<MainColumData>({
      data: dataLayer,
      id: LAYER_IDS.WATER_DEPTH_COLUMN,
      extruded: true,
      radius: radiusByZoom,
      diskResolution: 8,
      elevationScale: elevationScaleByZoom,
      getElevation: (d) => d.waterLevel,
      getPosition: (d) => d.location,
      getFillColor: (d) => d.color,
      opacity: this.type === 'visible' ? 1 : 0,
      transitions: {
        opacity: { duration: 200, easing: easeOut },
        ...(this.hasAnimated && {
          getElevation: {
            duration: 500,
            easing: linear,
          },
        }),
      },

      parameters: {
        depthTest: true,
        depthMask: true,
      } as any,
    })

    const alreadyHasLayer = !!globalDeckGLInstance.getLayers(
      LAYER_IDS.WATER_DEPTH_COLUMN
    )

    if (alreadyHasLayer) {
      globalDeckGLInstance.updateLayer(mainColumLayer)
    } else {
      globalDeckGLInstance.appendLayer(mainColumLayer)
    }
  }

  private _buildWaterDepthWrapper() {
    const { visibleDevices } = this.getVisibleDevicesAndGroups(this.devices)

    const dataLayer: LayerDataSource<MainColumData> = visibleDevices.map(
      (device) => {
        const isSelected = device.id === this.focusedDevice

        const waterDepth = device.deviceProperties?.water_depth
          ? device.deviceProperties?.water_depth
          : 0

        const color = getLevelColor(
          device.deviceProperties?.water_level_name || 'safe'
        ).column

        return {
          waterLevel: waterDepth * WATER_LEVEL_SCALE_FACTOR,
          waterDepth: waterDepth,
          color: isSelected
            ? [color[0], color[1], color[2], 50]
            : [255, 255, 255, 70],
          deviceId: device.id,
          location: device.deviceProperties?.latest_checkpoint_arr || [0, 0],
        }
      }
    )

    const radiusByZoom = getColumnRadiusByZoom(this.mapZoom)
    const elevationScaleByZoom = getColumnElevationScaleByZoom(this.mapZoom)

    const wrapperLayer = new ColumnLayer<MainColumData>({
      data: dataLayer,
      id: LAYER_IDS.WATER_DEPTH_COLUMN_WRAPPER,
      extruded: true,
      radius: radiusByZoom + WRAPPER_EXTRA_SIZE,
      diskResolution: 8,
      elevationScale: elevationScaleByZoom,
      getElevation: () => COLUMN_MAXIMUM_LEVEL,
      getPosition: (d) => d.location,
      getFillColor: (d) => d.color,
      pickable: true,
      opacity: this.type === 'visible' ? 1 : 0,
      transitions: {
        opacity: { duration: 200, easing: easeOut },
      },

      onClick: ({ object }) => {
        this.emitter.emit('water-depth-device-selected', {
          deviceId: object.deviceId,
          deviceData: this.devices.find(
            (device) => device.id === object.deviceId
          ),
        })
      },

      parameters: {
        depthTest: true,
        depthMask: false,
        blend: true,
      } as any,
    })

    const alreadyHasLayer = !!globalDeckGLInstance.getLayers(
      LAYER_IDS.WATER_DEPTH_COLUMN_WRAPPER
    )
    if (alreadyHasLayer) {
      globalDeckGLInstance.updateLayer(wrapperLayer)
    } else {
      globalDeckGLInstance.appendLayer(wrapperLayer)
    }
  }

  private _buildWaterDepthLayer() {
    if (!this.hasVisibleBefore) return

    this._buildPolygonLayer()
    this._buildWaterDepthWrapper()
    this._buildMainWaterDepthColumn()

    // Add cluster layers after water depth layers to ensure they render on top
    if (this._pendingClusterLayers) {
      const alreadyHasClusterBgLayer = !!globalDeckGLInstance.getLayers(
        LAYER_IDS.WATER_DEPTH_COUNT_CLUSTER_BG_LAYER
      )
      const alreadyHasClusterTextLayer = !!globalDeckGLInstance.getLayers(
        LAYER_IDS.WATER_DEPTH_COUNT_TEXT_LAYER
      )

      if (alreadyHasClusterBgLayer) {
        globalDeckGLInstance.updateLayer(this._pendingClusterLayers.background)
      } else {
        globalDeckGLInstance.appendLayer(this._pendingClusterLayers.background)
      }

      if (alreadyHasClusterTextLayer) {
        globalDeckGLInstance.updateLayer(this._pendingClusterLayers.text)
      } else {
        globalDeckGLInstance.appendLayer(this._pendingClusterLayers.text)
      }

      this._pendingClusterLayers = null
    }
  }

  on(event: string, handler: (...args: any[]) => void) {
    this.emitter.on(event, handler)
  }

  off(event: string, handler: (...args: any[]) => void) {
    this.emitter.off(event, handler)
  }

  public init(map: MapLibreGL.Map) {
    if (!map || this.globalOverlay || this.map) return

    this.globalOverlay = globalDeckGLInstance.getGlobalOverlay()
    this.map = map
    this.map.on('zoom', this._handleMapMove)
  }

  public syncDevice({ devices, type }: SyncDeviceFn) {
    if (!this.map || !this.globalOverlay) return

    if (!this.hasVisibleBefore) {
      this.hasVisibleBefore = type === 'visible'
    }

    this.type = type

    this.devices = devices

    this.hasAnimated = true

    this._buildWaterDepthLayer()
  }

  public onDeviceSelectChanged = (deviceId: string) => {
    this.focusedDevice = deviceId
    this._buildWaterDepthWrapper()
  }
}

const getLevelColor = (
  waterLevelName: 'safe' | 'caution' | 'warning' | 'critical'
) => {
  if (waterLevelName === 'safe')
    return { polygon: [1, 202, 148, 80], column: [1, 202, 148, 220] }

  if (waterLevelName === 'caution')
    return { polygon: [227, 191, 139, 80], column: [227, 191, 13, 220] }

  if (waterLevelName === 'warning')
    return { polygon: [231, 137, 48, 50], column: [231, 137, 48, 220] }

  return { polygon: [246, 79, 82, 50], column: [246, 79, 82, 220] }
}

const getCircleRadiusByZoom = (zoom: number) => {
  const minZoom = 9
  const maxZoom = 17

  const minRadius = 0.03
  const maxRadius = 0.4

  const tRaw =
    1 - Math.max(0, Math.min(1, (zoom - minZoom) / (maxZoom - minZoom)))

  const t = Math.pow(tRaw, 1.8)

  return minRadius + t * (maxRadius - minRadius)
}

const getColumnRadiusByZoom = (zoom: number) => {
  const minZoom = 9
  const maxZoom = 17

  const minRadius = 12
  const maxRadius = 200

  const tRaw =
    1 - Math.max(0, Math.min(1, (zoom - minZoom) / (maxZoom - minZoom)))

  const t = Math.pow(tRaw, 1.8)

  return minRadius + t * (maxRadius - minRadius)
}

const getColumnElevationScaleByZoom = (zoom: number) => {
  const minZoom = 9
  const maxZoom = 17

  const minScale = 0.1
  const maxScale = 0.9

  const tRaw =
    1 - Math.max(0, Math.min(1, (zoom - minZoom) / (maxZoom - minZoom)))

  const t = Math.pow(tRaw, 1.6)

  return minScale + t * (maxScale - minScale)
}

const getClusterRadiusByZoom = (zoom: number) => {
  const minZoom = 9
  const maxZoom = 17

  const minRadius = 18 // Smaller when zoomed out
  const maxRadius = 25 // Larger when zoomed in

  const tRaw =
    1 - Math.max(0, Math.min(1, (zoom - minZoom) / (maxZoom - minZoom)))

  const t = Math.pow(tRaw, 1.5)

  return minRadius + t * (maxRadius - minRadius)
}

const getClusterTextSizeByZoom = (zoom: number) => {
  const minZoom = 9
  const maxZoom = 17

  const minSize = 10 // Smaller when zoomed out
  const maxSize = 14 // Larger when zoomed in

  const tRaw =
    1 - Math.max(0, Math.min(1, (zoom - minZoom) / (maxZoom - minZoom)))

  const t = Math.pow(tRaw, 1.5)

  return minSize + t * (maxSize - minSize)
}

const getPolygonData = (
  devices: Device[],
  radiusKm: number
): LayerDataSource<PolygonData> => {
  const polygonData: LayerDataSource<PolygonData> = devices.map((device) => {
    const circle = turf.circle(
      device.deviceProperties?.latest_checkpoint_arr || [0, 0],
      radiusKm,
      {
        steps: 64,
        units: 'kilometers',
      }
    )

    const color = getLevelColor(
      device.deviceProperties?.water_level_name as WaterDepthLevelName
    ).polygon as [number, number, number]

    return {
      circle,
      color,
      deviceId: device.id,
    }
  })
  return polygonData
}

export { WaterDepthDeckInstance }
