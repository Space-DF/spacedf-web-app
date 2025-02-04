export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
  // return <RootUserLayout>{children}</RootUserLayout>
}
