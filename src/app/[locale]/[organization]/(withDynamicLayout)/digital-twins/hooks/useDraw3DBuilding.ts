'use client'

export const useDraw3DBuilding = () => {
  const startDrawBuilding = () => {
    const map = window.mapInstance?.getMapInstance()

    if (!map) return

    if (map?.getLayer('3d-buildings')) return

    map.addLayer(
      {
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 10,
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
        },
      },
      'road-label-simple'
    )
  }

  const remove3DBuildingLayer = () => {
    const map = window.mapInstance?.getMapInstance()
    if (!map || !map?.isStyleLoaded()) return

    if (map?.getLayer('3d-buildings')) {
      map.removeLayer('3d-buildings')
    }
  }

  return {
    startDrawBuilding,
    remove3DBuildingLayer,
  }
}
