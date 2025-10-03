import { useState, useEffect, useCallback } from 'react'

interface UseFullscreenProps {
  containerRef: React.RefObject<HTMLDivElement>
  videoRef: React.RefObject<HTMLVideoElement>
}

export const useFullscreen = ({
  containerRef,
  videoRef,
}: UseFullscreenProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleFullScreen = useCallback(async () => {
    try {
      if (containerRef.current && !document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    } catch {
      // Fallback to video element fullscreen
      if (videoRef.current) {
        await videoRef.current.requestFullscreen()
        setIsFullscreen(true)
      }
    }
  }, [containerRef, videoRef])

  const handleExitFullScreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        handleExitFullScreen()
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen, handleExitFullScreen])

  return {
    isFullscreen,
    handleFullScreen,
    handleExitFullScreen,
  }
}
