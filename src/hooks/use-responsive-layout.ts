import { useState, useEffect } from 'react'
import { getResponsiveLayout } from '@/utils/layout'

export const useResponsiveLayout = (defaultLayout: number[] = [15, 85]) => {
  const [layout, setLayout] = useState(() => getResponsiveLayout(defaultLayout))

  useEffect(() => {
    const handleResize = () => {
      setLayout(getResponsiveLayout(defaultLayout))
    }

    // Initial check
    handleResize()

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [JSON.stringify(defaultLayout)])

  return layout
}
