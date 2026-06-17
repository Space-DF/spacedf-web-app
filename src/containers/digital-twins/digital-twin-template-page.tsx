import { checkSlugName } from '@/lib/organizations'
import { getValidSubdomain } from '@/utils/subdomain'
import dynamic from 'next/dynamic'
import { headers } from 'next/headers'

const SmartFleetMonitor = dynamic(() => import('@/templates/fleet-tracking'), {
  ssr: false,
})

const SmartBuilding = dynamic(() => import('@/templates/smart-building'), {
  ssr: false,
})

export default async function DigitalTwinTemplatePage() {
  const headersList = headers()
  const host = headersList.get('host') || 'localhost'

  const org = await getValidSubdomain(host)
  const { template } = await checkSlugName(org || '')

  if (template === 'smart_building') {
    return <SmartBuilding />
  }

  return <SmartFleetMonitor />
}
