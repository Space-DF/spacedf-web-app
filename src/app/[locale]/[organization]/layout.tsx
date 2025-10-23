import { OrgNotExist } from '@/components/layouts/org-not-exist'
import { getValidSubdomain } from '@/utils/subdomain'
import {
  checkSlugName,
  validateOrganizationFallback,
} from '@/utils/organization-validation'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

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

  // Try to validate organization using SpaceDF SDK
  const isValidOrganization = await checkSlugName(org)

  if (!isValidOrganization) {
    // Fallback to hardcoded validation for backwards compatibility
    const isValidFallback = validateOrganizationFallback(org)

    if (!isValidFallback) {
      return <OrgNotExist />
    }
  }

  return <section>{children}</section>
}
