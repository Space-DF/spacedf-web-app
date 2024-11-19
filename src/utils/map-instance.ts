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
    zoom = 3,
    maxZoom = 19,
    pitch = 70,
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
      maxZoom: maxZoom,
      pitch: pitch,
      antialias: antialias,
      zoom: zoom,
      style,
    })

    // this.map.on('load', () => {
    //   this.apply3DBuildingLayer()
    // })
  }

  public getMapStyle(): Record<string, any> {
    return (this.map?.getStyle() || {}) as Record<string, any>
  }

  public apply3DBuildingLayer(): void {
    if (!this.map) return
    //@ts-ignore
    const mapStyle = this.getMapStyle()

    const firstLabelLayerId = mapStyle?.layers?.find(
      (layer: any) => layer.type === 'symbol',
    )?.id

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
            'fill-extrusion-opacity': 0.3,
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
