import { Device } from '@/stores/device-store'
import MapLibreGL from 'maplibre-gl'
import isEqual from 'fast-deep-equal'
import {
  smoothMoveMarker,
  smoothRotateMarker,
  smoothUpdateFocusDeviceSource,
} from '../../utils/marker'
import EventEmitter from '@/utils/event'
import MapInstance from '../map-instance'

const mapInstance = MapInstance.getInstance()
export class LocationMarker {
  private static instance: LocationMarker | undefined
  private map: MapLibreGL.Map | null = null
  private emitter: EventEmitter = new EventEmitter()
  private previousDevices: Device[] = []
  private devices: Device[] = []
  private locationMarkers: Record<string, MapLibreGL.Marker> = {}
  private visible = true
  private focusedMarker: string = ''
  private ungroupedDeviceIds: string[] = []
  private isInitialized: boolean = false

  private constructor() {}

  static getInstance() {
    if (!LocationMarker.instance) {
      LocationMarker.instance = new LocationMarker()
    }
    return LocationMarker.instance
  }

  on(event: string, handler: (...args: any[]) => void) {
    this.emitter.on(event, handler)
  }

  off(event: string, handler: (...args: any[]) => void) {
    this.emitter.off(event, handler)
  }

  private _handleMarkerVisible() {
    if (this.focusedMarker) {
      if (!this.ungroupedDeviceIds.includes(this.focusedMarker)) {
        this.clearFocus()
      } else {
        this.focusMarker(this.focusedMarker)
      }
    }

    for (const marker of Object.values(this.locationMarkers)) {
      const el = marker.getElement()
      const deviceId = el.getAttribute('data-device-id')
      if (!el || !deviceId) continue

      if (this.ungroupedDeviceIds.includes(deviceId)) {
        el.style.display = 'block'
      } else {
        el.style.display = 'none'
      }
    }
  }

  private _appendMarkers() {
    if (!this.map) return

    for (const device of this.devices) {
      if (this.locationMarkers?.[device.id]) continue

      const position = device.deviceProperties?.latest_checkpoint_arr ?? [0, 0]
      const el = document.createElement('div')
      el.className = `location-marker`
      el.id = `location-marker-${device.id}`

      el.setAttribute('data-device-id', device.id)

      el.onclick = () => {
        if (!this.ungroupedDeviceIds.includes(device.id)) return

        this.emitter.emit('location-device-selected', {
          deviceId: device.id,
          deviceData: device,
        })
      }

      const isVisible = this.ungroupedDeviceIds.includes(device.id)

      if (isVisible) {
        el.style.display = 'block'
      } else {
        el.style.display = 'none'
      }

      const marker = new MapLibreGL.Marker({
        element: el,
        anchor: 'center',
        pitchAlignment: 'viewport',
        rotationAlignment: 'map',
      })
        // .setRotation(device.deviceProperties?.direction ?? 0)
        .setLngLat(position)
        .addTo(this.map)

      this.locationMarkers[device.id] = marker
    }
  }

  hideAllMarkers() {
    if (!this.visible) return
    this.visible = false

    Object.values(this.locationMarkers).forEach((marker) => {
      const el = marker.getElement()
      if (!el) return

      el.classList.remove('fade-in')
      el.classList.add('fade-out')

      const timeoutId = setTimeout(() => {
        el.style.display = 'none'
        clearTimeout(timeoutId)
      }, 300)
    })
  }

  displayAllMarkers() {
    if (this.visible) return
    this.visible = true
    Object.values(this.locationMarkers).forEach((marker) => {
      const el = marker.getElement()
      if (!el) return

      el.classList.remove('fade-out')
      el.classList.add('fade-in')

      const timeoutId = setTimeout(() => {
        el.style.display = 'block'
        clearTimeout(timeoutId)
      }, 300)
    })
  }

  private _updateMarkers() {
    for (const marker of Object.values(this.locationMarkers)) {
      const detectDeviceId =
        marker.getElement().getAttribute('data-device-id') || ''

      const prevData = this.previousDevices.find(
        (device) => device.id === detectDeviceId
      )
      const newData = this.devices.find(
        (device) => device.id === detectDeviceId
      )

      const isEqualData = isEqual(prevData, newData)

      if (isEqualData || !prevData || !newData) continue

      if (
        prevData?.deviceProperties?.direction !==
        newData?.deviceProperties?.direction
      ) {
        const newDirection = newData.deviceProperties?.direction ?? 0
        const prevDirection = marker.getRotation() ?? 0
        smoothRotateMarker(marker, prevDirection, newDirection)
        marker.setRotation(newData.deviceProperties?.direction ?? 0)
      }

      if (
        !isEqual(
          prevData.deviceProperties?.latest_checkpoint_arr,
          newData.deviceProperties?.latest_checkpoint_arr
        )
      ) {
        const { lat: oldLat, lng: oldLng } = marker.getLngLat()
        const [newLng, newLat] = newData.deviceProperties
          ?.latest_checkpoint_arr ?? [0, 0]

        if (this.focusedMarker === newData.id) {
          const map = mapInstance.getMap()
          if (!map) return

          map.easeTo({
            center: [newLng, newLat],
            zoom: 18,
            duration: 500,
          })

          const isVisible = this.ungroupedDeviceIds.includes(newData.id)

          if (isVisible) {
            smoothUpdateFocusDeviceSource({
              map: this.map!,
              from: [oldLng, oldLat],
              to: [newLng, newLat],
              deviceId: newData.id,
              duration: 500,
            })
          }
        }

        smoothMoveMarker(marker, [oldLng, oldLat], [newLng, newLat], 500)
      }
    }
  }

  private _removeMarkers() {
    for (const marker of Object.values(this.locationMarkers)) {
      const detectDeviceId =
        marker.getElement().getAttribute('data-device-id') || ''

      const deviceNotExists = !this.devices.find(
        (device) => device.id === detectDeviceId
      )

      if (deviceNotExists) {
        marker.remove()
        delete this.locationMarkers[detectDeviceId]
      }
    }
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

  init(map: MapLibreGL.Map) {
    if (!map) return
    this.map = map
  }

  syncDevices(devices: Device[], allUngroupedDeviceIds: string[]) {
    const devicesIds = devices.map((device) => device.deviceId)

    const ungroupedDeviceIds = allUngroupedDeviceIds.filter((id) =>
      devicesIds.includes(id)
    )

    if (!this.isInitialized && !ungroupedDeviceIds.length) return

    if (this.focusedMarker) {
      this.focusMarker(this.focusedMarker)
    }

    this.ungroupedDeviceIds = ungroupedDeviceIds
    this._handleMarkerVisible()

    if (isEqual(this.devices, devices)) return

    const diffLength = devices.length - this.devices.length

    this.previousDevices = this.devices
    this.devices = devices

    if (diffLength > 0) {
      this._appendMarkers()
    } else if (diffLength < 0) {
      this._removeMarkers()
    }

    if (diffLength === 0) {
      this._updateMarkers()
    }

    this.isInitialized = true
  }

  focusMarker(deviceId: string) {
    const device = this.devices.find((device) => device.id === deviceId)

    if (!this.map || !device || !deviceId) return this.clearFocus()

    this.clearFocus()

    this.focusedMarker = deviceId
    this._ensurePulseAssets()

    const coordinates = device.deviceProperties?.latest_checkpoint_arr ?? [0, 0]

    this._updateFocusDeviceSource(deviceId, coordinates)
  }

  syncDeviceSelected(id: string) {
    this.focusedMarker = id
  }

  private _updateFocusDeviceSource(
    deviceId: string,
    coordinates: [number, number]
  ) {
    if (!this.map) return
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

  destroyLocationMarkers() {
    if (!this.map) return

    for (const marker of Object.values(this.locationMarkers)) {
      marker.remove()
    }
    this.locationMarkers = {}
    this.devices = []
  }
}
