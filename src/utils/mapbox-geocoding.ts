import { getMapboxToken } from '@/lib/mapbox-token'

export interface GeocodingFeature {
  properties: {
    name: string
    full_address: string
  }
}

export interface GeocodingResponse {
  features: GeocodingFeature[]
}

export interface BatchGeocodingResponse {
  batch: Array<{
    features: GeocodingFeature[]
    response_code?: string
  }>
}

export async function getLocationName({
  locations,
}: {
  locations: { longitude?: number; latitude?: number }[]
}): Promise<string[]> {
  try {
    const validLocations = locations.filter(
      (location) => location.longitude != null && location.latitude != null
    )

    // If no valid locations, return array of "Unknown location"
    if (validLocations.length === 0) {
      return locations.map(() => 'Unknown location')
    }

    const token = await getMapboxToken()

    const requestBody = validLocations.map((location) => ({
      types: ['street'],
      longitude: location.longitude,
      latitude: location.latitude,
    }))

    const response = await fetch(
      `https://api.mapbox.com/search/geocode/v6/batch?access_token=${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    )

    if (!response.ok) {
      return validLocations.map(() => 'Unknown location')
    }

    const data: BatchGeocodingResponse = await response.json()

    if (data.batch && Array.isArray(data.batch)) {
      return data.batch.map((item) => {
        if (item.features && item.features.length > 0) {
          return item.features[0].properties.full_address
        }
        return 'Unknown location'
      })
    }

    return validLocations.map(() => 'Unknown location')
  } catch {
    return locations.map(() => 'Unknown location')
  }
}
