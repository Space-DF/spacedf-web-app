'use client'

import dynamic from 'next/dynamic'

const SmartFleetMonitor = dynamic(() => import('@/templates/fleet-tracking'), {
  ssr: false,
})

const SmartBuilding = dynamic(() => import('@/templates/smart-building'), {
  ssr: false,
})

export default function DigitalTwinTemplateView({
  template,
}: {
  template: string
}) {
  if (template === 'smart_building') {
    return <SmartBuilding />
  }

  return <SmartFleetMonitor />
}
