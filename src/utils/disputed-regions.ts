/**
 * Single source of truth for the Hoàng Sa (Paracel) and Trường Sa (Spratly)
 * archipelagos. Consumed by:
 *   - the map label override (`vietnam-island-labels.ts`) — draws the Vietnamese
 *     names and hides upstream basemap labels inside these regions;
 *   - the geocoding service (`map-geocoding.ts`) — resolves Vietnamese island
 *     queries locally (search) and rewrites result addresses to the correct
 *     Vietnamese administrative units (reverse-geocode display).
 *
 * Keeping one curated list here means the islands are maintained in exactly one
 * place; no global geocoder (MapTiler, Goong, …) is relied on for these names.
 */

export type LngLat = [number, number]
// [minLng, minLat, maxLng, maxLat]
export type BBox = [number, number, number, number]
export type DisputedRegion = 'paracels' | 'spratlys'
export type IslandKind = 'group' | 'island' | 'reef'

export interface DisputedIsland {
  name: string
  kind: IslandKind
  lng: number
  lat: number
}

// Both boxes sit over open sea only: the Paracels box stays south of Hainan
// (~18.1°N) and east of the Vietnamese coast; the Spratlys box is capped at
// 116.4°E / 7.2°N so it never reaches Palawan, Balabac or Sabah — otherwise
// legitimate Philippine / Malaysian places would be caught too.
export const PARACELS_BBOX: BBox = [110.8, 15.4, 113.2, 17.4]
export const SPRATLYS_BBOX: BBox = [111.0, 7.2, 116.4, 12.3]

const COUNTRY = 'Việt Nam'

export const REGION_ADMIN: Record<
  DisputedRegion,
  { district: string; province: string }
> = {
  paracels: { district: 'Hoàng Sa', province: 'Đà Nẵng' },
  spratlys: { district: 'Trường Sa', province: 'Khánh Hòa' },
}

// Coordinates are snapped to the matching OSM feature (via its international
// name), so labels sit on the island shape the basemap actually draws. Good to
// a few hundred metres — for placing a name, not for navigation.
export const DISPUTED_ISLANDS: DisputedIsland[] = [
  { name: 'Quần đảo Hoàng Sa', kind: 'group', lng: 112.0, lat: 16.5 },
  { name: 'Quần đảo Trường Sa', kind: 'group', lng: 114.0, lat: 9.5 },
  { name: 'Đảo Phú Lâm', kind: 'island', lng: 112.3409, lat: 16.8341 },
  { name: 'Đảo Linh Côn', kind: 'island', lng: 112.7304, lat: 16.6673 },
  { name: 'Đảo Cây', kind: 'island', lng: 112.2701, lat: 16.978 },
  { name: 'Đảo Ba Ba', kind: 'island', lng: 111.686462, lat: 16.566514 },
  { name: 'Đảo Bạch Quy', kind: 'island', lng: 111.7617, lat: 16.056 },
  { name: 'Bãi Xà Cừ', kind: 'island', lng: 111.7042, lat: 16.5793 },
  { name: 'Cồn Cát Tây', kind: 'reef', lng: 112.2, lat: 16.95 },
  { name: 'Đảo Hoàng Sa', kind: 'island', lng: 111.6071, lat: 16.5333 },
  { name: 'Đảo Hữu Nhật', kind: 'island', lng: 111.5855, lat: 16.5056 },
  { name: 'Đảo Quang Ảnh', kind: 'island', lng: 111.507, lat: 16.4473 },
  { name: 'Đảo Duy Mộng', kind: 'island', lng: 111.7416, lat: 16.4633 },
  { name: 'Đảo Quang Hòa', kind: 'island', lng: 111.708, lat: 16.4528 },
  { name: 'Đảo Tri Tôn', kind: 'island', lng: 111.2032, lat: 15.7855 },
  { name: 'Đảo Ốc Hoa', kind: 'island', lng: 111.6729, lat: 16.5745 },
  { name: 'Đá Chim Én', kind: 'reef', lng: 111.68, lat: 16.35 },
  { name: 'Đảo Trường Sa', kind: 'island', lng: 111.9202, lat: 8.6451 },
  { name: 'Đảo Song Tử Tây', kind: 'island', lng: 114.3313, lat: 11.4288 },
  { name: 'Đảo Nam Yết', kind: 'island', lng: 114.3591, lat: 10.1811 },
  { name: 'Đảo Sinh Tồn', kind: 'island', lng: 114.333, lat: 9.883 },
  { name: 'Đảo Sơn Ca', kind: 'island', lng: 114.4799, lat: 10.3755 },
  { name: 'Đảo An Bang', kind: 'island', lng: 112.9216, lat: 7.8921 },
  { name: 'Đảo Phan Vinh', kind: 'island', lng: 113.7028, lat: 8.9721 },
  { name: 'Đảo Trường Sa Đông', kind: 'island', lng: 112.3502, lat: 8.9298 },
  { name: 'Đảo Sinh Tồn Đông', kind: 'island', lng: 114.564, lat: 9.9037 },
  { name: 'Đá Tây', kind: 'reef', lng: 112.2234, lat: 8.8619 },
  { name: 'Đá Thị', kind: 'reef', lng: 114.63, lat: 10.4 },
  { name: 'Đá Lớn', kind: 'reef', lng: 113.8556, lat: 10.0603 },
  { name: 'Đá Lát', kind: 'reef', lng: 111.6716, lat: 8.6706 },
  { name: 'Đá Đông', kind: 'reef', lng: 112.6044, lat: 8.8249 },
  { name: 'Đá Tốc Tan', kind: 'reef', lng: 113.9783, lat: 8.8062 },
  { name: 'Đá Núi Le', kind: 'reef', lng: 114.1828, lat: 8.7154 },
  { name: 'Đá Tiên Nữ', kind: 'reef', lng: 114.6599, lat: 8.8556 },
  { name: 'Đá Thuyền Chài', kind: 'reef', lng: 113.2934, lat: 8.1788 },
  { name: 'Đá Cô Lin', kind: 'reef', lng: 114.24, lat: 9.73 },
  { name: 'Đá Len Đao', kind: 'reef', lng: 114.33, lat: 9.78 },
  { name: 'Đá Núi Thị', kind: 'reef', lng: 114.42, lat: 10.38 },
  { name: 'Đá Chữ Thập', kind: 'reef', lng: 112.889, lat: 9.55 },
  { name: 'Đá Gạc Ma', kind: 'reef', lng: 114.2827, lat: 9.7205 },
  { name: 'Đá Xu Bi', kind: 'reef', lng: 114.0861, lat: 10.9232 },
  { name: 'Đá Vành Khăn', kind: 'reef', lng: 115.53, lat: 9.9 },
  { name: 'Đá Châu Viên', kind: 'reef', lng: 112.829, lat: 8.8653 },
  { name: 'Đá Ga Ven', kind: 'reef', lng: 114.2244, lat: 10.2072 },
  { name: 'Đá Tư Nghĩa', kind: 'reef', lng: 114.5, lat: 9.92 },
  { name: 'Đảo Ba Bình', kind: 'island', lng: 114.3652, lat: 10.3757 },
  { name: 'Bãi Bàn Than', kind: 'reef', lng: 114.4131, lat: 10.3854 },
  { name: 'Đảo Song Tử Đông', kind: 'island', lng: 114.3545, lat: 11.4526 },
  { name: 'Đảo Thị Tứ', kind: 'island', lng: 114.2836, lat: 11.0533 },
  { name: 'Đảo Loại Ta', kind: 'island', lng: 114.4235, lat: 10.6673 },
  { name: 'Đảo Bến Lạc', kind: 'island', lng: 115.0242, lat: 11.0815 },
  { name: 'Đảo Bình Nguyên', kind: 'island', lng: 115.8226, lat: 10.8165 },
  { name: 'Đảo Vĩnh Viễn', kind: 'island', lng: 115.8031, lat: 10.7326 },
  { name: 'Đá Công Đo', kind: 'reef', lng: 115.2222, lat: 8.3681 },
  { name: 'Bãi Cỏ Mây', kind: 'reef', lng: 115.87, lat: 9.72 },
  { name: 'Đá Loại Ta Tây', kind: 'reef', lng: 114.32, lat: 10.72 },
  { name: 'Đá Hoa Lau', kind: 'reef', lng: 113.8207, lat: 7.3745 },
  { name: 'Đá Kỳ Vân', kind: 'reef', lng: 113.915, lat: 7.9701 },
  { name: 'Đá Kiệu Ngựa', kind: 'reef', lng: 114.0456, lat: 7.6721 },
  { name: 'Đá Dallas', kind: 'reef', lng: 113.78, lat: 7.55 },
  { name: 'Đá Erica', kind: 'reef', lng: 114.1337, lat: 8.1064 },
]

const inBBox = (
  lng: number,
  lat: number,
  [minLng, minLat, maxLng, maxLat]: BBox
): boolean => lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat

/**
 * Which disputed region a coordinate falls in, or `null`. Derived purely from
 * the coordinate — the reliable signal, unlike a geocoder's (often China-biased)
 * place name.
 */
export const regionByCoords = (
  lng: number,
  lat: number
): DisputedRegion | null => {
  if (inBBox(lng, lat, PARACELS_BBOX)) return 'paracels'
  if (inBBox(lng, lat, SPRATLYS_BBOX)) return 'spratlys'
  return null
}

export const distanceKm = (
  [lng1, lat1]: LngLat,
  [lng2, lat2]: LngLat
): number => {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

/** Nearest emergent island / reef (never a `group` centroid) within `maxKm`. */
export const nearestIsland = (
  lng: number,
  lat: number,
  maxKm = 8
): DisputedIsland | null => {
  let best: DisputedIsland | null = null
  let bestKm = Infinity
  for (const isl of DISPUTED_ISLANDS) {
    if (isl.kind === 'group') continue
    const km = distanceKm([lng, lat], [isl.lng, isl.lat])
    if (km < bestKm) {
      bestKm = km
      best = isl
    }
  }
  return best && bestKm <= maxKm ? best : null
}

const normalize = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritics
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

/** Full Vietnamese address for an island (leaf → district → province → country). */
export const buildIslandPlaceName = (isl: DisputedIsland): string => {
  const region = regionByCoords(isl.lng, isl.lat)
  if (!region) return `${isl.name}, ${COUNTRY}`
  const { district, province } = REGION_ADMIN[region]
  return isl.kind === 'group'
    ? `${isl.name}, ${province}, ${COUNTRY}`
    : `${isl.name}, ${district}, ${province}, ${COUNTRY}`
}

/** Address for an arbitrary in-region coordinate, using the nearest island name. */
export const buildRegionPlaceName = (
  lng: number,
  lat: number,
  region: DisputedRegion,
  fallbackLeaf?: string
): string => {
  const { district, province } = REGION_ADMIN[region]
  const leaf = nearestIsland(lng, lat)?.name || fallbackLeaf
  const head = leaf ? `${leaf}, ` : ''
  return `${head}${district}, ${province}, ${COUNTRY}`
}

export interface IslandSearchHit {
  id: string
  place_name: string
  center: LngLat
}

/**
 * Local gazetteer search over the curated islands, so Vietnamese names resolve
 * even when the upstream geocoder has no entry for them. Matches when the query
 * is a substring of a (diacritic-insensitive) island name.
 */
export const searchIslands = (query: string, limit = 5): IslandSearchHit[] => {
  const q = normalize(query)
  if (q.length < 2) return []

  const hits = DISPUTED_ISLANDS.filter((isl) => normalize(isl.name).includes(q))

  hits.sort((a, b) => {
    // startsWith beats mid-string; then group > island > reef; then shorter name
    const kindRank = { group: 0, island: 1, reef: 2 }
    const aStarts = normalize(a.name).startsWith(q) ? 0 : 1
    const bStarts = normalize(b.name).startsWith(q) ? 0 : 1
    return (
      aStarts - bStarts ||
      kindRank[a.kind] - kindRank[b.kind] ||
      a.name.length - b.name.length
    )
  })

  return hits.slice(0, limit).map((isl) => ({
    id: `vn-island-${normalize(isl.name).replace(/ /g, '-')}`,
    place_name: buildIslandPlaceName(isl),
    center: [isl.lng, isl.lat] as LngLat,
  }))
}
