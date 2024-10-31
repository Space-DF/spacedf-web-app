import { useEffect, useRef, useState } from 'react'

export const usePageTransition = (
  { duration }: { duration?: number } = { duration: 500 },
) => {
  const [startRender, setStartRender] = useState(false)
  const timeoutId = useRef<any>(null)
  useEffect(() => {
    clearTimeout(timeoutId.current)
    timeoutId.current = setTimeout(() => {
      setStartRender(true)
    }, duration)

    return () => {
      clearTimeout(timeoutId.current)
    }
  }, [duration])

  return { startRender }
}
