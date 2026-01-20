import { Device } from '@/stores/device-store'
import MapLibreGL from 'maplibre-gl'
import isEqual from 'fast-deep-equal'
import EventEmitter from '@/utils/event'

const MAX_ZOOM = 11
type ClusterEvent = 'visible-change'

class ClusterInstance {
  private static instance: ClusterInstance | undefined
  private map: MapLibreGL.Map | null = null
  private emitter = new EventEmitter()

  private originalDevices: Record<string, Device> = {}
  private visible = true
  private isAlreadyShowTripRoute = false

  private clusterData: GeoJSON.FeatureCollection<
    GeoJSON.Geometry,
    GeoJSON.GeoJsonProperties
  > = {
    type: 'FeatureCollection',
    features: [],
  }

  private styleProps = {
    clusterColor: '#171B1D',
    strokeColor: '#4006AA',
    clusterThresholds: [100, 750],
    pointColor: '#3b82f6',
  }

  private sourceId = 'cluster-source'
  private clusterLayerId = 'cluster-layer'
  private clusterCountLayerId = 'cluster-count-layer'
  private unclusteredLayerId = 'unclustered-layer'
  private singleClusterLayerId = 'single-cluster-layer'
  private singleClusterCountLayerId = 'single-cluster-count-layer'

  private constructor() {}

  static getInstance() {
    if (!ClusterInstance.instance) {
      ClusterInstance.instance = new ClusterInstance()
    }
    return ClusterInstance.instance
  }

  on(event: ClusterEvent, handler: (isVisible: boolean) => void) {
    this.emitter.on(event, handler)
  }

  off(event: ClusterEvent, handler: (isVisible: boolean) => void) {
    this.emitter.off(event, handler)
  }

  createClusterLayer = () => {
    if (!this.map) return

    if (!this.map.isStyleLoaded()) return

    if (this.map.getSource(this.sourceId)) return

    this.map.addSource(this.sourceId, {
      type: 'geojson',
      data: this.clusterData,
      cluster: true,
      clusterMaxZoom: MAX_ZOOM,
      clusterRadius: 50,
    })

    // Add cluster circles layer
    this.map.addLayer({
      id: this.clusterLayerId,
      type: 'circle',
      source: this.sourceId,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          this.styleProps.clusterColor,
          this.styleProps.clusterThresholds[0],
          this.styleProps.clusterColor,
          this.styleProps.clusterThresholds[1],
          this.styleProps.clusterColor,
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          this.styleProps.clusterThresholds[0],
          30,
          this.styleProps.clusterThresholds[1],
          40,
        ],

        'circle-stroke-color': this.styleProps.strokeColor,
        'circle-stroke-width': 2,
      },
    })

    // Add cluster count text layer
    this.map.addLayer({
      id: this.clusterCountLayerId,
      type: 'symbol',
      source: this.sourceId,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-size': 13,
      },
      paint: {
        'text-color': '#fff',
      },
    })

    // Add unclustered point layer
    this.map.addLayer({
      id: this.unclusteredLayerId,
      type: 'circle',
      source: this.sourceId,
      filter: [
        'all',
        ['!', ['has', 'point_count']],
        ['>=', ['zoom'], MAX_ZOOM + 1],
      ],
      paint: {
        'circle-color': this.styleProps.pointColor,
        'circle-radius': 4,
      },
    })

    this.map.addLayer({
      id: this.singleClusterLayerId,
      type: 'circle',
      source: this.sourceId,
      filter: [
        'all',
        ['!', ['has', 'point_count']],
        ['<', ['zoom'], MAX_ZOOM + 1],
      ],
      paint: {
        'circle-color': this.styleProps.clusterColor,
        'circle-radius': 20,
        'circle-stroke-color': this.styleProps.strokeColor,
        'circle-stroke-width': 2,
      },
    })

    this.map.addLayer({
      id: this.singleClusterCountLayerId,
      type: 'symbol',
      source: this.sourceId,
      filter: [
        'all',
        ['!', ['has', 'point_count']],
        ['<', ['zoom'], MAX_ZOOM + 1],
      ],
      layout: {
        'text-field': '1',
        'text-size': 13,
      },
      paint: {
        'text-color': '#fff',
      },
    })
  }

  private _handleClusterClick = async (
    e: MapLibreGL.MapMouseEvent & {
      features?: MapLibreGL.MapGeoJSONFeature[]
    }
  ) => {
    if (!this.map) return

    const features = this.map.queryRenderedFeatures(e.point, {
      layers: [this.clusterLayerId],
    })

    const feature = features[0]
    const clusterId = feature.properties?.cluster_id as number

    const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [
      number,
      number,
    ]

    const source = this.map.getSource(this.sourceId) as MapLibreGL.GeoJSONSource
    const zoom = await source.getClusterExpansionZoom(clusterId)

    this.map.easeTo({
      center: coordinates,
      zoom,
    })
  }

  public setClusterVisibility = (visibility: 'visible' | 'none') => {
    if (!this.map) return

    this.isAlreadyShowTripRoute = visibility === 'none'

    const layerIds = [
      this.clusterLayerId,
      this.clusterCountLayerId,
      this.unclusteredLayerId,
      this.singleClusterLayerId,
      this.singleClusterCountLayerId,
    ]

    layerIds.forEach((layerId) => {
      if (this.map?.getLayer(layerId)) {
        this.map.setLayoutProperty(layerId, 'visibility', visibility)
      }
    })
  }

  private _syncClusterVisibility(next: boolean) {
    if (this.visible === next) return

    this.visible = next
    this.emitter.emit('visible-change', next)
  }

  private _handleMouseEnterCluster = () => {
    if (!this.map) return
    this.map.getCanvas().style.cursor = 'pointer'
  }

  private _handleZoomChange = () => {
    if (!this.map) return
    if (this.isAlreadyShowTripRoute) return

    const zoom = this.map.getZoom()
    const visible = zoom < MAX_ZOOM + 1

    this._syncClusterVisibility(visible)
  }

  private _handleMouseLeaveCluster = () => {
    if (!this.map) return
    this.map.getCanvas().style.cursor = ''
  }

  public init(map: MapLibreGL.Map) {
    if (!map) return
    this.map = map

    this.createClusterLayer()

    map.on('click', this.clusterLayerId, this._handleClusterClick)
    map.on('click', 'single-cluster-layer', (e) => {
      if (!e.features?.[0]) return

      const coordinates = (e.features[0].geometry as GeoJSON.Point).coordinates

      map.easeTo({
        center: coordinates as [number, number],
        zoom: MAX_ZOOM + 1,
      })
    })
    map.on('mouseenter', this.clusterLayerId, this._handleMouseEnterCluster)
    map.on('mouseleave', this.clusterLayerId, this._handleMouseLeaveCluster)
    map.on('zoom', this._handleZoomChange)
  }

  async updateClusterData() {
    await new Promise((resolve) => setTimeout(resolve, 700))
    if (!this.map) return

    const source = this.map.getSource(this.sourceId) as MapLibreGL.GeoJSONSource

    if (!source) {
      this.createClusterLayer()
    }
  }

  syncTheme(theme: 'dark' | 'light') {
    this.styleProps.clusterColor = theme === 'dark' ? '#9D85FF' : '#171B1D'
  }

  async syncClusterData(devices: Record<string, Device>) {
    if (!this.map) return
    if (isEqual(this.originalDevices, devices)) return

    this.originalDevices = devices

    const features = Object.values(devices).map((device) => {
      const feature: GeoJSON.Feature<
        GeoJSON.Geometry,
        GeoJSON.GeoJsonProperties
      > = {
        type: 'Feature',
        properties: {
          id: device.id,
        },
        geometry: {
          type: 'Point',
          coordinates: device.deviceProperties?.latest_checkpoint_arr ?? [0, 0],
        },
      }

      return feature
    })

    this.clusterData.features = features
    const source = this.map.getSource(this.sourceId) as MapLibreGL.GeoJSONSource

    if (source) {
      source.setData(this.clusterData)
    }
  }

  public removeClusterLayer() {
    if (!this.map) return
    try {
      this.map.off('click', this.clusterLayerId, this._handleClusterClick)
      this.map.off(
        'mouseenter',
        this.clusterLayerId,
        this._handleMouseEnterCluster
      )
      this.map.off(
        'mouseleave',
        this.clusterLayerId,
        this._handleMouseLeaveCluster
      )

      const layerIds = [
        this.clusterCountLayerId,
        this.unclusteredLayerId,
        this.clusterLayerId,
        this.sourceId,
        this.singleClusterLayerId,
        this.singleClusterCountLayerId,
      ]

      if (this.map) {
        layerIds.forEach((layerId) => {
          if (this.map!.getSource(layerId)) this.map!.removeSource(layerId)
        })
      }
    } catch {
      // ignore
    }
  }
}

export default ClusterInstance
