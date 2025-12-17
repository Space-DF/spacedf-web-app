import mapboxgl from 'mapbox-gl'
import { Device } from '@/stores/device-store'
import EventEmitter from '../../event'

type MarkerAnim = {
  marker: mapboxgl.Marker
  from: mapboxgl.LngLat
  to: mapboxgl.LngLat
  start: number
  duration: number
  easing: (t: number) => number
}

let activeAnimations: MarkerAnim[] = []
let rafId: number | null = null

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function animateAllMarkers() {
  const now = performance.now()
  const remaining: MarkerAnim[] = []

  for (const anim of activeAnimations) {
    const el = anim.marker.getElement?.()
    if (!el || !el.isConnected) continue

    const t = Math.min((now - anim.start) / anim.duration, 1)
    const progress = anim.easing(t)

    const lng = anim.from.lng + (anim.to.lng - anim.from.lng) * progress
    const lat = anim.from.lat + (anim.to.lat - anim.from.lat) * progress

    anim.marker.setLngLat([lng, lat])

    if (t < 1) remaining.push(anim)
  }

  activeAnimations = remaining
  if (activeAnimations.length > 0) {
    rafId = requestAnimationFrame(animateAllMarkers)
  } else {
    rafId = null
  }
}

export function queueMarkerAnimation(
  marker: mapboxgl.Marker,
  from: mapboxgl.LngLat,
  to: mapboxgl.LngLat,
  duration = 400,
  easing: (t: number) => number = easeInOutQuad
) {
  activeAnimations = activeAnimations.filter((a) => a.marker !== marker)

  activeAnimations.push({
    marker,
    from,
    to,
    start: performance.now(),
    duration,
    easing,
  })

  if (!rafId) {
    rafId = requestAnimationFrame(animateAllMarkers)
  }
}

export function stopMarkerAnimation(marker: mapboxgl.Marker) {
  activeAnimations = activeAnimations.filter((a) => a.marker !== marker)
}

export function stopAllAnimations() {
  activeAnimations = []
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

class MarkerInstance {
  private static instance: MarkerInstance | undefined
  private map: mapboxgl.Map | null = null
  private markers: Record<string, mapboxgl.Marker> = {}
  private visible = true
  private emitter = new EventEmitter()
  private focusedMarker: string | null = null

  on(event: string, handler: (...args: any[]) => void) {
    this.emitter.on(event, handler)
  }

  off(event: string, handler: (...args: any[]) => void) {
    this.emitter.off(event, handler)
  }

  private constructor() {}

  static getInstance() {
    if (!MarkerInstance.instance) {
      MarkerInstance.instance = new MarkerInstance()
    }
    return MarkerInstance.instance
  }

  init(map: mapboxgl.Map) {
    this.map = map
  }

  syncDevices(devices: Record<string, Device>) {
    if (!this.map) return

    for (const id of Object.keys(this.markers)) {
      if (!devices[id]) {
        stopMarkerAnimation(this.markers[id])
        this.markers[id].remove()
        delete this.markers[id]
      }
    }

    Object.values(devices).forEach((device) => {
      const [lng, lat] = device.deviceProperties?.latest_checkpoint_arr ?? [
        null,
        null,
      ]
      if (lng == null || lat == null) return

      const existing = this.markers[device.id]
      const newPos = new mapboxgl.LngLat(lng, lat)

      if (existing) {
        const oldPos = existing.getLngLat()

        if (oldPos.lng !== newPos.lng || oldPos.lat !== newPos.lat) {
          queueMarkerAnimation(existing, oldPos, newPos, 1000)

          if (this.focusedMarker === device.id) {
            this.map?.easeTo({
              center: newPos,
              zoom: 18,
              duration: 500,
              essential: true,
              pitch: 0,
            })
          }
        }
      } else {
        const el = document.createElement('div')
        el.className = `${device.type}-marker`
        el.id = `marker-${device.id}`
        el.style.opacity = '0'
        el.style.transition = 'opacity 0.3s ease'
        el.onclick = () => {
          this.emitter.emit('marker-click', device.id)
        }

        const marker = new mapboxgl.Marker(el, {
          anchor: 'center',
          pitchAlignment: 'viewport',
          rotationAlignment: 'viewport',
        })
          .setLngLat(newPos)
          .addTo(this.map!)

        this.markers[device.id] = marker

        requestAnimationFrame(() => {
          el.style.opacity = '1'
        })
      }
    })
  }

  displayAllMarkers() {
    if (this.visible) return
    this.visible = true

    Object.values(this.markers).forEach((marker) => {
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

  hideAllMarkers() {
    if (!this.visible) return
    this.visible = false

    Object.values(this.markers).forEach((marker) => {
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

  focusMarker(id: string) {
    this.focusedMarker = id
  }

  clearFocusMarker() {
    this.focusedMarker = null
  }

  getMarker(id: string) {
    return this.markers[id]
  }

  clearAll() {
    for (const id of Object.keys(this.markers)) {
      stopMarkerAnimation(this.markers[id])
      this.markers[id].remove()
    }
    this.markers = {}
  }

  remove() {
    if (!this.map) return

    stopAllAnimations()
    Object.values(this.markers).forEach((marker) => {
      stopMarkerAnimation(marker)
      marker.remove()
    })

    this.markers = {}
  }
}

export { MarkerInstance }
