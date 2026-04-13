import { checkSlugName } from '@/lib/organizations'
import { getValidSubdomain } from '@/utils/subdomain'
import dynamic from 'next/dynamic'
import { headers } from 'next/headers'

const templateImporters = {
  'fleet-tracking': () => import('@/templates/fleet-tracking'),
  'smart-building': () => import('@/templates/smart-building'),
} as const

export default async function DigitalTwins() {
  const headersList = headers()
  const host = headersList.get('host') || 'localhost'

  const org = await getValidSubdomain(host)
  const { template } = await checkSlugName(org || '')

  const importer =
    templateImporters[template as keyof typeof templateImporters] ||
    templateImporters['fleet-tracking']
  const Template = dynamic(importer, {
    ssr: false,
  })
  return <Template />
}
