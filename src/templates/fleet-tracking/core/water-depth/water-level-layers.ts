import type { GeoJSONSource, Map as MapLibreGLMap } from 'maplibre-gl'

import {
  cellAncestors,
  cellChildren,
  cellResolution,
  cellsToOutline,
  cellToFeature,
  H3_RESOLUTION,
  resolutionRadius,
} from '@/utils/h3'

export const WATER_LEVEL_LAYER_IDS = {
  COVERAGE_FILL: 'water-coverage-fill',
  COVERAGE_LINE: 'water-coverage-line',
  COVERAGE_OUTLINE: 'water-coverage-outline',
  COLUMN_BASE: 'water-column-base',
  COLUMN_SELECTED: 'water-column-selected',
  COLUMN_WATER: 'water-column-water',
  COLUMN_GLASS: 'water-column-glass',
}

const COVERAGE_SOURCE = 'water-coverage'
const OUTLINE_SOURCE = 'water-coverage-outline'
const COLUMN_SOURCE = 'water-column'

const REFERENCE_HEIGHT_M = 280
const COLUMN_ASPECT = REFERENCE_HEIGHT_M / resolutionRadius(H3_RESOLUTION)

const WATER_INSET = 0.82

const OUTLINE_WIDTH = 3

const GLASS_OPACITY = 0.16

const MAX_CELL_SPLIT_DEPTH = 2

export type WaterZone = {
  deviceId: string
  cells: string[]
  color: string
}

/** A zone paired with the reading that decides which area wins an overlap. */
export type RankedWaterZone = WaterZone & { severity: number }

export type WaterColumn = {
  deviceId: string
  h3: string
  resolution: number
  color: string
  fill: number
  depth: number
  selected: boolean
}

const EMPTY_DATA: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
}

export const columnHeight = (resolution: number): number =>
  resolutionRadius(resolution) * COLUMN_ASPECT

/** Cells of one area all come from a single cut, so one of them names the whole zone. */
const zoneResolution = (zone: RankedWaterZone): number =>
  zone.cells.length ? cellResolution(zone.cells[0]) : H3_RESOLUTION

/**
 * Two areas covering the same ground would blend their half-transparent fills
 * into a colour that belongs to neither, so every cell is painted once — by the
 * deepest reading covering it. The returned zones are ordered deepest last,
 * which is the order MapLibre draws them in, keeping the most dangerous area on
 * top wherever geometry still overlaps at the edges.
 */
export const resolveZoneOverlaps = (zones: RankedWaterZone[]): WaterZone[] => {
  const claimed = new Set<string>()
  /** Cell -> finest resolution a claimed cell sits at inside it. */
  const claimedWithin = new Map<string, number>()

  // Areas cut at the same resolution share cell ids, so overlaps are exact and
  // the walk up the parent chain is only worth paying for when they differ.
  const mixedResolutions = new Set(zones.map(zoneResolution)).size > 1

  const claim = (h3: string): string[] => {
    if (claimed.has(h3)) return []

    if (!mixedResolutions) {
      claimed.add(h3)
      return [h3]
    }

    const ancestors = cellAncestors(h3)
    if (ancestors.some((ancestor) => claimed.has(ancestor))) return []

    const finest = claimedWithin.get(h3)
    if (finest !== undefined) {
      const depth = finest - cellResolution(h3)
      // Past a couple of levels the split costs more cells than the overlap is
      // worth, so the coarse cell is kept whole and simply drawn underneath.
      if (depth > MAX_CELL_SPLIT_DEPTH) return [h3]

      return cellChildren(h3, finest).flatMap(claim)
    }

    claimed.add(h3)
    const resolution = cellResolution(h3)
    ancestors.forEach((ancestor) =>
      claimedWithin.set(
        ancestor,
        Math.max(claimedWithin.get(ancestor) ?? resolution, resolution)
      )
    )

    return [h3]
  }

  return [...zones]
    .sort((a, b) => b.severity - a.severity)
    .map(({ deviceId, cells, color }) => ({
      deviceId,
      color,
      cells: cells.flatMap(claim),
    }))
    .filter((zone) => zone.cells.length)
    .reverse()
}

const coverageData = (zones: WaterZone[]): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: zones.flatMap(({ deviceId, cells, color }) =>
    cells.map((h3) => cellToFeature(h3, { deviceId, color }))
  ),
})

/** One outline per highlighted zone, tracing where its cells meet open ground. */
const outlineData = (
  zones: WaterZone[],
  highlighted: Set<string>
): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: zones
    .filter(({ deviceId }) => highlighted.has(deviceId))
    .map(({ deviceId, cells, color }) => ({
      type: 'Feature',
      properties: { deviceId, color },
      geometry: { type: 'MultiPolygon', coordinates: cellsToOutline(cells) },
    })),
})

const columnData = (columns: WaterColumn[]): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: columns.flatMap(
    ({ deviceId, h3, resolution, color, fill, depth, selected }) => {
      const height = columnHeight(resolution)

      return [
        cellToFeature(h3, {
          kind: 'tube',
          deviceId,
          color,
          depth,
          selected,
          height,
        }),
        cellToFeature(
          h3,
          { kind: 'water', deviceId, color, depth, height: fill * height },
          WATER_INSET
        ),
      ]
    }
  ),
})

const setSourceData = (
  map: MapLibreGLMap,
  sourceId: string,
  data: GeoJSON.FeatureCollection
) => {
  const source = map.getSource<GeoJSONSource>(sourceId)
  source?.setData(data)
}

const addWaterLevelLayers = (map: MapLibreGLMap) => {
  map.addSource(COVERAGE_SOURCE, { type: 'geojson', data: EMPTY_DATA })
  map.addLayer({
    id: WATER_LEVEL_LAYER_IDS.COVERAGE_FILL,
    type: 'fill',
    source: COVERAGE_SOURCE,
    paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.5 },
  })
  map.addLayer({
    id: WATER_LEVEL_LAYER_IDS.COVERAGE_LINE,
    type: 'line',
    source: COVERAGE_SOURCE,
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 1,
      'line-opacity': 0.8,
    },
  })

  map.addSource(OUTLINE_SOURCE, { type: 'geojson', data: EMPTY_DATA })
  map.addLayer({
    id: WATER_LEVEL_LAYER_IDS.COVERAGE_OUTLINE,
    type: 'line',
    source: OUTLINE_SOURCE,
    layout: { 'line-join': 'round' },
    paint: { 'line-color': ['get', 'color'], 'line-width': OUTLINE_WIDTH },
  })

  map.addSource(COLUMN_SOURCE, { type: 'geojson', data: EMPTY_DATA })
  map.addLayer({
    id: WATER_LEVEL_LAYER_IDS.COLUMN_BASE,
    type: 'fill',
    source: COLUMN_SOURCE,
    filter: ['==', ['get', 'kind'], 'tube'],
    paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.95 },
  })
  map.addLayer({
    id: WATER_LEVEL_LAYER_IDS.COLUMN_SELECTED,
    type: 'line',
    source: COLUMN_SOURCE,
    filter: [
      'all',
      ['==', ['get', 'kind'], 'tube'],
      ['boolean', ['get', 'selected'], false],
    ],
    layout: { 'line-join': 'round' },
    paint: { 'line-color': ['get', 'color'], 'line-width': 3 },
  })
  map.addLayer({
    id: WATER_LEVEL_LAYER_IDS.COLUMN_WATER,
    type: 'fill-extrusion',
    source: COLUMN_SOURCE,
    filter: ['==', ['get', 'kind'], 'water'],
    paint: {
      'fill-extrusion-color': ['get', 'color'],
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': 0.85,
    },
  })
  map.addLayer({
    id: WATER_LEVEL_LAYER_IDS.COLUMN_GLASS,
    type: 'fill-extrusion',
    source: COLUMN_SOURCE,
    filter: ['==', ['get', 'kind'], 'tube'],
    paint: {
      'fill-extrusion-color': ['get', 'color'],
      'fill-extrusion-height': ['get', 'height'],
      'fill-extrusion-base': 0,
      'fill-extrusion-opacity': GLASS_OPACITY,
      'fill-extrusion-vertical-gradient': false,
    },
  })
}

const hasWaterLevelLayers = (map: MapLibreGLMap): boolean =>
  !!map.getSource(COVERAGE_SOURCE) &&
  !!map.getSource(OUTLINE_SOURCE) &&
  !!map.getSource(COLUMN_SOURCE)

export const syncWaterLevelLayers = (
  map: MapLibreGLMap,
  zones: WaterZone[],
  columns: WaterColumn[],
  highlighted: Set<string>
) => {
  if (!hasWaterLevelLayers(map)) {
    // `addWaterLevelLayers` throwing partway leaves sources behind that would
    // make the next call read as complete, so start from a clean slate.
    removeWaterLevelLayers(map)
    addWaterLevelLayers(map)
  }

  setSourceData(map, COVERAGE_SOURCE, coverageData(zones))
  setSourceData(map, OUTLINE_SOURCE, outlineData(zones, highlighted))
  setSourceData(map, COLUMN_SOURCE, columnData(columns))
}

/** Redraws the outlines alone, so pointing at a zone leaves the rest be. */
export const syncCoverageHighlight = (
  map: MapLibreGLMap,
  zones: WaterZone[],
  highlighted: Set<string>
) => {
  if (!hasWaterLevelLayers(map)) return

  setSourceData(map, OUTLINE_SOURCE, outlineData(zones, highlighted))
}

export const removeWaterLevelLayers = (map: MapLibreGLMap) => {
  Object.values(WATER_LEVEL_LAYER_IDS).forEach((id) => {
    if (map.getLayer(id)) map.removeLayer(id)
  })
  ;[COVERAGE_SOURCE, OUTLINE_SOURCE, COLUMN_SOURCE].forEach((id) => {
    if (map.getSource(id)) map.removeSource(id)
  })
}
