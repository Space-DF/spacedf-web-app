import { Device } from '@/stores/device-store'
import MapLibreGL from 'maplibre-gl'
import isEqual from 'fast-deep-equal'
import { smoothMoveMarker } from '../../utils/marker'
import EventEmitter from '@/utils/event'
import MapInstance from '../map-instance'

const mapInstance = MapInstance.getInstance()
export class LocationMarker {
  private static instance: LocationMarker | undefined
  private map: MapLibreGL.Map | null = null
  private type: 'visible' | 'hidden' = 'hidden'
  private emitter: EventEmitter = new EventEmitter()
  private previousDevices: Device[] = []
  private devices: Device[] = []
  private locationMarkers: Record<string, MapLibreGL.Marker> = {}
  private focusedMarker: string = ''

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
    for (const marker of Object.values(this.locationMarkers)) {
      const el = marker.getElement()
      if (!el) continue

      if (this.type === 'visible') {
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
        this.emitter.emit('location-device-selected', {
          deviceId: device.id,
          deviceData: device,
        })
      }

      if (this.type === 'visible') {
        el.style.display = 'block'
      } else {
        el.style.display = 'none'
      }

      const marker = new MapLibreGL.Marker({
        element: el,
        anchor: 'center',
        pitchAlignment: 'viewport',
        rotationAlignment: 'viewport',
      })
        .setLngLat(position)
        .addTo(this.map)

      this.locationMarkers[device.id] = marker
    }
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

      // if (
      //   prevData?.deviceProperties?.direction !==
      //   newData?.deviceProperties?.direction
      // ) {
      //   const newDirection = newData.deviceProperties?.direction ?? 0
      //   const prevDirection = marker.getRotation() ?? 0
      //   smoothRotateMarker(marker, prevDirection, newDirection)
      //   marker.setRotation(newData.deviceProperties?.direction ?? 0)
      // }

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
        }

        smoothMoveMarker(marker, [oldLng, oldLat], [newLng, newLat])
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

  init(map: MapLibreGL.Map) {
    if (!map) return
    this.map = map
  }

  syncDevices(devices: Device[], type: 'visible' | 'hidden') {
    if (!this.map) return

    this.type = type

    this._handleMarkerVisible()

    //prevent unnecessary re-rendering
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
  }

  focusMarker(deviceId: string) {
    console.log('focusMarker', deviceId)
    this.focusedMarker = deviceId
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
