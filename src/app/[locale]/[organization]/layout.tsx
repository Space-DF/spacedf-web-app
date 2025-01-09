import { getValidSubdomain } from '@/utils/subdomain'
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

  return <section>{children}</section>
}
