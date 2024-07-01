import React, { useRef, useState } from "react"

export const useCommand = (commandKey: string, onPress?: () => void) => {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === commandKey.toLowerCase() && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onPress?.()
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return
}
