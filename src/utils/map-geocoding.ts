import * as maptilersdk from '@maptiler/sdk'

type GeocodingReturnType = 'array' | 'obj'

interface GeocodingReverseOptions<T extends GeocodingReturnType = 'array'>
  extends maptilersdk.GeocodingOptions {
  returnType?: T
}

type GeocodingReverseResult<T extends GeocodingReturnType> = T extends 'obj'
  ? Record<string, maptilersdk.GeocodingSearchResult>
  : maptilersdk.GeocodingSearchResult[]

class MapGeocodingService {
  private static instance: MapGeocodingService
  private static initPromise: Promise<void> | null = null

  private initialized = false
  private reverseCache = new Map<string, maptilersdk.GeocodingSearchResult>()

  private constructor() {}

  static getInstance(): MapGeocodingService {
    if (!this.instance) {
      this.instance = new MapGeocodingService()
      this.initPromise = this.instance.init()
    }
    return this.instance
  }

  private async init() {
    if (this.initialized) return

    try {
      const res = await fetch('/api/maptiler')
      if (res.ok) {
        const data = await res.json()

        maptilersdk.config.apiKey = data.maptiler_api_key
        this.initialized = true
      } else {
        console.error('Failed to fetch maptiler api key')
      }
    } catch (error) {
      console.error({ error })
      throw new Error('Failed to fetch maptiler api key')
    }
  }

  public batchReverse = async <T extends GeocodingReturnType>(
    coords: [number, number][],
    options?: GeocodingReverseOptions<T>
  ): Promise<GeocodingReverseResult<T>> => {
    if (!this.initialized) {
      return (
        options?.returnType === 'obj' ? {} : []
      ) as GeocodingReverseResult<T>
    }

    const coordsNeedToQuery: string[] = []
    const resultMap = new Map<string, maptilersdk.GeocodingSearchResult>()

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
        const queryResults = await maptilersdk.geocoding.batch(
          coordsNeedToQuery,
          {
            types: options?.types ?? ['address'],
            ...options,
          }
        )

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
}

export const geocodingService = MapGeocodingService.getInstance()
