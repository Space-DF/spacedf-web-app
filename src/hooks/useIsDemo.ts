import { DEMO_SUBDOMAIN } from '@/constants'
import { useParams } from 'next/navigation'

export const useIsDemo = () => {
  const { organization } = useParams()
  return organization === DEMO_SUBDOMAIN
}
