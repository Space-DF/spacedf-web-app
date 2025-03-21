'use client'

import { SelectMapType } from '@/components/ui/select-map-type'
import { ArcLayer } from 'deck.gl'
import dynamic from 'next/dynamic'

const layers = [
  new ArcLayer({
    id: 'deckgl-arc',
    data: [
      {
        source: [108.2204122, 16.0608127],
        target: [108.22, 16.04],
      },
    ],
    getSourcePosition: (d) => d.source,
    getTargetPosition: (d) => d.target,
    getSourceColor: [255, 208, 0],
    getTargetColor: [0, 128, 255],
    getWidth: 8,
  }),
]

const MapOverlayNoSSR = dynamic(
  () => {
    return import('../_containers/map-overlay')
  },
  { ssr: false }
)

export default function WareHouseTrackingContainer() {
  return (
    <>
      <SelectMapType />
      <MapOverlayNoSSR layers={layers} />
    </>
  )
}
