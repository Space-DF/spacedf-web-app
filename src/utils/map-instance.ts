import { NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN } from '@/shared/env'
import { MapType } from '@/stores'
import mapboxgl from 'mapbox-gl'

mapboxgl.accessToken = NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

class MapInstance {
  private static instance: MapInstance
  private map: mapboxgl.Map | null = null

  public static getInstance(): MapInstance {
    if (!MapInstance.instance) {
      MapInstance.instance = new MapInstance()
    }
    return MapInstance.instance
  }

  public initializeMap({
    container,
    zoom = 3,
    maxZoom = 19,
    pitch = 70,

    style = 'mapbox://styles/mapbox/light-v11',
  }: {
    container: HTMLElement
    center?: [number, number]
    zoom?: number
    maxZoom?: number
    pitch?: number
    antialias?: boolean
    style?: string
  }): void {
    if (this.map) return
    this.map = new mapboxgl.Map({
      container: container,
      maxZoom: maxZoom,
      pitch: pitch,
      antialias: false,
      zoom: zoom,
      style,
    })

    // this.map.on('load', () => {
    //   this.apply3DBuildingLayer()
    // })
  }

  public getMapStyle(): Record<string, any> {
    if (!this.map || !this.map.isStyleLoaded()) return {}

    return (this.map?.getStyle() || {}) as Record<string, any>
  }

  public apply3DBuildingLayer(): void {
    if (!this.map) return
    //@ts-ignore

    // const simpleLayer = mapStyle?.layers?.find(
    //   (layer: any) => layer.id === 'symbol'
    // )?.id

    // if (firstLabelLayerId) {
    this.map.addLayer(
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
          'fill-extrusion-opacity': 0.3,
        },
      },
      'road-label-simple'
    )
    // }
  }

  public destroyMap(): void {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
  }

  public changeMapTheme(currentTheme: 'dark' | 'light'): void {
    this.map?.setStyle(`mapbox://styles/mapbox/${currentTheme}-v11`)
  }

  public resize(): void {
    this.map?.resize()
  }

  public getMapInstance(): mapboxgl.Map | null {
    return this.map
  }

  public addMarker(lngLat: [number, number]): void {
    if (!this.map) return

    new mapboxgl.Marker().setLngLat(lngLat).addTo(this.map)
  }

  public addControl(control: any): void {
    if (!this.map) {
      return
    }
    this.map.addControl(control)
  }
}

export default MapInstance

const addGroupCluster = () => {
  const globalMap = window.mapInstance

  if (!globalMap) return

  const allMapInstance = globalMap.getMapInstance()

  if (!allMapInstance) return

  if (allMapInstance?.getSource('clusters-source')) return

  allMapInstance?.addSource('clusters-source', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [],
    },
    cluster: true,
    clusterMaxZoom: 16,
    clusterRadius: 50,
    extent: 256,
    nodeSize: 64,
  } as any)

  allMapInstance?.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'clusters-source',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step',
        ['get', 'point_count'],
        '#51bbd6',
        100,
        '#f1f075',
        750,
        '#f28cb1',
      ],
      'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
      'text-color': '#fff',
    },
  })

  allMapInstance?.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'clusters-source',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12,
    },
    paint: {
      'text-color': '#fff',
    },
  })

  allMapInstance?.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'clusters-source',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': '#11b4da',
      'circle-radius': 4,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff',
      'text-color': '#fff',
    },
  })
}

const add3DBuildingLayer = () => {
  const globalMap = window.mapInstance

  if (!globalMap) return

  const allMapInstance = globalMap.getMapInstance()

  if (!allMapInstance) return

  if (allMapInstance?.getLayer('3d-buildings')) return

  globalMap.apply3DBuildingLayer()
}
export const updateMapType = (
  mapType: MapType,
  currentTheme: string = 'light'
) => {
  const globalMap = window.mapInstance

  if (!globalMap) return

  const allMapInstance = globalMap.getMapInstance()

  switch (mapType) {
    case 'default':
      allMapInstance?.setStyle(`mapbox://styles/mapbox/${currentTheme}-v11`)
      setTimeout(() => {
        addGroupCluster()
        add3DBuildingLayer()
      }, 1000)
      break

    case '3D_map':
      allMapInstance?.setStyle(`mapbox://styles/mapbox/standard`, {
        config: {
          basemap: {
            lightPreset: 'dusk',
          },
        },
      } as any)

      setTimeout(() => {
        addGroupCluster()
      }, 1000)

      break
    case 'street':
      allMapInstance?.setStyle(`mapbox://styles/mapbox/${currentTheme}-v11`)

      setTimeout(() => {
        addGroupCluster()

        if (allMapInstance?.getLayer('3d-buildings')) {
          allMapInstance.removeLayer('3d-buildings')
        }
      }, 1000)
      break
    default:
      break
  }
}
