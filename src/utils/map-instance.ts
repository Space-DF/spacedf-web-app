import { NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN } from '@/shared/env'
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
    center = [108.2204122, 16.0608127],
    zoom = 5,
    maxZoom = 19,
    pitch = 45,
    antialias = true,
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
      style: style,
      center: center,
      maxZoom: maxZoom,
      pitch: pitch,
      antialias: antialias,
      zoom: zoom,
    })

    this.map.on('load', () => {
      this.apply3DBuildingLayer()
    })
  }

  private apply3DBuildingLayer(): void {
    if (!this.map) return
    //@ts-ignore
    const firstLabelLayerId = this.map
      .getStyle()
      .layers?.find((layer) => layer.type === 'symbol')?.id
    if (firstLabelLayerId) {
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
            'fill-extrusion-opacity': 0.6,
          },
        },
        firstLabelLayerId,
      )
    }
  }

  public destroyMap(): void {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
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
