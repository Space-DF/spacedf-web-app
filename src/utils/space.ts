import { getClientSpace } from './common'
import { getServerSpace } from './server-actions'

export const getSpace = () => {
  if (typeof window !== 'undefined') return getClientSpace()
  return getServerSpace()
}
