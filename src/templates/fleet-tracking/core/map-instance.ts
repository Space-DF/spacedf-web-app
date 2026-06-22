import { Device } from '@/stores/device-store'
import EventEmitter from '@/utils/event'
import { Map, GeolocateControl } from 'maplibre-gl'
import type { MapOptions, MapEventType } from 'maplibre-gl'
import type { TerraDraw } from 'terra-draw'
import { PolygonGeometry } from '@/types/geofence'
import { hexWithOpacity } from '@/containers/geofences/components/upseart-geofence/utils'

type MapProps = {
  container: HTMLElement
  theme: 'dark' | 'light'
  options?: Omit<MapOptions, 'container' | 'style'>
}

type UpdateMapPitchProps = {
  pitch: number
  duration?: number
}

type MapEvent = keyof MapEventType | 'style.load' | 'reattach' | 'ready'

const defaultStyles = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://tiles.openfreemap.org/styles/positron',
}

const VIETNAM_CENTER: [number, number] = [108.2772, 14.0583]

type Bounds = {
  minLng: number
  minLat: number
  maxLng: number
  maxLat: number
}

class MapInstance {
  private static instance: MapInstance | undefined
  private map: Map | null = null
  private geoLocate: GeolocateControl | null = null
  private devices: Record<string, Device> = {}
  private emitter = new EventEmitter()
  private isReady = false
  private theme: 'dark' | 'light' = 'light'
  private pitch: number = 0
  private initialized = false
  private readyEmitted = false
  private isMapFlying = false
  private _isDrawingMode = false
  private constructor() {}

  private draw: TerraDraw | null = null

  private _reregisterTerraDrawAfterStyleLoad = () => {
    if (!this.draw) return
    if (this.draw.enabled) {
      this.draw.stop()
    }
    this.draw.start()
  }

  private _handleZoomToSingleDevice = () => {
    if (!this.map) return
    const firstDevice = Object.values(this.devices)[0]

    const [lng, lat] = firstDevice.deviceProperties?.latest_checkpoint_arr ?? [
      0, 0,
    ]

    this.map.flyTo({
      center: [lng, lat],
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
        (loc): loc is [number, number, number] =>
          Array.isArray(loc) && loc.length >= 2
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

  public triggerGeoLocate(): Promise<
    | {
        longitude: number
        latitude: number
      }
    | undefined
  > {
    if (!this.geoLocate) return Promise.resolve(undefined)
    return new Promise((resolve) => {
      this.geoLocate?.trigger()
      this.geoLocate?.once('geolocate', (e: any) => {
        resolve(e?.coords)
      })
    })
  }

  public init({ container, theme, options }: MapProps) {
    if (this.map) {
      window.location.reload()
      return
    }
    this.theme = theme

    const map = new Map({
      container: container,
      center: [0, 0],
      style: defaultStyles[theme],
      canvasContextAttributes: { antialias: true },
      ...(options || {}),
    })

    map.on('load', () => {
      if (!this.readyEmitted && map.isStyleLoaded()) {
        this.geoLocate = new GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
        })

        map.addControl(this.geoLocate)

        this.readyEmitted = true
        this.emitter.emit('ready', map)
      }
      map.resize()
    })

    map.on('style.load', (map: Map) => {
      this._reregisterTerraDrawAfterStyleLoad()
      this.emitter.emit('style.load', map)
    })

    map.on('styledata', (map: Map) => {
      this.emitter.emit('styledata', map)
    })

    this.map = map

    this.initialized = true

    this._prefetchStyles()

    return this.map
  }

  private _prefetchStyles() {
    Object.values(defaultStyles).forEach((url) => {
      fetch(url).catch(() => {})
    })
  }

  public async initTerraDraw() {
    if (this.draw || !this.map) return this.draw

    const [
      {
        TerraDraw,
        TerraDrawAngledRectangleMode,
        TerraDrawCircleMode,
        TerraDrawFreehandMode,
        TerraDrawPointMode,
        TerraDrawPolygonMode,
        TerraDrawRectangleMode,
        TerraDrawSectorMode,
        TerraDrawSelectMode,
        TerraDrawSensorMode,
        TerraDrawRenderMode,
        ValidateNotSelfIntersecting,
      },
      { TerraDrawMapLibreGLAdapter },
    ] = await Promise.all([
      import('terra-draw'),
      import('terra-draw-maplibre-gl-adapter'),
    ])

    const fillColor = (feature: {
      properties: { color?: string; disabled?: boolean }
    }) =>
      feature.properties.disabled
        ? hexWithOpacity(feature.properties.color as `#${string}`, 0.4)
        : (feature.properties.color as `#${string}`) || '#cccccc'
    const outlineColor = (feature: {
      properties: { color?: string; disabled?: boolean }
    }) =>
      feature.properties.disabled
        ? hexWithOpacity(feature.properties.color as `#${string}`, 0.4)
        : (feature.properties.color as `#${string}`) || '#000000'

    this.draw = new TerraDraw({
      adapter: new TerraDrawMapLibreGLAdapter({ map: this.map }),
      modes: [
        new TerraDrawRectangleMode({
          styles: { fillColor, outlineColor },
          validation: (f) => {
            return ValidateNotSelfIntersecting(f)
          },
        }),
        new TerraDrawCircleMode({
          styles: { fillColor, outlineColor },
          validation: (f) => {
            return ValidateNotSelfIntersecting(f)
          },
        }),
        new TerraDrawPolygonMode({
          styles: { fillColor, outlineColor },
          validation: (f) => {
            return ValidateNotSelfIntersecting(f)
          },
        }),
        new TerraDrawSectorMode({
          styles: { fillColor, outlineColor },
          validation: (f) => {
            return ValidateNotSelfIntersecting(f)
          },
        }),
        new TerraDrawPointMode({
          styles: {
            pointColor: fillColor,
            pointOutlineColor: outlineColor,
          },
        }),
        new TerraDrawFreehandMode({
          styles: { fillColor, outlineColor },
          validation: (f) => {
            return ValidateNotSelfIntersecting(f)
          },
        }),
        new TerraDrawAngledRectangleMode({
          styles: { fillColor, outlineColor },
          validation: (f) => {
            return ValidateNotSelfIntersecting(f)
          },
        }),
        new TerraDrawSensorMode({
          styles: {
            fillColor,
            outlineColor,
            centerPointColor: fillColor,
            centerPointOutlineColor: outlineColor,
          },
          validation: (f) => {
            return ValidateNotSelfIntersecting(f)
          },
        }),
        new TerraDrawSelectMode({
          allowManualDeselection: true,
          flags: Object.fromEntries(
            [
              'polygon',
              'linestring',
              'freehand',
              'circle',
              'rectangle',
              'sensor',
              'sector',
              'angled-rectangle',
            ].map((mode) => [
              mode,
              {
                feature: {
                  draggable: true,
                  deletable: true,
                  coordinates: {
                    midpoints: true,
                    draggable: true,
                    deletable: true,
                  },
                },
              },
            ])
          ),
          styles: {
            selectedPolygonColor: fillColor,
            selectedPolygonOutlineColor: outlineColor,
            selectedPointColor: fillColor,
            selectedPointOutlineColor: outlineColor,
          },
        }),
        new TerraDrawRenderMode({
          modeName: 'render',
          styles: {
            polygonFillColor: fillColor,
            polygonOutlineColor: outlineColor,
            pointColor: fillColor,
            pointOutlineColor: outlineColor,
          },
        }),
      ],
    })

    this._reregisterTerraDrawAfterStyleLoad()
    return this.draw
  }

  public getTerraDraw() {
    return this.draw
  }

  public setDrawingMode(active: boolean) {
    this._isDrawingMode = active
    const container = this.map?.getContainer()
    if (!container) return
    container.classList.toggle('geofence-drawing', active)
  }

  public isDrawingMode() {
    return this._isDrawingMode
  }

  public updateTheme(theme: 'dark' | 'light', onComplete?: () => void) {
    if (!theme || theme === this.theme || !this.map) return

    this.theme = theme

    if (onComplete) {
      this.map.once('idle', () => {
        onComplete()
      })
    }

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

    const location = device.deviceProperties?.latest_checkpoint_arr

    if (!location || location.length < 2 || location.every((loc) => loc === 0))
      return
    const [lng, lat] = location
    const bounds = this.map.getBounds()
    const isInView = bounds.contains([lng, lat])

    if (isInView) {
      this.map.easeTo({
        center: [lng, lat],
        zoom: 18,
        duration: 500,
      })
    } else {
      this.map.flyTo({
        center: [lng, lat],
        zoom: 18,
        duration: 500,
      })
    }

    setTimeout(() => {
      this.isMapFlying = false
    }, 600)
  }
  private getBoundary(data: PolygonGeometry[]): Bounds | null {
    if (!data.length) return null

    let minLng = Infinity
    let minLat = Infinity
    let maxLng = -Infinity
    let maxLat = -Infinity

    data.forEach((polygon) => {
      polygon.coordinates.forEach((ring) => {
        ring.forEach(([lng, lat]) => {
          minLng = Math.min(minLng, lng)
          minLat = Math.min(minLat, lat)
          maxLng = Math.max(maxLng, lng)
          maxLat = Math.max(maxLat, lat)
        })
      })
    })

    return { minLng, minLat, maxLng, maxLat }
  }

  public flyToBoundary(data: PolygonGeometry[]) {
    if (!this.map) return
    const boundary = this.getBoundary(data)
    if (!boundary) return
    this.map.fitBounds(
      [boundary.minLng, boundary.minLat, boundary.maxLng, boundary.maxLat],
      {
        padding: {
          top: 0,
        },
        duration: 500,
        maxZoom: 17,
        pitch: this.pitch,
      }
    )
  }

  public getMap() {
    return this.map
  }

  public getCurrentMapBoundary(): Bounds | null {
    if (!this.map) return null
    const bounds = this.map.getBounds()
    return {
      minLng: bounds.getWest(),
      minLat: bounds.getSouth(),
      maxLng: bounds.getEast(),
      maxLat: bounds.getNorth(),
    }
  }

  public getCurrentMapBoundsArray():
    | [[number, number], [number, number]]
    | null {
    const boundary = this.getCurrentMapBoundary()
    if (!boundary) return null
    return [
      [boundary.minLng, boundary.minLat],
      [boundary.maxLng, boundary.maxLat],
    ]
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
