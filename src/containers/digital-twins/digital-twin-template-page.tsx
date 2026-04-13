import { checkSlugName } from '@/lib/organizations'
import { getValidSubdomain } from '@/utils/subdomain'
import dynamic from 'next/dynamic'
import { headers } from 'next/headers'

const templateImporters = {
  smart_fleet_monitor: () => import('@/templates/fleet-tracking'),
  smart_building: () => import('@/templates/smart-building'),
} as const

export default async function DigitalTwinTemplatePage() {
  const headersList = headers()
  const host = headersList.get('host') || 'localhost'

  const org = await getValidSubdomain(host)
  const { template } = await checkSlugName(org || '')

  const importer =
    templateImporters[template as keyof typeof templateImporters] ||
    templateImporters['smart_fleet_monitor']
  const Template = dynamic(importer, {
    ssr: false,
  })
  return <Template />
}
