import { checkSlugName } from '@/lib/organizations'
import { getValidSubdomain } from '@/utils/subdomain'
import { headers } from 'next/headers'
import DigitalTwinTemplateView from './digital-twin-template-view'

export default async function DigitalTwinTemplatePage() {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost'

  const org = await getValidSubdomain(host)
  const { template } = await checkSlugName(org || '')

  return <DigitalTwinTemplateView template={template} />
}
