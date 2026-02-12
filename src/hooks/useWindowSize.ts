import { useState, useEffect, useRef } from 'react'

interface WindowSize {
  width: number
  height: number
}

interface UseWindowSizeOptions {
  debounceMs?: number
}

export function useWindowSize(options: UseWindowSizeOptions = {}): WindowSize {
  const { debounceMs = 100 } = options

  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function handleResize() {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }, debounceMs)
    }

    window.addEventListener('resize', handleResize)

    // Call handler right away so state gets updated with initial window size
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [debounceMs])

  return windowSize
}
