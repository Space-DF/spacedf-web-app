import { OrgNotExist } from '@/components/layouts/org-not-exist'
import { OrganizationValidationHydration } from '@/components/layouts/organization-validation-hydration'
import { getValidSubdomain } from '@/utils/subdomain'
import {
  checkSlugName,
  validateOrganizationFallback,
} from '@/lib/organizations'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import EffectLayout from '@/components/ui/effect-layout'

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
  if (!isValidOrganization.isValid) {
    // Fallback to hardcoded validation for backwards compatibility
    const isValidFallback = await validateOrganizationFallback(org)

    if (!isValidFallback) {
      return <OrgNotExist />
    }
  }

  return (
    <OrganizationValidationHydration value={isValidOrganization}>
      <section>
        <EffectLayout>{children}</EffectLayout>
      </section>
    </OrganizationValidationHydration>
  )
}
