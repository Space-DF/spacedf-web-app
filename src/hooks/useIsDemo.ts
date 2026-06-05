import { DEMO_SUBDOMAIN } from '@/constants'
import { useOrganization } from './useOrganization'

export const useIsDemo = () => {
  const { organization } = useOrganization()
  return organization === DEMO_SUBDOMAIN
}
