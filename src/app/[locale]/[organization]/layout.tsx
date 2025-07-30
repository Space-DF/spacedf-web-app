import { OrgNotExist } from '@/components/layouts/org-not-exist'
import { getValidSubdomain } from '@/utils/subdomain'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

const AVAILABLE_ORGS = ['demo', 'develop', 'digitalfortress']

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = headers()

  // Get the 'host' header
  const host = headersList.get('host') || 'localhost'

  const org = await getValidSubdomain(host)

  if (!org) {
    redirect('/')
  }

  if (!AVAILABLE_ORGS.includes(org)) {
    return <OrgNotExist />
  }

  return <section>{children}</section>
}
