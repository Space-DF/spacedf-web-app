import { NEXT_PUBLIC_MAP_ENABLED } from '@/shared/env'
import dynamic from 'next/dynamic'
import { headers } from 'next/headers'

const currentTemplate = 'fleet-tracking'
export default function DigitalTwins() {
  const headersList = headers()
  const host = headersList.get('host')

  const Template = dynamic(() => import(`@/templates/${currentTemplate}`), {
    ssr: false,
  })

  const isLocal = host?.includes('localhost:')

  if (isLocal && NEXT_PUBLIC_MAP_ENABLED !== 'true') {
    return (
      <div className="p-4">
        <h1 className="text-base">Map is not enabled in development mode</h1>
      </div>
    )
  }

  return <Template />
}
