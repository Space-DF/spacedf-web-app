import MapLibreGL from 'maplibre-gl'

function lerpAngle(from: number, to: number, t: number) {
  const delta = ((to - from + 540) % 360) - 180
  return from + delta * t
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smoothMoveMarker(
  marker: MapLibreGL.Marker,
  from: [number, number],
  to: [number, number],
  duration = 500
) {
  const start = performance.now()

  function frame(now: number) {
    const t = Math.min((now - start) / duration, 1)

    const lng = lerp(from[0], to[0], t)
    const lat = lerp(from[1], to[1], t)

    marker.setLngLat([lng, lat])

    if (t < 1) {
      requestAnimationFrame(frame)
    }
  }

  requestAnimationFrame(frame)
}

function smoothRotateMarker(
  marker: mapboxgl.Marker,
  from: number,
  to: number,
  duration = 200
) {
  const start = performance.now()

  function frame(now: number) {
    const t = Math.min((now - start) / duration, 1)
    const angle = lerpAngle(from, to, t)

    marker.setRotation(angle)

    if (t < 1) {
      requestAnimationFrame(frame)
    }
  }

  requestAnimationFrame(frame)
}

export { smoothRotateMarker, smoothMoveMarker }
