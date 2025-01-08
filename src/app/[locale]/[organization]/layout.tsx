import { getValidSubdomain } from '@/utils/subdomain'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default function Layout({ children }: { children: React.ReactNode }) {
  const headersList = headers()

  // Get the 'host' header
  const host = headersList.get('host') || 'localhost'

  console.log({ host })

  //   console.log({ host })
  const org = getValidSubdomain(host)

  if (!org) {
    redirect('/')
  }

  return <section>{children}</section>
}
