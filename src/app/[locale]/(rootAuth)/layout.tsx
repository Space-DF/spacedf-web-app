import '@/styles/globals.css'
import { RootUserLayout } from '@/components/layouts/root-layout'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <RootUserLayout>{children}</RootUserLayout>
}
