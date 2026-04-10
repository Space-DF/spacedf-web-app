import dynamic from 'next/dynamic'
const FleetTracking = dynamic(() => import('@/templates/fleet-tracking'), {
  ssr: false,
})
const SmartBuilding = dynamic(() => import('@/templates/smart-building'), {
  ssr: false,
})
const currentTemplate = 'smart-building' as const
export default function DigitalTwins() {
  return currentTemplate === 'smart-building' ? (
    <SmartBuilding />
  ) : (
    <FleetTracking />
  )
}
