import api from './api'

let cachedToken: string | null = null
let tokenPromise: Promise<string> | null = null

export async function getMapboxToken(): Promise<string> {
  if (cachedToken) {
    return cachedToken
  }

  if (tokenPromise) {
    return tokenPromise
  }

  tokenPromise = api
    .get<{ mapbox_token: string }>('/api/mapbox-token')
    .then((response) => {
      cachedToken = response.mapbox_token
      return cachedToken
    })
    .catch((error) => {
      tokenPromise = null
      throw error
    })

  return tokenPromise
}

export function clearMapboxTokenCache(): void {
  cachedToken = null
  tokenPromise = null
}
