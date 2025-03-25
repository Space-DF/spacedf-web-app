'use server'
import { getClientOrganization } from './common'
import { getServerOrganization } from './server-actions'

export const getOrganization = () => {
  if (typeof window !== 'undefined') return getClientOrganization()
  return getServerOrganization()
}
