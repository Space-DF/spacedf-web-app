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
  private focusedDevice: string = ''
  private context: CanvasRenderingContext2D | null = null

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

  private _createPulsingDot() {
    const size = 150

    return {
      width: size,
      height: size,
      data: new Uint8ClampedArray(size * size * 4),
      context: null as CanvasRenderingContext2D | null,
      map: null as MapLibreGL.Map | null,

      onAdd(map: MapLibreGL.Map) {
        this.map = map
        const canvas = document.createElement('canvas')
        canvas.width = this.width
        canvas.height = this.height
        this.context = canvas.getContext('2d')
      },

      render() {
        const duration = 1000
        const t = (performance.now() % duration) / duration

        const innerRadius = (size / 2) * 0.3
        const outerRadius = (size / 2) * 0.7 * t + innerRadius

        const ctx = this.context
        if (!ctx) return false

        ctx.clearRect(0, 0, this.width, this.height)

        // outer ripple
        ctx.beginPath()
        ctx.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(121, 88, 255, ${1 - t})`
        ctx.fill()

        // inner dot
        ctx.beginPath()
        ctx.arc(this.width / 2, this.height / 2, innerRadius, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(121, 88, 255, 1)'
        ctx.strokeStyle = '#ffffff'
        ctx.lineWidth = 2 + 4 * (1 - t)
        ctx.fill()
        ctx.stroke()

        this.data = ctx.getImageData(0, 0, this.width, this.height).data
        this.map?.triggerRepaint()
        return true
      },
    }
  }

  private _ensurePulseAssets() {
    if (!this.map) return

    if (!this.map.hasImage('pulsing-dot')) {
      this.map.addImage('pulsing-dot', this._createPulsingDot(), {
        pixelRatio: 2,
      })
    }

    if (!this.map.getSource('focused-device')) {
      this.map.addSource('focused-device', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [],
        },
      })
    }

    if (!this.map.getLayer('focused-device-layer')) {
      this.map.addLayer({
        id: 'focused-device-layer',
        type: 'symbol',
        source: 'focused-device',
        layout: {
          'icon-image': 'pulsing-dot',
          'icon-allow-overlap': true,
        },
      })
    }
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
      this._ensurePulseAssets()
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

  deviceFocus(deviceId: string) {
    if (!this.map) return
    if (!deviceId || !this.devices[deviceId]) {
      this.clearFocus()
      return
    }

    this.focusedDevice = deviceId
    this._ensurePulseAssets()

    const device = this.devices[deviceId]
    const coordinates = device.deviceProperties?.latest_checkpoint_arr ?? [0, 0]

    const source = this.map.getSource(
      'focused-device'
    ) as MapLibreGL.GeoJSONSource

    source.setData({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { id: deviceId },
          geometry: {
            type: 'Point',
            coordinates,
          },
        },
      ],
    })

    this.map.easeTo({
      center: coordinates as [number, number],
      zoom: 16,
      duration: 800,
    })
  }

  clearFocus() {
    if (!this.map) return
    const source = this.map.getSource(
      'focused-device'
    ) as MapLibreGL.GeoJSONSource

    source?.setData({
      type: 'FeatureCollection',
      features: [],
    })
  }
}

export default MapInstance
