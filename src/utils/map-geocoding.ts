import {
  type GeocodingOptions,
  type GeocodingSearchResult,
  config,
  geocoding,
  type GeocodingFeature,
} from '@maptiler/client'
import {
  buildRegionPlaceName,
  distanceKm,
  regionByCoords,
  searchIslands,
  type LngLat,
} from '@/utils/disputed-regions'

type GeocodingReturnType = 'array' | 'obj'

interface GeocodingReverseOptions<T extends GeocodingReturnType = 'array'>
  extends GeocodingOptions {
  returnType?: T
}

type GeocodingReverseResult<T extends GeocodingReturnType> = T extends 'obj'
  ? Record<string, GeocodingSearchResult>
  : GeocodingSearchResult[]

const getFeatureCoords = (feature: GeocodingFeature): LngLat | null => {
  const center = (feature as any).center
  if (
    Array.isArray(center) &&
    typeof center[0] === 'number' &&
    typeof center[1] === 'number'
  ) {
    return [center[0], center[1]]
  }
  const coords = (feature as any).geometry?.coordinates
  if (
    Array.isArray(coords) &&
    typeof coords[0] === 'number' &&
    typeof coords[1] === 'number'
  ) {
    return [coords[0], coords[1]]
  }
  return null
}

// Rewrite the display name of any result inside the Hoàng Sa / Trường Sa regions
// to the correct Vietnamese administrative units. Region is decided purely by
// the coordinate (see `@/utils/disputed-regions`), then the address is REBUILT
// from a fixed template — so foreign country / province names (China, Taiwan,
// Philippines, Malaysia, …) can never leak through, without any per-name rules.
// Only `place_name` is consumed downstream (search list + trip address), so
// that's all we rewrite.
const sanitizeGeocodingFeature = (
  feature: GeocodingFeature
): GeocodingFeature => {
  if (!feature) return feature

  const coords = getFeatureCoords(feature)
  if (!coords) return feature

  const region = regionByCoords(coords[0], coords[1])
  if (!region) return feature

  return {
    ...feature,
    place_name: buildRegionPlaceName(
      coords[0],
      coords[1],
      region,
      (feature as any).text
    ),
  }
}

const sanitizeGeocodingSearchResult = (
  result: GeocodingSearchResult
): GeocodingSearchResult => {
  if (!result) return result
  return {
    ...result,
    features: Array.isArray(result.features)
      ? result.features.map(sanitizeGeocodingFeature)
      : result.features,
  }
}

class MapGeocodingService {
  private static instance: MapGeocodingService
  private initPromise: Promise<void> | null = null

  private initialized = false
  private reverseCache = new Map<string, GeocodingSearchResult>()

  private constructor() {}

  static getInstance(): MapGeocodingService {
    if (!this.instance) {
      this.instance = new MapGeocodingService()
    }
    return this.instance
  }

  private async init() {
    if (this.initialized) return

    try {
      let apiKey: string | undefined

      if (typeof window === 'undefined') {
        apiKey = process.env.MAPTILER_API_KEY
      } else {
        const res = await fetch('/api/maptiler')
        if (res.ok) {
          const data = await res.json()
          apiKey = data.maptiler_api_key
        } else {
          console.error('Failed to fetch maptiler api key')
        }
      }

      if (apiKey) {
        config.apiKey = apiKey
        this.initialized = true
      }
    } catch (error) {
      console.error({ error })
    }
  }

  private async ensureInitialized() {
    if (this.initialized) return
    if (!this.initPromise) {
      this.initPromise = this.init()
    }
    await this.initPromise
  }

  public batchReverse = async <T extends GeocodingReturnType>(
    coords: [number, number][],
    options?: GeocodingReverseOptions<T>
  ): Promise<GeocodingReverseResult<T>> => {
    await this.ensureInitialized()
    if (!this.initialized) {
      return (
        options?.returnType === 'obj' ? {} : []
      ) as GeocodingReverseResult<T>
    }

    const coordsNeedToQuery: string[] = []
    const resultMap = new Map<string, GeocodingSearchResult>()

    for (const [lng, lat] of coords) {
      const key = `${lng},${lat}`

      if (this.reverseCache.has(key)) {
        resultMap.set(key, this.reverseCache.get(key)!)
      } else {
        coordsNeedToQuery.push(key)
      }
    }

    if (coordsNeedToQuery.length > 0) {
      try {
        const queryResults = await geocoding.batch(coordsNeedToQuery, {
          types: options?.types ?? ['address'],
          ...options,
        })

        queryResults.forEach((result, index) => {
          const key = coordsNeedToQuery[index]
          const sanitizedResult = sanitizeGeocodingSearchResult(result)
          resultMap.set(key, sanitizedResult)
          this.reverseCache.set(key, sanitizedResult)
        })
      } catch (error) {
        console.error({ error })
      }
    }

    if (options?.returnType === 'obj') {
      return Object.fromEntries(resultMap) as GeocodingReverseResult<T>
    }

    const orderedResults = coords.map(([lng, lat]) => {
      const key = `${lng},${lat}`
      return resultMap.get(key) ?? null
    })

    return orderedResults as GeocodingReverseResult<T>
  }

  public forward = async (
    query: string,
    options?: { limit?: number }
  ): Promise<GeocodingFeature[]> => {
    const trimmed = query?.trim()
    if (!trimmed) return []

    const limit = options?.limit ?? 8

    // Local gazetteer first, so Vietnamese island names resolve even when the
    // upstream geocoder has no entry for them (and even before the API key is
    // ready / when there's no key at all).
    const local = searchIslands(trimmed)
    const localFeatures = local.map(
      (hit) =>
        ({
          id: hit.id,
          text: hit.place_name,
          place_name: hit.place_name,
          center: hit.center,
          geometry: { type: 'Point', coordinates: hit.center },
        }) as unknown as GeocodingFeature
    )

    await this.ensureInitialized()

    let remote: GeocodingFeature[] = []
    if (this.initialized) {
      try {
        const result = await geocoding.forward(trimmed, { limit })
        remote = (result?.features ?? []).map(sanitizeGeocodingFeature)
      } catch (error) {
        console.error({ error })
      }
    }

    const filteredRemote = remote.filter((feature) => {
      const c = getFeatureCoords(feature)
      return !c || !local.some((hit) => distanceKm(c, hit.center) < 2)
    })

    return [...localFeatures, ...filteredRemote].slice(0, limit)
  }
}

export const geocodingService = MapGeocodingService.getInstance()
