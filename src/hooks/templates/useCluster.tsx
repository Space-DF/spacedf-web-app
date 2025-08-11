import { useDeviceStore } from '@/stores/device-store'
import { useCallback } from 'react'
import { useShallow } from 'zustand/react/shallow'
// import Supercluster from 'supercluster'

// const cluster = new Supercluster({
//   maxZoom: 15,
//   radius: 500,
// })

export const useMapClusters = () => {
  //   useEffect(() => {
  //     if (!map || !devices.length) return

  //     const features = devices
  //       .filter(
  //         (d) => Array.isArray(d.latestLocation) && d.latestLocation.length === 2
  //       )
  //       .map((device) => ({
  //         type: 'Feature',
  //         properties: { id: device.id, type: device.type },
  //         geometry: { type: 'Point', coordinates: device.latestLocation },
  //       }))

  //     const sourceId = 'devices'

  //     if (map.getSource(sourceId)) {
  //       const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource
  //       source.setData({
  //         type: 'FeatureCollection',
  //         features: features as any,
  //       })
  //     } else {
  //       map.addSource(sourceId, {
  //         type: 'geojson',
  //         data: {
  //           type: 'FeatureCollection',
  //           features: features as any,
  //         },
  //         cluster: true,
  //         clusterMaxZoom: 14,
  //         clusterRadius: 50,
  //       })

  //       map.addLayer({
  //         id: 'clusters',
  //         type: 'circle',
  //         source: sourceId,
  //         filter: ['has', 'point_count'],
  //         paint: {
  //           'circle-color': '#51bbd6',
  //           'circle-radius': [
  //             'step',
  //             ['get', 'point_count'],
  //             20,
  //             100,
  //             30,
  //             750,
  //             40,
  //           ],
  //         },
  //       })

  //       map.addLayer({
  //         id: 'cluster-count',
  //         type: 'symbol',
  //         source: sourceId,
  //         filter: ['has', 'point_count'],
  //         layout: {
  //           'text-field': '{point_count_abbreviated}',
  //           'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
  //           'text-size': 12,
  //         },
  //       })

  //       map.addLayer({
  //         id: 'unclustered-point',
  //         type: 'circle',
  //         source: sourceId,
  //         filter: ['!', ['has', 'point_count']],
  //         paint: {
  //           'circle-color': '#11b4da',
  //           'circle-radius': 4,
  //           'circle-stroke-width': 1,
  //           'circle-stroke-color': '#fff',
  //         },
  //       })

  //       map.on('click', 'clusters', (e) => {
  //         const features = map.queryRenderedFeatures(e.point, {
  //           layers: ['clusters'],
  //         })
  //         const clusterId = features[0].properties?.cluster_id
  //         const source = map.getSource(sourceId) as mapboxgl.GeoJSONSource

  //         source.getClusterExpansionZoom(clusterId, (err, zoom) => {
  //           if (err) return
  //           map.easeTo({
  //             center: (features[0].geometry as any).coordinates as [
  //               number,
  //               number,
  //             ],
  //             zoom: zoom as number,
  //           })
  //         })
  //       })
  //     }
  //   }, [map, devices])

  const { devices } = useDeviceStore(
    useShallow((state) => ({ devices: state.devices }))
  )

  const handleCluster = useCallback(
    (map: mapboxgl.Map) => {
      if (!map) return
    },
    [devices]
  )

  return {
    handleCluster,
  }
}
