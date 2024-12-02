import { headers } from 'next/headers'
import TestContainer from './containers'
import { redirect } from 'next/navigation'

export default async function Page() {
  const headersList = await headers()
  const host = headersList.get('host')

  if (!host?.includes('localhost')) {
    redirect('/')
  }
  return <TestContainer />
}
