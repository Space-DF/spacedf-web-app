import { useIsDemo } from './useIsDemo'
import { useAuthenticated } from './useAuthenticated'

export const useShowDummyData = () => {
  const isDemo = useIsDemo()
  const isAuthenticated = useAuthenticated()
  return isDemo || !isAuthenticated
}
