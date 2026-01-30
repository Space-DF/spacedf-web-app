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

const VIETNAM_CENTER: [number, number] = [108.2772, 14.0583]

class MapInstance {
  private static instance: MapInstance | undefined
  private map: MapLibreGL.Map | null = null
  private geoLocate: MapLibreGL.GeolocateControl | null = null
  private devices: Record<string, Device> = {}
  private emitter = new EventEmitter()
  private isReady = false
  private theme: 'dark' | 'light' = 'light'
  private pitch: number = 0
  private initialized = false
  private readyEmitted = false
  private isMapFlying = false

  private constructor() {}

  private _handleZoomToSingleDevice = () => {
    if (!this.map) return
    const firstDevice = Object.values(this.devices)[0]

    this.map.flyTo({
      center: firstDevice.deviceProperties?.latest_checkpoint_arr as [
        number,
        number,
      ],
      zoom: 17,
      duration: 5000,
      padding: {
        top: 0,
      },
      pitch: this.pitch,
    })
  }

  private _handleEmptyDevices = () => {
    if (!this.map) return

    this.geoLocate?.trigger()

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.map?.flyTo({
            center: [pos.coords.longitude, pos.coords.latitude],
            zoom: 15,
            duration: 5000,
            padding: {
              top: 0,
            },
            pitch: this.pitch,
          })
        },
        () => {
          this.map?.flyTo({
            center: VIETNAM_CENTER,
            zoom: 5,
            duration: 1500,
            essential: true,
            padding: {
              top: 0,
            },
            pitch: this.pitch,
          })
        },
        {
          enableHighAccuracy: true,
        }
      )
    }
  }

  private _handleZoomFitDevices = () => {
    if (!this.map) return

    const devicesArr = Object.values(this.devices)
    const coordinates = devicesArr
      .map((d) => d.deviceProperties?.latest_checkpoint_arr)
      .filter(
        (loc): loc is [number, number] => Array.isArray(loc) && loc.length === 2
      )

    if (!coordinates.length) return

    const bounds = getBoundsFromCoordinates(coordinates)
    const [firstLng, firstLat] = coordinates[0]
    const allSameLocation = coordinates.every(
      ([lng, lat]) => lng === firstLng && lat === firstLat
    )

    if (allSameLocation) {
      this.map.flyTo({
        center: [firstLng, firstLat],
        zoom: 17,
        duration: 4000,
        pitch: this.pitch,
      })
    } else {
      this.map.fitBounds(
        [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]],
        {
          padding: {
            top: 0,
          },
          duration: 4000,
          pitch: this.pitch,
          maxZoom: 17,
        }
      )
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
    if (this.map) {
      window.location.reload()
      return
    }
    this.theme = theme

    const map = new MapLibreGL.Map({
      container: container,
      center: [0, 0],
      style: defaultStyles[theme],
      canvasContextAttributes: { antialias: true },
      ...(options || {}),
    })

    map.on('load', () => {
      if (!this.readyEmitted && map.isStyleLoaded()) {
        this.geoLocate = new MapLibreGL.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
        })

        map.addControl(this.geoLocate)

        this.readyEmitted = true
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

    this.initialized = true

    return this.map
  }

  public updateTheme(theme: 'dark' | 'light') {
    if (theme === this.theme || !this.map) return

    this.theme = theme

    this.map.setStyle(defaultStyles[theme])
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

  public onStrategyZoom = (devices: Record<string, Device>) => {
    if (!this.map) return

    const countDevices = Object.keys(devices).length
    this.devices = devices

    if (!countDevices) {
      this._handleEmptyDevices()
    }

    if (countDevices === 1) {
      this._handleZoomToSingleDevice()
    }

    if (countDevices > 1) {
      this._handleZoomFitDevices()
    }
  }

  public syncMapPitch(pitch: number) {
    this.pitch = pitch
  }

  public updateMapPitch = async ({
    pitch,
    duration = 400,
  }: UpdateMapPitchProps) => {
    if (!this.map) return

    const zoom = this.map.getZoom()

    if (zoom > 20) {
      this.map.easeTo({
        zoom: 17,
        duration: 200,
      })

      //prevent map from zooming too fast
      await new Promise((resolve) => setTimeout(resolve, 200))
    }

    this.map.easeTo({
      pitch,
      duration,
    })
  }
  public getIsMapFlying() {
    return this.isMapFlying
  }

  public onZoomToDevice = (device: Device) => {
    if (!this.map) return

    this.isMapFlying = true

    const location = device.deviceProperties?.latest_checkpoint_arr || [0, 0]

    const bounds = this.map.getBounds()
    const isInView = bounds.contains(location)

    if (isInView) {
      this.map.easeTo({
        center: location,
        zoom: 18,
        duration: 500,
      })
    } else {
      this.map.flyTo({
        center: location,
        zoom: 18,
        duration: 500,
      })
    }

    setTimeout(() => {
      this.isMapFlying = false
    }, 600)
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

const getBoundsFromCoordinates = (coordinates: number[][]) => {
  if (!coordinates.length)
    return [
      [0, 0],
      [0, 0],
    ] as number[][]

  let minLng = coordinates[0][0]
  let minLat = coordinates[0][1]
  let maxLng = coordinates[0][0]
  let maxLat = coordinates[0][1]

  coordinates.forEach(([lng, lat]) => {
    if (lng < minLng) minLng = lng
    if (lat < minLat) minLat = lat
    if (lng > maxLng) maxLng = lng
    if (lat > maxLat) maxLat = lat
  })

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

export default MapInstance
