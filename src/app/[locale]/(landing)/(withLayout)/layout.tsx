import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from '@/i18n/routing'
import { Locale } from '@/types/global'
import { SearchProvider } from '@/contexts/search-organization-context'

export default async function UserLayout({
  children,
  params: { locale },
}: Readonly<{
  children: React.ReactNode
  params: { locale: Locale }
}>) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect({ href: '/', locale })
  }

  return <SearchProvider>{children}</SearchProvider>
}
