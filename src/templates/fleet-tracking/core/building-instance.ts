import MapLibreGL from 'maplibre-gl'

const defaultStyles = {
  dark: [0, '#1f1f1f', 200, '#4b5cff', 400, '#7dd3fc'],
  light: [0, 'lightgray', 200, 'royalblue', 400, 'lightblue'],
}

class BuildingInstance {
  private static instance: BuildingInstance | undefined
  private map: MapLibreGL.Map | null = null

  private sourceId = 'building-source'

  private constructor() {}

  static getInstance() {
    if (!BuildingInstance.instance) {
      BuildingInstance.instance = new BuildingInstance()
    }
    return BuildingInstance.instance
  }

  async createBuildingLayer(theme: 'dark' | 'light') {
    if (!this.map) return

    // wait for style to be loaded
    await new Promise((resolve) => setTimeout(resolve, 500))

    const source = this.map.getSource(this.sourceId) as MapLibreGL.GeoJSONSource

    if (source) return

    const layers = this.map.getStyle().layers

    let labelLayerId: string = ''
    for (let i = 0; i < (layers as any).length; i++) {
      if (
        layers[i].type === 'symbol' &&
        (layers[i].layout as any)['text-field']
      ) {
        labelLayerId = ((layers[i] as any).id as string) || ''
        break
      }
    }

    if (!this.map.getSource('openfreemap')) {
      this.map.addSource('openfreemap', {
        url: `https://tiles.openfreemap.org/planet`,
        type: 'vector',
      })
    }

    this.map.addLayer(
      {
        id: this.sourceId,
        source: 'openfreemap',
        'source-layer': 'building',
        type: 'fill-extrusion',
        minzoom: 15,
        filter: ['!=', ['get', 'hide_3d'], true],
        paint: {
          'fill-extrusion-opacity': 1,
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['get', 'render_height'],
            ...defaultStyles[theme],
          ],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            16,
            ['get', 'render_height'],
          ],
          'fill-extrusion-base': [
            'case',
            ['>=', ['get', 'zoom'], 16],
            ['get', 'render_min_height'],
            0,
          ],
        },
      },
      labelLayerId
    )
  }

  init(map: MapLibreGL.Map, theme: 'dark' | 'light') {
    this.map = map
    this.createBuildingLayer(theme)
  }

  removeBuildingLayer() {
    if (this.map) {
      this.map.removeLayer(this.sourceId)
    }
  }
}

export default BuildingInstance
