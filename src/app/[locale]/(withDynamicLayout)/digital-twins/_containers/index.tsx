'use client'

import { ArcLayer } from 'deck.gl'
import MapOverlay from './map-overlay'
import { useEffect, useState } from 'react'
import { useMounted } from '@/hooks'
import dynamic from 'next/dynamic'

import { Deck } from '@deck.gl/core'

const layers = [
  // new ScatterplotLayer({
  //   id: 'deckgl-circle',
  //   data: [
  //     {
  //       position: [108.2204122, 16.0608127],
  //       color: [255, 0, 0],
  //       radius: 1000,
  //     },
  //   ],
  //   getPosition: (d) => d.position,
  //   getFillColor: (d) => d.color,
  //   getRadius: (d) => d.radius,
  //   opacity: 0.3,
  // }),
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
  { ssr: false },
)

export default function WareHouseTrackingContainer() {
  return <MapOverlayNoSSR layers={layers} />
}
