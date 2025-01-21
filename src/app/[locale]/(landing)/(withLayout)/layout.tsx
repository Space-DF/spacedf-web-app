export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <div>{children}</div>
  // return <RootUserLayout>{children}</RootUserLayout>
}
