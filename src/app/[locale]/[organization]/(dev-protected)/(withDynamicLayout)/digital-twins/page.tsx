import { checkSlugName } from '@/lib/organizations'
import { getValidSubdomain } from '@/utils/subdomain'
import dynamic from 'next/dynamic'
import { headers } from 'next/headers'
const FleetTracking = dynamic(() => import('@/templates/fleet-tracking'), {
  ssr: false,
})
const SmartBuilding = dynamic(() => import('@/templates/smart-building'), {
  ssr: false,
})
export default async function DigitalTwins() {
  const headersList = headers()
  const host = headersList.get('host') || 'localhost'

  const org = await getValidSubdomain(host)
  const { template } = await checkSlugName(org || '')
  return template === 'smart_building' ? <SmartBuilding /> : <FleetTracking />
}
