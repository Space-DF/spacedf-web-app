import {
  findWaterLevelSetting,
  useMonitoringSettingStore,
} from '@/stores/monitoring-setting-store'
import { Device } from '@/stores/device-store'
import { MonitoringArea } from '@/types/device'
import { MonitoringDisplaySettings } from '@/types/organization'
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
  radiusToResolution,
} from '@/utils/h3'
import { getDeviceLocation } from '@/utils/map'
import {
  getWaterDepthLevelColors,
  getWaterDepthLevelName,
  getWaterLevelDisplaySettings,
  getWaterLevelThresholds,
  WATER_LEVEL_DEVICE_ICON_URL,
} from '@/utils/water-depth'
import type { MapboxOverlay } from '@deck.gl/mapbox'
import { IconLayer, ScatterplotLayer, TextLayer } from 'deck.gl'
import { type Map as MapLibreGLMap, type MapLayerMouseEvent } from 'maplibre-gl'
import { GlobalDeckGLInstance, LAYER_IDS } from '../global-layer-instance'
import {
  createDeviceIconSprite,
  DEVICE_ICON_BUTTON_RATIO,
  DEVICE_ICON_SPRITE_ANCHOR_Y,
  DEVICE_ICON_SPRITE_SIZE,
  type FrameColors,
} from './device-icon-sprite'
import {
  columnHeight,
  removeWaterLevelLayers,
  resolveZoneOverlaps,
  syncCoverageHighlight,
  syncWaterLevelLayers,
  WATER_LEVEL_LAYER_IDS,
  type RankedWaterZone,
  type WaterColumn,
  type WaterZone,
} from './water-level-layers'

type SyncDeviceFn = {
  devices: Device[]
  allUngroupedDeviceIds: string[]
}

type DeviceArea = {
  area: MonitoringArea | null
  requestedResolution: number
  resolution: number
  cells: string[]
  cellSet: Set<string>
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

type DeviceIcon = {
  id: string
  url: string
  width: number
  height: number
  anchorY: number
}

type IconImage = HTMLImageElement | 'loading' | 'failed'

const isLoaded = (image: IconImage): image is HTMLImageElement =>
  typeof image !== 'string'

/** Sized so the button reads at `DEVICE_BUTTON_SIZE` with the ring around it. */
const DEVICE_BUTTON_SIZE = 34
const DEVICE_ICON_SIZE = Math.round(
  DEVICE_BUTTON_SIZE / DEVICE_ICON_BUTTON_RATIO
)

const FRAME_COLOR_FALLBACK: FrameColors = {
  background: '#ffffff',
  border: '#e2e8f0',
}

const DEVICE_ICON_CLEARANCE_M = 60

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

const OWNED_DECK_LAYER_IDS = [
  ...CLUSTER_DECK_LAYER_IDS,
  LAYER_IDS.WATER_DEPTH_DEVICE_ICON_LAYER,
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
  private hoveredDevice: string | null = null
  /** Last zones drawn, so a highlight can be repainted without rebuilding. */
  private zones: WaterZone[] = []
  private iconImages: Map<string, IconImage> = new Map()
  /** Framed sprite per logo and frame color. */
  private iconSprites: Map<string, DeviceIcon> = new Map()
  private iconRefreshHandle: number | null = null
  private themeObserver: MutationObserver | null = null
  private pointerOverLayer = false
  private pointerOverIcon = false
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
    return getDeviceLocation(device) ?? this._getDeviceArea(device).center
  }

  private _isInsideArea(device: Device): boolean {
    const location = getDeviceLocation(device)
    if (!location) return true

    const { resolution, cellSet } = this._getDeviceArea(device)

    return cellSet.has(pointToCell(location[0], location[1], resolution))
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

  private _areaResolution(area: MonitoringArea | null): number {
    const setting = findWaterLevelSetting(
      useMonitoringSettingStore.getState().settings
    )
    if (setting) return radiusToResolution(setting.cell_size)

    return area ? inferResolution(area) : H3_RESOLUTION
  }

  /**
   * `cells` is the union of the hexagons drawn for the device, so it has to be
   * cut back into cells to be rendered as a grid. That is expensive next to the
   * telemetry updates driving a resync, hence the cache on the stored area.
   */
  private _getDeviceArea(device: Device): DeviceArea {
    const area = device.deviceInformation?.cells ?? null
    const requestedResolution = this._areaResolution(area)
    const cached = this.areaCache.get(device.id)
    if (
      cached &&
      cached.area === area &&
      cached.requestedResolution === requestedResolution
    )
      return cached

    const cells = areaToCells(area, requestedResolution)
    const entry: DeviceArea = {
      area,
      requestedResolution,
      resolution: cells.length ? cellResolution(cells[0]) : requestedResolution,
      cells,
      cellSet: new Set(cells),
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

    const rankedZones: RankedWaterZone[] = []
    const columns: WaterColumn[] = []

    const setting = findWaterLevelSetting(
      useMonitoringSettingStore.getState().settings
    )
    const thresholds = getWaterLevelThresholds(setting)
    const levelColors = getWaterDepthLevelColors(setting)
    const display = getWaterLevelDisplaySettings(setting)
    const columnDepthRange = thresholds.warning * COLUMN_DEPTH_RANGE_FACTOR

    grouping.visibleDevices.forEach((device) => {
      // A device folded into a cluster is represented by its badge instead.
      if (!this.ungroupedDeviceIds.has(device.id)) return

      const { resolution, cells } = this._getDeviceArea(device)
      const waterDepth = device.deviceProperties?.water_depth ?? 0
      const depth = waterDepth / CM_PER_METRE
      const color =
        levelColors[getWaterDepthLevelName(waterDepth, thresholds)].primary

      if (cells.length && this._isInsideArea(device)) {
        rankedZones.push({
          deviceId: device.id,
          cells,
          color,
          severity: waterDepth,
        })
      }

      if (!display.water_column) return

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

    const zones = resolveZoneOverlaps(rankedZones)
    this.zones = zones

    // A style swap can land between the check above and the write; retrying is
    // cheaper than letting it bubble up and tear the map layer down.
    try {
      syncWaterLevelLayers(map, zones, columns, this._highlightedDevices())
    } catch {
      this._deferSync(map)
    }
  }

  /** Zones outlined brighter: the one under the pointer and the chosen one. */
  private _highlightedDevices(): Set<string> {
    return new Set(
      [this.hoveredDevice, this.focusedDevice].filter(
        (deviceId): deviceId is string => !!deviceId
      )
    )
  }

  private _setHoveredDevice(deviceId: string | null) {
    if (this.hoveredDevice === deviceId) return

    this.hoveredDevice = deviceId
    if (!this.map) return

    syncCoverageHighlight(this.map, this.zones, this._highlightedDevices())
  }

  private _columnCell(device: Device): string | null {
    const location = this._deviceLocation(device)
    if (!location) return null

    const { resolution } = this._getDeviceArea(device)

    return pointToCell(location[0], location[1], resolution)
  }

  private _displaySettings(): MonitoringDisplaySettings {
    return getWaterLevelDisplaySettings(
      findWaterLevelSetting(useMonitoringSettingStore.getState().settings)
    )
  }

  private _columnTop(
    device: Device,
    display: MonitoringDisplaySettings
  ): number {
    if (!display.water_column) return 0

    return columnHeight(this._getDeviceArea(device).resolution)
  }

  private _badgeAnchor(
    group: LocationGroup,
    display: MonitoringDisplaySettings
  ): [number, number, number] {
    const displayed = group.devices.find(
      (device) => device.id === group.displayedDeviceId
    )
    const clearance = CLUSTER_CLEARANCE_M + DEVICE_ICON_CLEARANCE_M
    const h3 = displayed && this._columnCell(displayed)
    if (!displayed || !h3) return [...group.location, clearance]

    return [...cellCenter(h3), this._columnTop(displayed, display) + clearance]
  }

  /** Coalesces the redraws that land as profile icons finish downloading. */
  private _scheduleIconRefresh = () => {
    if (this.iconRefreshHandle !== null) return

    this.iconRefreshHandle = window.requestAnimationFrame(() => {
      this.iconRefreshHandle = null
      this._buildDeviceIconLayer()
    })
  }

  /**
   * A logo deck.gl cannot fetch is dropped with an error rather than replaced,
   * and the sprite needs the pixels anyway, so images are loaded here first.
   */
  private _iconImage(url: string): IconImage {
    const cached = this.iconImages.get(url)
    if (cached) return cached

    this.iconImages.set(url, 'loading')

    const fail = () => {
      this.iconImages.set(url, 'failed')
      this._scheduleIconRefresh()
    }

    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      if (!image.naturalWidth || !image.naturalHeight) return fail()

      this.iconImages.set(url, image)
      this._scheduleIconRefresh()
    }
    image.onerror = fail
    image.src = url

    return 'loading'
  }

  private _frameColors(): FrameColors {
    if (typeof window === 'undefined') return FRAME_COLOR_FALLBACK

    // Read live rather than mapped from the theme name, so a white-labelled
    // organization frames its icons in its own palette.
    const styles = window.getComputedStyle(document.documentElement)
    const color = (variable: string, fallback: string) => {
      const value = styles.getPropertyValue(variable).trim()

      return value ? `hsl(${value})` : fallback
    }

    return {
      background: color('--card', FRAME_COLOR_FALLBACK.background),
      border: color('--border', FRAME_COLOR_FALLBACK.border),
    }
  }

  /**
   * The device logo once it is ready, the shared fallback when it has none or
   * its own cannot be fetched.
   *
   * @returns null while an image is still on the way, which leaves a device
   * that has a logo iconless rather than briefly wearing the fallback.
   */
  private _iconSource(
    logoUrl?: string
  ): { url: string; image: HTMLImageElement } | null {
    if (logoUrl) {
      const logo = this._iconImage(logoUrl)
      if (logo === 'loading') return null
      if (isLoaded(logo)) return { url: logoUrl, image: logo }
    }

    const fallback = this._iconImage(WATER_LEVEL_DEVICE_ICON_URL)
    if (!isLoaded(fallback)) return null

    return { url: WATER_LEVEL_DEVICE_ICON_URL, image: fallback }
  }

  private _framedIcon(
    logoUrl: string | undefined,
    colors: FrameColors
  ): DeviceIcon | null {
    const source = this._iconSource(logoUrl)
    if (!source) return null

    const id = `${source.url}|${colors.background}|${colors.border}|${colors.ring ?? ''}`
    const cached = this.iconSprites.get(id)
    if (cached) return cached

    const sprite = createDeviceIconSprite(source.image, colors)
    if (!sprite) return null

    const icon: DeviceIcon = {
      id,
      url: sprite,
      width: DEVICE_ICON_SPRITE_SIZE,
      height: DEVICE_ICON_SPRITE_SIZE,
      anchorY: DEVICE_ICON_SPRITE_ANCHOR_Y,
    }
    this.iconSprites.set(id, icon)

    return icon
  }

  private _deviceIconData(grouping: DeviceGrouping) {
    const display = this._displaySettings()
    const setting = findWaterLevelSetting(
      useMonitoringSettingStore.getState().settings
    )
    const thresholds = getWaterLevelThresholds(setting)
    const levelColors = getWaterDepthLevelColors(setting)
    const frameColors = this._frameColors()

    return grouping.visibleDevices.flatMap((device) => {
      if (!this.ungroupedDeviceIds.has(device.id)) return []

      const h3 = this._columnCell(device)
      // The column is drawn on the cell, so the icon has to stand on it too.
      const location = h3 ? cellCenter(h3) : this._deviceLocation(device)
      if (!location) return []

      const waterDepth = device.deviceProperties?.water_depth ?? 0
      const selected = device.id === this.focusedDevice

      const icon = this._framedIcon(
        device.deviceInformation?.device_profile?.logo || undefined,
        selected
          ? {
              ...frameColors,
              ring: levelColors[getWaterDepthLevelName(waterDepth, thresholds)]
                .primary,
            }
          : frameColors
      )
      if (!icon) return []

      return [
        {
          deviceId: device.id,
          position: [...location, this._columnTop(device, display)] as [
            number,
            number,
            number,
          ],
          icon,
          depth: waterDepth / CM_PER_METRE,
        },
      ]
    })
  }

  private _buildDeviceIconLayer(grouping = this._groupDevices()) {
    if (!this.globalOverlay) return

    const layer = new IconLayer({
      id: LAYER_IDS.WATER_DEPTH_DEVICE_ICON_LAYER,
      data: this._deviceIconData(grouping),
      getPosition: (d) => d.position,
      getIcon: (d) => d.icon,
      getSize: DEVICE_ICON_SIZE,
      sizeUnits: 'pixels',
      billboard: true,
      pickable: true,
      parameters: {
        depthTest: false,
        depthMask: false,
      } as any,
      onClick: ({ object }) => this._emitDeviceSelected(object?.deviceId),
      onHover: ({ object, x, y }) => {
        this.pointerOverIcon = !!object
        this._syncCursor()

        if (!object) {
          this._clearHover()
          return
        }

        this._setHoveredDevice(object.deviceId)
        if (object.deviceId === this.hoveredColumnId) return

        this.hoveredColumnId = object.deviceId
        this.emitter.emit('water-depth-hover', {
          deviceId: object.deviceId,
          depth: object.depth,
          screenPosition: { x, y },
        })
      },
    })

    if (globalDeckGLInstance.getLayers(layer.id)) {
      globalDeckGLInstance.updateLayer(layer)
      return
    }

    globalDeckGLInstance.appendLayer(layer)
  }

  private _buildClusterLayers(grouping = this._groupDevices()) {
    if (!this.hasVisibleBefore || !this.globalOverlay) return

    const display = this._displaySettings()

    const deviceCountData = Array.from(grouping.locationGroups.values())
      .filter((group) => group.count > 1)
      .map((group) => ({
        ...group,
        visible: group.deviceIds.every((id) => this.ungroupedDeviceIds.has(id)),
        anchor: this._badgeAnchor(group, display),
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
    this._buildDeviceIconLayer(grouping)
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

  /**
   * Map layers and the deck icons report hovers apart, so neither may clear a
   * cursor the other still owns.
   */
  private _syncCursor() {
    if (!this.map) return

    this.map.getCanvas().style.cursor =
      this.pointerOverLayer || this.pointerOverIcon ? 'pointer' : ''
  }

  private _handlePointerEnter = () => {
    this.pointerOverLayer = true
    this._syncCursor()
  }

  private _handlePointerLeave = () => {
    this.pointerOverLayer = false
    this._syncCursor()
  }

  private _handleColumnHover = (event: MapLayerMouseEvent) => {
    const properties = event.features?.[0]?.properties
    const deviceId = properties?.deviceId as string | undefined
    const depth = properties?.depth as number | undefined
    if (!deviceId || depth === undefined) return

    this._setHoveredDevice(deviceId)
    if (deviceId === this.hoveredColumnId) return

    this.hoveredColumnId = deviceId
    this.emitter.emit('water-depth-hover', {
      deviceId,
      depth,
      screenPosition: { x: event.point.x, y: event.point.y },
    })
  }

  private _handleZoneHover = (event: MapLayerMouseEvent) => {
    const deviceId = event.features?.[0]?.properties?.deviceId as
      | string
      | undefined

    this._setHoveredDevice(deviceId ?? null)
  }

  private _clearZoneHover = () => {
    this._setHoveredDevice(null)
  }

  private _bindLayerInteractions(map: MapLibreGLMap) {
    map.on('click', SELECTABLE_LAYERS, this._handleLayerClick)
    map.on('mouseenter', SELECTABLE_LAYERS, this._handlePointerEnter)
    map.on('mouseleave', SELECTABLE_LAYERS, this._handlePointerLeave)
    map.on(
      'mousemove',
      WATER_LEVEL_LAYER_IDS.COVERAGE_FILL,
      this._handleZoneHover
    )
    map.on(
      'mouseleave',
      WATER_LEVEL_LAYER_IDS.COVERAGE_FILL,
      this._clearZoneHover
    )
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
      WATER_LEVEL_LAYER_IDS.COVERAGE_FILL,
      this._handleZoneHover
    )
    map.off(
      'mouseleave',
      WATER_LEVEL_LAYER_IDS.COVERAGE_FILL,
      this._clearZoneHover
    )
    map.off(
      'mousemove',
      WATER_LEVEL_LAYER_IDS.COLUMN_GLASS,
      this._handleColumnHover
    )
    map.off('mouseleave', WATER_LEVEL_LAYER_IDS.COLUMN_GLASS, this._clearHover)
  }

  private _clearHover = () => {
    this._setHoveredDevice(null)

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

    this._watchTheme()
  }

  /**
   * Icon frames are painted from the CSS palette, so they are repainted off the
   * class the theme actually lands on. A React effect would run before the
   * provider higher up the tree has swapped it, and repaint the old palette.
   */
  private _watchTheme() {
    if (typeof MutationObserver === 'undefined') return

    this.themeObserver = new MutationObserver(this._scheduleIconRefresh)
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style', 'data-theme'],
    })
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

    const grouping = this._groupDevices()
    this._syncWaterLevelLayers(grouping)
    this._buildDeviceIconLayer(grouping)
  }

  public destroy() {
    if (!this.map) return

    this.map.off('zoom', this._handleMapZoom)
    this.map.off('style.load', this._handleStyleLoad)
    this.map.off('idle', this._handleStyleIdle)
    this._unbindLayerInteractions(this.map)

    this.unsubscribeSetting?.()
    this.unsubscribeSetting = null

    this.themeObserver?.disconnect()
    this.themeObserver = null

    if (this.iconRefreshHandle !== null) {
      window.cancelAnimationFrame(this.iconRefreshHandle)
      this.iconRefreshHandle = null
    }

    this.pointerOverLayer = false
    this.pointerOverIcon = false
    this._syncCursor()
    this._clearHover()

    removeWaterLevelLayers(this.map)

    OWNED_DECK_LAYER_IDS.forEach((id) => globalDeckGLInstance.removeLayer(id))

    this.hoveredDevice = null
    this.zones = []

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
