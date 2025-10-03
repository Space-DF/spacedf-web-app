import { useState, useCallback } from 'react'

interface UseVideoControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>
}

export const useVideoControls = ({ videoRef }: UseVideoControlsProps) => {
  const [isPaused, setIsPaused] = useState(false)

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current?.srcObject) return
    const stream = videoRef.current.srcObject as MediaStream
    stream.getTracks().forEach((track) => (track.enabled = isPaused))
    setIsPaused(!isPaused)
  }, [videoRef, isPaused])

  return {
    isPaused,
    togglePlayPause,
  }
}
