import {
  type GeocodingOptions,
  type GeocodingSearchResult,
  config,
  geocoding,
  type GeocodingFeature,
} from '@maptiler/client'

type GeocodingReturnType = 'array' | 'obj'

interface GeocodingReverseOptions<T extends GeocodingReturnType = 'array'>
  extends GeocodingOptions {
  returnType?: T
}

type GeocodingReverseResult<T extends GeocodingReturnType> = T extends 'obj'
  ? Record<string, GeocodingSearchResult>
  : GeocodingSearchResult[]

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
          resultMap.set(key, result)
          this.reverseCache.set(key, result)
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
    await this.ensureInitialized()
    if (!this.initialized || !query?.trim()) {
      return []
    }
    try {
      const result = await geocoding.forward(query, {
        limit: options?.limit ?? 8,
      })
      return result?.features ?? []
    } catch (error) {
      console.error({ error })
      return []
    }
  }
}

export const geocodingService = MapGeocodingService.getInstance()
