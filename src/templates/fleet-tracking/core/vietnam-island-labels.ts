import type {
  ExpressionSpecification,
  FilterSpecification,
  Map as MapType,
  SymbolLayerSpecification,
} from 'maplibre-gl'
import {
  DISPUTED_ISLANDS,
  PARACELS_BBOX,
  SPRATLYS_BBOX,
  type BBox,
} from '@/utils/disputed-regions'

/**
 * Overrides the labels of the Hoàng Sa (Paracel) and Trường Sa (Spratly)
 * archipelagos so the Vietnamese names are shown instead of the Chinese
 * (or auto-transliterated) names baked into the upstream OpenStreetMap /
 * OpenMapTiles vector tiles (basemaps: OpenFreeMap positron + Carto dark,
 * both on the OpenMapTiles schema).
 *
 * The curated island list + regions live in `@/utils/disputed-regions` (shared
 * with the geocoding service). Two things happen on every style load:
 *   1. Every basemap label whose point falls inside the two archipelago
 *      regions is hidden — a GEOGRAPHIC filter (`within`), not a name list.
 *      OpenMapTiles derives `name:vi` from Wikidata, which for these disputed
 *      features is a China-POV administrative transliteration (e.g. 鸭公
 *      → "Xã khu Áp Công"), so no name blacklist can ever be complete. Hiding
 *      by region is exhaustive.
 *   2. A dedicated label layer with the curated Vietnamese names is added on
 *      top, positioned on the island shape the basemap actually draws.
 */

const OVERRIDE_SOURCE_ID = 'vn-island-labels'
const OVERRIDE_LAYER_ID = 'vn-island-labels-symbol'

const bboxRing = ([w, s, e, n]: BBox): number[][][] => [
  [
    [w, s],
    [e, s],
    [e, n],
    [w, n],
    [w, s],
  ],
]

// GeoJSON geometry fed to the `within` expression to mark the disputed regions.
const DISPUTED_REGIONS: GeoJSON.MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [bboxRing(PARACELS_BBOX), bboxRing(SPRATLYS_BBOX)],
}

// Three label tiers by `kind`:
//   'group'  — the two archipelagos, always visible.
//   'island' — emergent islands / cays, visible from zoom >= 6.
//   'reef'   — reefs, banks and shoals, visible from zoom >= 8 to avoid clutter.
const VIETNAM_ISLANDS: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: DISPUTED_ISLANDS.map((isl) => ({
    type: 'Feature',
    properties: { name: isl.name, kind: isl.kind },
    geometry: { type: 'Point', coordinates: [isl.lng, isl.lat] },
  })),
}

const isLabelLayer = (layer: { type: string; layout?: unknown }): boolean =>
  layer.type === 'symbol' && !!(layer.layout as any)?.['text-field']

// Hide every basemap label whose anchor point sits inside the disputed regions,
// so only our own Vietnamese overlay remains there. Uses `within` rather than a
// name blacklist, which is exhaustive and needs no maintenance.
const suppressLabelsInDisputedRegions = (map: MapType) => {
  const layers = map.getStyle().layers || []
  const exclusion = [
    '!',
    ['within', DISPUTED_REGIONS],
  ] as unknown as FilterSpecification

  for (const layer of layers) {
    if (layer.id === OVERRIDE_LAYER_ID) continue
    if (!isLabelLayer(layer)) continue

    const existing = map.getFilter(layer.id) as FilterSpecification | undefined

    // Try to AND the exclusion onto the existing filter. Legacy-style filters
    // can't be combined with an expression under `all`, so if that throws we
    // fall back to setting the exclusion on its own (still hides the names).
    try {
      const combined = (existing
        ? ['all', existing, exclusion]
        : exclusion) as unknown as FilterSpecification
      map.setFilter(layer.id, combined)
    } catch {
      try {
        map.setFilter(layer.id, exclusion)
      } catch {
        // Layer rejected even the standalone filter; leave it untouched.
      }
    }
  }
}

// Render every name label from its Latin / English field only. `name:latin`
// keeps local Latin names intact ("Hà Nội" stays "Hà Nội", "北京" → "Beijing").
// No fallback to raw `name`: features that carry only Han script (e.g. the
// seamount / reef labels 海山 / 海丘) render blank instead of Chinese.
const LATIN_TEXT_FIELD: ExpressionSpecification = [
  'coalesce',
  ['get', 'name:latin'],
  ['get', 'name:en'],
  '',
]

// Only touch layers whose current text-field is name-based, so we don't clobber
// road shields, house numbers, elevations, etc. that label from other fields.
const isNameLabelLayer = (layer: {
  type: string
  layout?: unknown
}): boolean => {
  if (!isLabelLayer(layer)) return false
  const textField = (layer.layout as any)?.['text-field']
  return JSON.stringify(textField ?? '').includes('name')
}

const preferLatinLabels = (map: MapType) => {
  const layers = map.getStyle().layers || []

  for (const layer of layers) {
    if (layer.id === OVERRIDE_LAYER_ID) continue
    if (!isNameLabelLayer(layer)) continue

    try {
      map.setLayoutProperty(layer.id, 'text-field', LATIN_TEXT_FIELD)
    } catch {
      // Layer's text-field couldn't be overridden; leave it as-is.
    }
  }
}

const addVietnameseLabels = (map: MapType, theme: 'dark' | 'light') => {
  if (!map.getSource(OVERRIDE_SOURCE_ID)) {
    map.addSource(OVERRIDE_SOURCE_ID, {
      type: 'geojson',
      data: VIETNAM_ISLANDS,
    })
  }

  if (map.getLayer(OVERRIDE_LAYER_ID)) return

  const textColor = theme === 'dark' ? '#e5e7eb' : '#3b3b3b'
  const haloColor = theme === 'dark' ? '#1f1f1f' : '#ffffff'

  const kind: ExpressionSpecification = ['get', 'kind']

  const layer: SymbolLayerSpecification = {
    id: OVERRIDE_LAYER_ID,
    type: 'symbol',
    source: OVERRIDE_SOURCE_ID,
    // Groups always draw; islands appear from zoom >= 6, reefs from zoom >= 8,
    // so the sea isn't cluttered when zoomed out.
    filter: [
      'any',
      ['==', kind, 'group'],
      ['all', ['==', kind, 'island'], ['>=', ['zoom'], 6]],
      ['all', ['==', kind, 'reef'], ['>=', ['zoom'], 8]],
    ] as FilterSpecification,
    layout: {
      'text-field': ['get', 'name'],
      'text-size': ['match', kind, 'group', 15, 'island', 12, 10],
      'text-font': ['Noto Sans Italic', 'Open Sans Italic'],
      'text-max-width': 8,
      'text-allow-overlap': false,
      // Đảo Ba Bình wins every collision, then groups, islands, reefs.
      'symbol-sort-key': [
        'case',
        ['==', ['get', 'name'], 'Đảo Ba Bình'],
        -1,
        ['match', kind, 'group', 0, 'island', 1, 2],
      ],
    },
    paint: {
      'text-color': textColor,
      'text-halo-color': haloColor,
      'text-halo-width': 1.4,
    },
  }

  try {
    map.addLayer(layer)
  } catch {
    // Fall back to default fonts if the style's glyphs lack the italic set.
    map.addLayer({
      ...layer,
      layout: { ...layer.layout, 'text-font': undefined as any },
    })
  }
}

export const applyVietnamIslandLabels = (
  map: MapType,
  theme: 'dark' | 'light'
) => {
  // Called from the map's `style.load` handler, so the style JSON + layers are
  // already present. Don't gate on `isStyleLoaded()` — it can still report
  // false here (sprites/tiles pending) and would skip the whole override.
  if (!map.getStyle()) return

  preferLatinLabels(map)
  suppressLabelsInDisputedRegions(map)
  addVietnameseLabels(map, theme)
}
