import { getCookie } from '@/utils'

export const useOrganization = () => {
  const organization = getCookie<string>('organization', '')
  return { organization, isOrganization: !!organization }
}
