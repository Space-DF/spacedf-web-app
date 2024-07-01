import { useEffect, useRef, useState } from "react"

export const usePageTransition = (
  { duation }: { duation?: number } = { duation: 500 }
) => {
  const [startRender, setStartRender] = useState(false)
  const timeoutId = useRef<any>(null)
  useEffect(() => {
    clearTimeout(timeoutId.current)
    timeoutId.current = setTimeout(() => {
      setStartRender(true)
    }, duation)

    return () => {
      clearTimeout(timeoutId.current)
    }
  }, [duation])

  return [startRender]
}
