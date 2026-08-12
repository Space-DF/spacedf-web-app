import {
  cellArea,
  cellToBoundary,
  cellToChildren,
  cellToLatLng,
  cellToParent,
  getHexagonAreaAvg,
  getHexagonEdgeLengthAvg,
  getResolution,
  isValidCell,
  latLngToCell,
  polygonToCells,
} from 'h3-js'

import { MonitoringArea } from '@/types/device'

type H3Bounds = {
  west: number
  south: number
  east: number
  north: number
}

export const H3_RESOLUTION = 10

const CELL_SIZE_RESOLUTIONS = [8, 9, 10, 11, 12, 13] as const

const MAX_CELLS_PER_AREA = 8000

const EARTH_RADIUS_M = 6371008.8

const toRadians = (degrees: number) => (degrees * Math.PI) / 180

/** Average edge length of a hexagon at `resolution`, in metres. */
export const resolutionRadius = (resolution: number): number =>
  getHexagonEdgeLengthAvg(resolution, 'm')

const resolutionArea = (resolution: number, at?: [number, number]): number =>
  at
    ? cellArea(latLngToCell(at[1], at[0], resolution), 'm2')
    : getHexagonAreaAvg(resolution, 'm2')

export const radiusToResolution = (radius: number): number => {
  if (!Number.isFinite(radius) || radius <= 0) return H3_RESOLUTION

  return CELL_SIZE_RESOLUTIONS.reduce((closest, resolution) =>
    Math.abs(resolutionRadius(resolution) - radius) <
    Math.abs(resolutionRadius(closest) - radius)
      ? resolution
      : closest
  )
}

/** The resolution a cell was cut at, which `areaToCells` may have coarsened. */
export const cellResolution = (h3: string): number => getResolution(h3)

/** The cells that tile `h3` at the finer `resolution`. */
export const cellChildren = (h3: string, resolution: number): string[] =>
  cellToChildren(h3, resolution)

/** The coarser cells containing `h3`, down to the coarsest resolution areas are cut at. */
export const cellAncestors = (h3: string): string[] => {
  const ancestors: string[] = []

  for (
    let resolution = getResolution(h3) - 1;
    resolution >= CELL_SIZE_RESOLUTIONS[0];
    resolution--
  ) {
    ancestors.push(cellToParent(h3, resolution))
  }

  return ancestors
}

export const cellCenter = (h3: string): [number, number] => {
  const [lat, lng] = cellToLatLng(h3)
  return [lng, lat]
}

export const pointToCell = (
  lng: number,
  lat: number,
  resolution: number = H3_RESOLUTION
): string => latLngToCell(lat, lng, resolution)

export const cellToFeature = <P extends GeoJSON.GeoJsonProperties>(
  h3: string,
  properties: P,
  scale = 1
): GeoJSON.Feature<GeoJSON.Polygon, P> => {
  const boundary = cellToBoundary(h3, true)
  boundary.push(boundary[0])

  const [centerLng, centerLat] = cellCenter(h3)
  const ring =
    scale === 1
      ? boundary
      : boundary.map(([lng, lat]) => [
          centerLng + (lng - centerLng) * scale,
          centerLat + (lat - centerLat) * scale,
        ])

  return {
    type: 'Feature',
    properties,
    geometry: { type: 'Polygon', coordinates: [ring] },
  }
}

const envelope = (rings: number[][][]): H3Bounds | null => {
  let west = Infinity
  let south = Infinity
  let east = -Infinity
  let north = -Infinity

  for (const ring of rings) {
    for (const [lng, lat] of ring) {
      if (lng < west) west = lng
      if (lng > east) east = lng
      if (lat < south) south = lat
      if (lat > north) north = lat
    }
  }

  return Number.isFinite(west) ? { west, south, east, north } : null
}

const areaBounds = (
  area: MonitoringArea | null | undefined
): H3Bounds | null =>
  area ? envelope(area.flatMap((polygon) => polygon)) : null

export const areaCenter = (
  area: MonitoringArea | null | undefined
): [number, number] | null => {
  const bounds = areaBounds(area)
  if (!bounds) return null

  return [(bounds.west + bounds.east) / 2, (bounds.south + bounds.north) / 2]
}

/** Signed spherical excess of one ring, so holes subtract from their polygon. */
const ringArea = (ring: number[][]): number => {
  if (ring.length < 4) return 0

  let total = 0
  for (let index = 0; index < ring.length - 1; index++) {
    const [lng1, lat1] = ring[index]
    const [lng2, lat2] = ring[index + 1]
    total +=
      (toRadians(lng2) - toRadians(lng1)) *
      (2 + Math.sin(toRadians(lat1)) + Math.sin(toRadians(lat2)))
  }

  return (total * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2
}

const areaSquareMetres = (area: MonitoringArea | null | undefined): number =>
  area
    ? Math.abs(
        area.reduce(
          (total, polygon) =>
            total + polygon.reduce((sum, ring) => sum + ringArea(ring), 0),
          0
        )
      )
    : 0

const segmentLength = (
  [lng1, lat1]: number[],
  [lng2, lat2]: number[]
): number => {
  const midLat = toRadians((lat1 + lat2) / 2)
  const x = toRadians(lng2 - lng1) * Math.cos(midLat)
  const y = toRadians(lat2 - lat1)

  return Math.hypot(x, y) * EARTH_RADIUS_M
}

/**
 * The API stores a monitoring area as the union of the hexagons the user
 * picked, which drops the resolution it was drawn at. Every segment of that
 * union is one hexagon edge, so the segment lengths recover the edge length —
 * and with it the resolution needed to cut the area back into cells. The median
 * is what makes this safe: rounded coordinates and collinear points leave a few
 * degenerate segments that would drag a plain minimum down to a far finer
 * resolution than was ever drawn.
 */
export const inferResolution = (
  area: MonitoringArea | null | undefined
): number => {
  if (!area) return H3_RESOLUTION

  const lengths: number[] = []
  for (const polygon of area) {
    for (const ring of polygon) {
      for (let index = 0; index < ring.length - 1; index++) {
        const length = segmentLength(ring[index], ring[index + 1])
        if (length > 0) lengths.push(length)
      }
    }
  }

  if (!lengths.length) return H3_RESOLUTION

  lengths.sort((a, b) => a - b)

  return radiusToResolution(lengths[Math.floor(lengths.length / 2)])
}

/**
 * Falls back to coarser cells when the area is too large to draw at
 * `resolution`, so an oversized zone still renders instead of vanishing.
 */
const fittingResolution = (
  area: MonitoringArea,
  resolution: number
): number | null => {
  const center = areaCenter(area)
  if (!center) return resolution

  const squareMetres = areaSquareMetres(area)

  for (
    let candidate = resolution;
    candidate >= CELL_SIZE_RESOLUTIONS[0];
    candidate--
  ) {
    const cellCount = squareMetres / resolutionArea(candidate, center)
    if (cellCount <= MAX_CELLS_PER_AREA) return candidate
  }

  return null
}

export const areaToCells = (
  area: MonitoringArea | null | undefined,
  resolution: number = H3_RESOLUTION
): string[] => {
  if (!area) return []

  const drawResolution = fittingResolution(area, resolution)
  if (drawResolution === null) return []

  const cells = new Set<string>()
  for (const polygon of area) {
    if (!polygon.length) continue

    try {
      polygonToCells(polygon, drawResolution, true).forEach((h3) =>
        cells.add(h3)
      )
    } catch {
      continue
    }
  }

  return Array.from(cells).filter(isValidCell)
}
