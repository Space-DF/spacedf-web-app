import { NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN } from '@/shared/env'
import { Device } from '@/stores/device-store'
import mapboxgl, { MapEvent, MapOptions } from 'mapbox-gl'

mapboxgl.accessToken = NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

type MapboxMap = mapboxgl.Map
type MapboxEventHandler = (event: mapboxgl.Map) => void
type LayerEventHandler = (
  event: (mapboxgl.MapMouseEvent & mapboxgl.Event) | mapboxgl.MapMouseEvent
) => void

class FleetTrackingMap {
  private static instance: FleetTrackingMap | undefined
  private map: mapboxgl.Map | null = null
  private listeners: Record<string, MapboxEventHandler[]> = {}
  private layerListeners: Record<string, LayerEventHandler[]> = {}
  private devices: Record<string, Device> = {}

  public isInitialized = false

  private constructor() {}

  static getInstance() {
    if (!FleetTrackingMap.instance) {
      FleetTrackingMap.instance = new FleetTrackingMap()
    }

    return FleetTrackingMap.instance
  }

  init(container: HTMLElement, options: Partial<MapOptions> = {}) {
    if (this.isInitialized) return this.map

    this.map = new mapboxgl.Map({
      container,
      ...options,
    })

    this.map.on('load', () => {
      this.isInitialized = true

      this.emit('load', this.map)
    })

    this.map.on('zoomend', () => {
      if (!this.map) return
      this.emit('zoomend', this.map)
    })

    this.map.on('rotate', () => {
      if (!this.map) return
      this.emit('rotate', this.map)
    })

    this.map.on('style.load', () => {
      if (!this.map) return
      this.emit('style.load', this.map)
    })

    this.map.on('move', () => {
      if (!this.map) return
      this.emit('move', this.map)
    })

    this.map.on('click', (e) => {
      if (!this.map) return
      this.emit('click', e)
    })

    this.map.once('idle', () => {
      if (!this.map) return
      this.emit('idle', this.map)
    })

    return this.map
  }

  getMap() {
    if (!this.map) return null
    return this.map
  }

  async setContainer(newContainer: HTMLDivElement) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    if (!this.map) return

    const currentContainer = this.map.getContainer()

    if (currentContainer.parentElement === newContainer) return

    newContainer.appendChild(currentContainer)
    this.map?.resize()

    this.map.setZoom(0.5)
    this.map.setCenter([0, 0])

    this.emit('reattach', this.map)
  }

  remove() {
    if (!this.map) return
    this.clearAllListeners()
    this.devices = {}
    this.map.remove()
    this.map = null
    this.isInitialized = false
    FleetTrackingMap.instance = undefined
  }

  resize() {
    if (!this.map) return
    this.map.resize()
  }

  updatePitch(pitch: number) {
    if (!this.map) return
    this.map.easeTo({
      pitch: pitch,
      duration: 300,
      essential: true,
    })
  }

  updateStyle(style: string, config: any) {
    if (!this.map) return
    this.map.setStyle(style, { config, diff: true } as any)
  }

  clearAllListeners() {
    if (!this.map) return
    for (const event in this.listeners) {
      const handlers = this.listeners[event]
      handlers.forEach((h) => this.map?.off(event, h))
    }
    this.listeners = {}
  }

  on(event: MapEvent['type'] | 'reattach', handler: MapboxEventHandler) {
    if (!this.listeners[event]) this.listeners[event] = []
    this.listeners[event].push(handler)
  }

  once(event: MapEvent['type'] | 'reattach', handler: MapboxEventHandler) {
    const onceHandler = (data: any) => {
      handler(data)
      this.off(event as MapEvent['type'], onceHandler)
    }

    this.on(event as MapEvent['type'], onceHandler)
  }

  onLayer(event: string, layerId: string, handler: LayerEventHandler) {
    if (!this.map) return
    const key = `${event}:${layerId}`

    if (!this.layerListeners[key]) this.layerListeners[key] = []
    this.layerListeners[key].push(handler)

    this.map.on(event as any, layerId, handler)
  }

  off(event: MapEvent['type'] | 'reattach', handler: MapboxEventHandler) {
    if (!this.listeners[event]) return
    this.listeners[event] = this.listeners[event].filter((h) => h !== handler)
  }

  offLayer(event: string, layerId: string, handler: LayerEventHandler) {
    if (!this.map) return
    const key = `${event}:${layerId}`

    this.layerListeners[key] = (this.layerListeners[key] || []).filter(
      (h) => h !== handler
    )

    this.map.off(event as any, layerId, handler)
  }

  setDevices(devices: Record<string, Device>) {
    this.devices = devices
  }

  getDevices() {
    return this.devices
  }

  private emit(event: MapEvent['type'] | 'reattach', data: any) {
    const handlers = this.listeners[event]
    if (!handlers) return
    handlers.forEach((handler) => handler(data))
  }
}

export { FleetTrackingMap }
export type { MapboxMap }
