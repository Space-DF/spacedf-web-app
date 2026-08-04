import type { GeoJSONSource, Map as MapLibreGLMap } from 'maplibre-gl'

import { cellToFeature, H3_RESOLUTION, resolutionRadius } from '@/utils/h3'

export const WATER_LEVEL_LAYER_IDS = {
  COVERAGE_FILL: 'water-coverage-fill',
  COVERAGE_LINE: 'water-coverage-line',
  COLUMN_BASE: 'water-column-base',
  COLUMN_SELECTED: 'water-column-selected',
  COLUMN_WATER: 'water-column-water',
  COLUMN_GLASS: 'water-column-glass',
}

const COVERAGE_SOURCE = 'water-coverage'
const COLUMN_SOURCE = 'water-column'

const REFERENCE_HEIGHT_M = 280
const COLUMN_ASPECT = REFERENCE_HEIGHT_M / resolutionRadius(H3_RESOLUTION)

const WATER_INSET = 0.82

const GLASS_OPACITY = 0.16

export type WaterZone = {
  deviceId: string
  cells: string[]
  color: string
}

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

const columnHeight = (resolution: number): number =>
  resolutionRadius(resolution) * COLUMN_ASPECT

const coverageData = (zones: WaterZone[]): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: zones.flatMap(({ deviceId, cells, color }) =>
    cells.map((h3) => cellToFeature(h3, { deviceId, color }))
  ),
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
  !!map.getSource(COVERAGE_SOURCE) && !!map.getSource(COLUMN_SOURCE)

export const syncWaterLevelLayers = (
  map: MapLibreGLMap,
  zones: WaterZone[],
  columns: WaterColumn[]
) => {
  if (!hasWaterLevelLayers(map)) {
    // `addWaterLevelLayers` throwing partway leaves sources behind that would
    // make the next call read as complete, so start from a clean slate.
    removeWaterLevelLayers(map)
    addWaterLevelLayers(map)
  }

  setSourceData(map, COVERAGE_SOURCE, coverageData(zones))
  setSourceData(map, COLUMN_SOURCE, columnData(columns))
}

export const removeWaterLevelLayers = (map: MapLibreGLMap) => {
  Object.values(WATER_LEVEL_LAYER_IDS).forEach((id) => {
    if (map.getLayer(id)) map.removeLayer(id)
  })
  ;[COVERAGE_SOURCE, COLUMN_SOURCE].forEach((id) => {
    if (map.getSource(id)) map.removeSource(id)
  })
}
