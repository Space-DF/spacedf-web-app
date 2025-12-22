import { NEXT_PUBLIC_MAP_ENABLED, NEXT_PUBLIC_NODE_ENV } from '@/shared/env'
import dynamic from 'next/dynamic'

const currentTemplate = 'fleet-tracking'
export default function SpaceDetail() {
  const Template = dynamic(
    () => import(`@/containers/templates/${currentTemplate}`),
    {
      ssr: false,
    }
  )

  if (
    NEXT_PUBLIC_NODE_ENV === 'development' &&
    NEXT_PUBLIC_MAP_ENABLED !== 'true'
  ) {
    return (
      <div className="p-4">
        <h1 className="text-base">Map is not enabled in development mode</h1>
      </div>
    )
  }

  return <Template />
}
