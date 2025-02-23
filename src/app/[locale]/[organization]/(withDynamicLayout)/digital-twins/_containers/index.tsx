'use client'

import { TestMQTT } from './test-mqtt'

// const MapOverlayNoSSR = dynamic(
//   () => {
//     return import('../_containers/map-overlay')
//   },
//   { ssr: false }
// )

export default function WareHouseTrackingContainer() {
  return (
    <>
      <TestMQTT />
      {/* <SelectMapType /> */}
      {/* <MapOverlayNoSSR layers={layers} /> */}
    </>
  )
}
