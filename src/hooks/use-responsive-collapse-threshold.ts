import { useState, useEffect } from 'react'
import { getResponsiveCollapseThreshold } from '@/utils/layout'

/**
 * Hook to track responsive collapse threshold based on screen size
 * Updates threshold when screen size changes
 */
export const useResponsiveCollapseThreshold = () => {
  const [threshold, setThreshold] = useState(() =>
    getResponsiveCollapseThreshold()
  )

  useEffect(() => {
    const handleResize = () => {
      setThreshold(getResponsiveCollapseThreshold())
    }

    // Initial check
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return threshold
}
