import { Device } from '@/stores/device-store'
import EventEmitter from '@/utils/event'
import MapLibreGL from 'maplibre-gl'

type MapProps = {
  container: HTMLElement
  theme: 'dark' | 'light'
  options?: Omit<MapLibreGL.MapOptions, 'container' | 'style'>
}

type UpdateMapPitchProps = {
  pitch: number
  duration?: number
}

type MapEvent =
  | keyof MapLibreGL.MapEventType
  | 'style.load'
  | 'reattach'
  | 'ready'

const defaultStyles = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://tiles.openfreemap.org/styles/positron',
}

// keyof MapLibreGL.MapLayerEventType

class MapInstance {
  private static instance: MapInstance | undefined
  private map: MapLibreGL.Map | null = null
  private devices: Record<string, Device> = {}
  private emitter = new EventEmitter()
  private isReady = false
  private theme: 'dark' | 'light' = 'light'
  private pitch: number = 0

  private constructor() {}

  private _handleZoomFitDevices = () => {
    if (!this.map) return
    const firstDevice = Object.values(this.devices)[0]

    this.map.flyTo({
      center: firstDevice.deviceProperties?.latest_checkpoint_arr as [
        number,
        number,
      ],
      zoom: 17,
      duration: 5000,
      pitch: this.pitch,
    })
  }

  on(event: MapEvent, handler: (...args: any[]) => void) {
    this.emitter.on(event, handler)
  }

  off(event: MapEvent, handler: (...args: any[]) => void) {
    this.emitter.off(event, handler)
  }

  public static getInstance() {
    if (!MapInstance.instance) {
      MapInstance.instance = new MapInstance()
    }
    return MapInstance.instance
  }

  public init({ container, theme, options }: MapProps) {
    if (this.map) return this.map

    this.theme = theme

    const map = new MapLibreGL.Map({
      container: container,
      center: [0, 0],
      style: defaultStyles[theme],
      canvasContextAttributes: { antialias: true },
      ...(options || {}),
    })

    map.addControl(new MapLibreGL.GlobeControl(), 'top-right')

    map.on('load', () => {
      if (map.isStyleLoaded()) {
        this.emitter.emit('ready', map)
      }
    })

    map.on('style.load', (map: maplibregl.Map) => {
      this.emitter.emit('style.load', map)
    })

    map.on('styledata', (map: maplibregl.Map) => {
      this.emitter.emit('styledata', map)
    })

    this.map = map

    return this.map
  }

  public updateTheme(theme: 'dark' | 'light') {
    if (theme === this.theme || !this.map) return

    this.theme = theme

    this.map.setStyle(defaultStyles[theme])
  }

  public onStrategyZoom = (devices: Record<string, Device>, pitch: number) => {
    if (!this.map) return

    this.pitch = pitch

    const countDevices = Object.keys(devices).length
    this.devices = devices

    if (!countDevices) {
      console.log('handle devices is empty')
    }

    if (countDevices === 1) {
      console.log('handle devices is one')
    }

    if (countDevices > 1) {
      this._handleZoomFitDevices()
    }
  }

  public updateMapPitch = ({ pitch, duration = 400 }: UpdateMapPitchProps) => {
    if (!this.map) return

    this.map.easeTo({
      pitch,
      duration,
    })
  }

  async setContainer(newContainer: HTMLDivElement) {
    if (!this.map) return

    this.isReady = false

    const currentContainer = this.map.getContainer()

    if (currentContainer.parentElement === newContainer) return

    requestAnimationFrame(() => {
      if (!this.map) return

      if (!newContainer.contains(currentContainer)) {
        newContainer.appendChild(currentContainer)
        this.map?.resize()

        this.map.setZoom(0.5)
        this.map.setCenter([0, 0])

        this.emitter.emit('ready', this.map)
      }
    })
  }

  public getMap() {
    return this.map
  }

  public remove() {
    if (this.map) {
      this.map.remove()
      this.map = null
      this.devices = {}
    }
  }

  public isReadyForLogic() {
    return this.isReady
  }
}

export default MapInstance
