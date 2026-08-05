import {
  findWaterLevelSetting,
  useMonitoringSettingStore,
} from '@/stores/monitoring-setting-store'
import { Device } from '@/stores/device-store'
import { MonitoringArea } from '@/types/device'
import { easeOut } from '@/utils/common'
import EventEmitter from '@/utils/event'
import {
  areaCenter,
  areaToCells,
  cellCenter,
  cellResolution,
  H3_RESOLUTION,
  inferResolution,
  pointToCell,
} from '@/utils/h3'
import {
  getWaterDepthLevelColors,
  getWaterDepthLevelName,
  getWaterLevelThresholds,
} from '@/utils/water-depth'
import type { MapboxOverlay } from '@deck.gl/mapbox'
import { ScatterplotLayer, TextLayer } from 'deck.gl'
import { type Map as MapLibreGLMap, type MapLayerMouseEvent } from 'maplibre-gl'
import { GlobalDeckGLInstance, LAYER_IDS } from '../global-layer-instance'
import {
  columnHeight,
  removeWaterLevelLayers,
  syncWaterLevelLayers,
  WATER_LEVEL_LAYER_IDS,
  type WaterColumn,
  type WaterZone,
} from './water-level-layers'

type SyncDeviceFn = {
  devices: Device[]
  allUngroupedDeviceIds: string[]
}

type DeviceArea = {
  area: MonitoringArea | null
  resolution: number
  cells: string[]
  center: [number, number] | null
}

type LocationGroup = {
  location: [number, number]
  count: number
  deviceIds: string[]
  devices: Device[]
  displayedDeviceId: string
}

type DeviceGrouping = {
  locationGroups: Map<string, LocationGroup>
  visibleDevices: Device[]
}

const CLUSTER_CLEARANCE_M = 40

/** Full tube depth, so the water reads as half-full at the danger threshold. */
const COLUMN_DEPTH_RANGE_FACTOR = 2

const CM_PER_METRE = 100

const SELECTABLE_LAYERS = [
  WATER_LEVEL_LAYER_IDS.COVERAGE_FILL,
  WATER_LEVEL_LAYER_IDS.COLUMN_GLASS,
  WATER_LEVEL_LAYER_IDS.COLUMN_BASE,
]

const CLUSTER_DECK_LAYER_IDS = [
  LAYER_IDS.WATER_DEPTH_COUNT_CLUSTER_BG_LAYER,
  LAYER_IDS.WATER_DEPTH_COUNT_TEXT_LAYER,
]

const globalDeckGLInstance = GlobalDeckGLInstance.getInstance()

class WaterDepthDeckInstance {
  private static instance: WaterDepthDeckInstance | undefined

  //other instance resource
  private map: MapLibreGLMap | null = null
  private globalOverlay: MapboxOverlay | null = null
  private emitter: EventEmitter = new EventEmitter()

  //own instance resource
  private devices: Device[] = []
  private hasVisibleBefore = false
  private mapZoom: number = 0
  private focusedDevice: string | null = null
  private displayedDeviceByLocation: Map<string, string> = new Map()
  private ungroupedDeviceIds: Set<string> = new Set()
  private areaCache: Map<string, DeviceArea> = new Map()
  private hoveredColumnId: string | null = null
  private waitingForStyle = false
  private unsubscribeSetting: (() => void) | null = null

  private constructor() {}

  static getInstance() {
    if (!WaterDepthDeckInstance.instance) {
      WaterDepthDeckInstance.instance = new WaterDepthDeckInstance()
    }
    return WaterDepthDeckInstance.instance
  }

  private _handleMapZoom = () => {
    if (!this.map) return

    this.mapZoom = this.map.getZoom()
    this._buildClusterLayers()
  }

  private _handleStyleLoad = () => {
    this._syncWaterLevelLayers()
  }

  private _deviceLocation(device: Device): [number, number] | null {
    const [lng, lat] = device.deviceProperties?.latest_checkpoint_arr || [0, 0]
    if (lng || lat) return [lng, lat]

    return this._getDeviceArea(device).center
  }

  private getLocationKey = (device: Device): string => {
    const location = this._deviceLocation(device)
    // A device with nowhere to sit is its own group; a shared fallback key
    // would collapse every unlocated device into one.
    if (!location) return `device:${device.id}`

    return `${location[0]},${location[1]}`
  }

  public getVisibleDevicesAndGroups = (devices: Device[]): DeviceGrouping => {
    const locationGroups = new Map<string, LocationGroup>()

    devices.forEach((device) => {
      const locationKey = this.getLocationKey(device)
      const group = locationGroups.get(locationKey)

      if (group) {
        group.count += 1
        group.deviceIds.push(device.id)
        group.devices.push(device)
        return
      }

      locationGroups.set(locationKey, {
        location: this._deviceLocation(device) ?? [0, 0],
        count: 1,
        deviceIds: [device.id],
        devices: [device],
        displayedDeviceId: device.id,
      })
    })

    const visibleDevices: Device[] = []

    locationGroups.forEach((group, locationKey) => {
      const manuallySelected = this.displayedDeviceByLocation.get(locationKey)
      const displayedDevice =
        (manuallySelected &&
          group.devices.find((device) => device.id === manuallySelected)) ||
        group.devices.reduce((prev, current) =>
          (current.deviceProperties?.water_depth || 0) >
          (prev.deviceProperties?.water_depth || 0)
            ? current
            : prev
        )

      group.displayedDeviceId = displayedDevice.id
      visibleDevices.push(displayedDevice)
    })

    return { locationGroups, visibleDevices }
  }

  private _groupDevices(): DeviceGrouping {
    return this.getVisibleDevicesAndGroups(this.devices)
  }

  public setDisplayedDeviceForLocation(deviceId: string) {
    const device = this.devices.find((d) => d.id === deviceId)
    if (!device) return

    const locationKey = this.getLocationKey(device)
    this.displayedDeviceByLocation.set(locationKey, deviceId)

    this._buildWaterDepthLayer()

    this.emitter.emit('displayed-device-changed', deviceId)
  }

  /**
   * `cells` is the union of the hexagons drawn for the device, so it has to be
   * cut back into cells to be rendered as a grid. That is expensive next to the
   * telemetry updates driving a resync, hence the cache on the stored area.
   */
  private _getDeviceArea(device: Device): DeviceArea {
    const area = device.deviceInformation?.cells ?? null
    const cached = this.areaCache.get(device.id)
    if (cached && cached.area === area) return cached

    const cells = areaToCells(
      area,
      area ? inferResolution(area) : H3_RESOLUTION
    )
    const entry: DeviceArea = {
      area,
      // Read back off the cells so the column matches the hexagons on screen,
      // including when an oversized area was coarsened to stay drawable.
      resolution: cells.length ? cellResolution(cells[0]) : H3_RESOLUTION,
      cells,
      center: areaCenter(area),
    }

    this.areaCache.set(device.id, entry)

    return entry
  }

  private _handleStyleIdle = () => {
    this.waitingForStyle = false
    this._syncWaterLevelLayers()
  }

  /** Re-runs the sync once the style settles, collapsing repeated requests. */
  private _deferSync(map: MapLibreGLMap) {
    if (this.waitingForStyle) return

    this.waitingForStyle = true
    map.once('idle', this._handleStyleIdle)
  }

  private _syncWaterLevelLayers(grouping = this._groupDevices()) {
    const map = this.map
    if (!map) return

    // Adding a source mid style swap throws, so wait for the style to settle.
    if (!map.isStyleLoaded()) {
      this._deferSync(map)
      return
    }

    const zones: WaterZone[] = []
    const columns: WaterColumn[] = []

    const setting = findWaterLevelSetting(
      useMonitoringSettingStore.getState().settings
    )
    const thresholds = getWaterLevelThresholds(setting)
    const levelColors = getWaterDepthLevelColors(setting)
    const columnDepthRange = thresholds.warning * COLUMN_DEPTH_RANGE_FACTOR

    grouping.visibleDevices.forEach((device) => {
      // A device folded into a cluster is represented by its badge instead.
      if (!this.ungroupedDeviceIds.has(device.id)) return

      const { resolution, cells } = this._getDeviceArea(device)
      const waterDepth = device.deviceProperties?.water_depth ?? 0
      const depth = waterDepth / CM_PER_METRE
      const color =
        levelColors[getWaterDepthLevelName(waterDepth, thresholds)].primary

      if (cells.length) {
        zones.push({ deviceId: device.id, cells, color })
      }

      const h3 = this._columnCell(device)
      if (!h3) return

      columns.push({
        deviceId: device.id,
        h3,
        resolution,
        color,
        fill: Math.min(Math.max(depth / columnDepthRange, 0), 1),
        depth,
        selected: device.id === this.focusedDevice,
      })
    })

    // A style swap can land between the check above and the write; retrying is
    // cheaper than letting it bubble up and tear the map layer down.
    try {
      syncWaterLevelLayers(map, zones, columns)
    } catch {
      this._deferSync(map)
    }
  }

  private _columnCell(device: Device): string | null {
    const location = this._deviceLocation(device)
    if (!location) return null

    const { resolution } = this._getDeviceArea(device)

    return pointToCell(location[0], location[1], resolution)
  }

  private _badgeAnchor(group: LocationGroup): [number, number, number] {
    const displayed = group.devices.find(
      (device) => device.id === group.displayedDeviceId
    )
    const h3 = displayed && this._columnCell(displayed)
    if (!displayed || !h3) return [...group.location, CLUSTER_CLEARANCE_M]

    const { resolution } = this._getDeviceArea(displayed)

    return [
      ...cellCenter(h3),
      columnHeight(resolution) + CLUSTER_CLEARANCE_M,
    ] as [number, number, number]
  }

  private _buildClusterLayers(grouping = this._groupDevices()) {
    if (!this.hasVisibleBefore || !this.globalOverlay) return

    const deviceCountData = Array.from(grouping.locationGroups.values())
      .filter((group) => group.count > 1)
      .map((group) => ({
        ...group,
        visible: group.deviceIds.every((id) => this.ungroupedDeviceIds.has(id)),
        anchor: this._badgeAnchor(group),
      }))

    const clusterRadius = getClusterRadiusByZoom(this.mapZoom)
    const clusterTextSize = getClusterTextSizeByZoom(this.mapZoom)

    const clusterBackgroundLayer = new ScatterplotLayer({
      id: LAYER_IDS.WATER_DEPTH_COUNT_CLUSTER_BG_LAYER,
      data: deviceCountData,
      getPosition: (d) => d.anchor,
      getRadius: (d) => {
        if (!d.visible) return 0
        return clusterRadius
      },
      getFillColor: (d) => {
        if (!d.visible) return [0, 0, 0, 0]

        return [0, 0, 0, 230]
      },
      getLineColor: (d) => {
        if (!d.visible) return [0, 0, 0, 0]

        return [64, 6, 170, 255]
      },
      getLineWidth: 2,
      stroked: true,
      filled: true,
      radiusUnits: 'pixels',
      lineWidthUnits: 'pixels',
      transitions: {
        getRadius: { duration: 200, easing: easeOut },
      },
      billboard: true,
      antialiasing: true,
      pickable: true,
      parameters: {
        depthTest: false,
        depthMask: false,
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
      getPosition: (d) => d.anchor,
      getText: (d) => `+${d.count - 1}`,
      getSize: (d) => {
        if (!d.visible) return 0
        return clusterTextSize
      },
      getColor: (d) => {
        if (!d.visible) return [0, 0, 0, 0]
        return [255, 255, 255, 255]
      },
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      fontFamily: 'Inter, Arial, sans-serif',
      fontWeight: 'bold',
      billboard: true,
      pickable: true,
      parameters: {
        depthTest: false,
        depthMask: false,
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

    ;[clusterBackgroundLayer, clusterTextLayer].forEach((layer) => {
      if (globalDeckGLInstance.getLayers(layer.id)) {
        globalDeckGLInstance.updateLayer(layer)
      } else {
        globalDeckGLInstance.appendLayer(layer)
      }
    })
  }

  private _buildWaterDepthLayer() {
    const grouping = this._groupDevices()

    this._syncWaterLevelLayers(grouping)
    this._buildClusterLayers(grouping)
  }

  private _emitDeviceSelected = (deviceId?: string) => {
    if (!deviceId) return

    this.emitter.emit('water-depth-device-selected', {
      deviceId,
      deviceData: this.devices.find((device) => device.id === deviceId),
    })
  }

  private _handleLayerClick = (event: MapLayerMouseEvent) => {
    this._emitDeviceSelected(
      event.features?.[0]?.properties?.deviceId as string | undefined
    )
  }

  private _handlePointerEnter = () => {
    if (this.map) this.map.getCanvas().style.cursor = 'pointer'
  }

  private _handlePointerLeave = () => {
    if (this.map) this.map.getCanvas().style.cursor = ''
  }

  private _handleColumnHover = (event: MapLayerMouseEvent) => {
    const properties = event.features?.[0]?.properties
    const deviceId = properties?.deviceId as string | undefined
    const depth = properties?.depth as number | undefined
    if (!deviceId || depth === undefined) return
    if (deviceId === this.hoveredColumnId) return

    this.hoveredColumnId = deviceId
    this.emitter.emit('water-depth-hover', {
      deviceId,
      depth,
      screenPosition: { x: event.point.x, y: event.point.y },
    })
  }

  private _bindLayerInteractions(map: MapLibreGLMap) {
    map.on('click', SELECTABLE_LAYERS, this._handleLayerClick)
    map.on('mouseenter', SELECTABLE_LAYERS, this._handlePointerEnter)
    map.on('mouseleave', SELECTABLE_LAYERS, this._handlePointerLeave)
    map.on(
      'mousemove',
      WATER_LEVEL_LAYER_IDS.COLUMN_GLASS,
      this._handleColumnHover
    )
    map.on('mouseleave', WATER_LEVEL_LAYER_IDS.COLUMN_GLASS, this._clearHover)
  }

  private _unbindLayerInteractions(map: MapLibreGLMap) {
    map.off('click', SELECTABLE_LAYERS, this._handleLayerClick)
    map.off('mouseenter', SELECTABLE_LAYERS, this._handlePointerEnter)
    map.off('mouseleave', SELECTABLE_LAYERS, this._handlePointerLeave)
    map.off(
      'mousemove',
      WATER_LEVEL_LAYER_IDS.COLUMN_GLASS,
      this._handleColumnHover
    )
    map.off('mouseleave', WATER_LEVEL_LAYER_IDS.COLUMN_GLASS, this._clearHover)
  }

  private _clearHover = () => {
    if (!this.hoveredColumnId) return

    this.hoveredColumnId = null
    this.emitter.emit('water-depth-hover', null)
  }

  on(event: string, handler: (...args: any[]) => void) {
    this.emitter.on(event, handler)
  }

  off(event: string, handler: (...args: any[]) => void) {
    this.emitter.off(event, handler)
  }

  public init(map: MapLibreGLMap) {
    if (!map || this.map === map) return
    if (this.map) this.destroy()

    this.globalOverlay = globalDeckGLInstance.getGlobalOverlay()
    this.map = map
    this.mapZoom = map.getZoom()

    this._bindLayerInteractions(map)

    this.map.on('zoom', this._handleMapZoom)
    // A theme switch swaps the style, which drops every custom source.
    this.map.on('style.load', this._handleStyleLoad)

    this.unsubscribeSetting = useMonitoringSettingStore.subscribe(
      (state, previousState) => {
        if (state.settings === previousState.settings) return

        this._buildWaterDepthLayer()
      }
    )
  }

  public syncDevice({ devices, allUngroupedDeviceIds }: SyncDeviceFn) {
    if (!this.map) return

    this.globalOverlay ||= globalDeckGLInstance.getGlobalOverlay()

    const devicesIds = new Set(devices.map((device) => device.deviceId))

    const ungroupedDeviceIds = new Set(
      allUngroupedDeviceIds.filter((id) => devicesIds.has(id))
    )

    if (!this.hasVisibleBefore) {
      this.hasVisibleBefore = !!ungroupedDeviceIds.size
    }

    this.devices = devices
    this.ungroupedDeviceIds = ungroupedDeviceIds

    this._buildWaterDepthLayer()
  }

  public onDeviceSelectChanged = (deviceId: string) => {
    this.focusedDevice = deviceId
    this._syncWaterLevelLayers()
  }

  public destroy() {
    if (!this.map) return

    this.map.off('zoom', this._handleMapZoom)
    this.map.off('style.load', this._handleStyleLoad)
    this.map.off('idle', this._handleStyleIdle)
    this._unbindLayerInteractions(this.map)

    this.unsubscribeSetting?.()
    this.unsubscribeSetting = null

    this._clearHover()

    removeWaterLevelLayers(this.map)

    CLUSTER_DECK_LAYER_IDS.forEach((id) => globalDeckGLInstance.removeLayer(id))

    this.map = null
    this.globalOverlay = null
    this.hasVisibleBefore = false
    this.waitingForStyle = false
    this.focusedDevice = null
    this.devices = []
    this.ungroupedDeviceIds.clear()
    this.displayedDeviceByLocation.clear()
    this.areaCache.clear()
  }
}

const getClusterRadiusByZoom = (zoom: number) => {
  const minZoom = 9
  const maxZoom = 17

  const minRadius = 18
  const maxRadius = 25

  const tRaw =
    1 - Math.max(0, Math.min(1, (zoom - minZoom) / (maxZoom - minZoom)))

  const t = Math.pow(tRaw, 1.5)

  return minRadius + t * (maxRadius - minRadius)
}

const getClusterTextSizeByZoom = (zoom: number) => {
  const minZoom = 9
  const maxZoom = 17

  const minSize = 10
  const maxSize = 14

  const tRaw =
    1 - Math.max(0, Math.min(1, (zoom - minZoom) / (maxZoom - minZoom)))

  const t = Math.pow(tRaw, 1.5)

  return minSize + t * (maxSize - minSize)
}

export { WaterDepthDeckInstance }
