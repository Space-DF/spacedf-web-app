import { ConfigSpecification } from 'mapbox-gl'

type MapType = 'default' | '3D_map' | 'street'
const getMapStyle = (
  mapType: MapType,
  currentTheme: 'dark' | 'light'
): {
  style: string
  config: {
    [key: string]: ConfigSpecification
  }
} => {
  if (mapType === 'street') {
    return {
      style: `mapbox://styles/mapbox/${currentTheme}-v11`,
      config: {
        basemap: {},
      },
    }
  }

  if (mapType === '3D_map') {
    return {
      style: `mapbox://styles/mapbox/standard`,
      config: {
        basemap:
          currentTheme === 'dark'
            ? {
                lightPreset: 'dusk',
              }
            : {
                darkPreset: 'night',
              },
      },
    }
  }

  return {
    style: `mapbox://styles/mapbox/${currentTheme}-v11`,
    config: {
      basemap: {},
    },
  }
}

export { getMapStyle }
export type { MapType }
