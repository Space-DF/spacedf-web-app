import { useCallback } from 'react'

export const useMapBuilding = () => {
  const applyMapBuilding = useCallback((map: mapboxgl.Map) => {
    if (!map) return

    if (map.getLayer('3d-buildings')) return

    map.addLayer(
      {
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height'],
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height'],
          ],
          'fill-extrusion-opacity': 0.6,
          'fill-extrusion-height-transition': {
            duration: 300,
            delay: 0,
          },
          'fill-extrusion-base-transition': {
            duration: 300,
            delay: 0,
          },
        },
      },
      'road-label-simple'
    )
  }, [])

  const removeMapBuilding = useCallback(async (map: mapboxgl.Map) => {
    if (!map) return

    if (!map.getLayer('3d-buildings')) return

    map.removeLayer('3d-buildings')
    // Wait for transition to finish, then remove the layer
  }, [])

  return {
    applyMapBuilding,
    removeMapBuilding,
  }
}
