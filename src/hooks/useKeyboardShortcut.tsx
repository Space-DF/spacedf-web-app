import React from 'react'

//TODO: Add tutorial to this hook
export const useKeyboardShortcut = ({
  keys,
  isSingle = true,
  onPress,
  matchKeysCallback,
}: {
  keys: string[]
  isSingle?: boolean
  onPress?: () => void
  matchKeysCallback?: (keys: string[], event: KeyboardEvent) => boolean
}) => {
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (isSingle) return handleSingleKey(e)

      if (
        typeof matchKeysCallback?.(keys, e) === 'boolean' &&
        !!matchKeysCallback?.(keys, e)
      ) {
        e.preventDefault()
        onPress?.()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSingleKey = (event: KeyboardEvent) => {
    if (
      event.key === keys[0].toLowerCase() &&
      (event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault()
      onPress?.()
    }
  }

  return
}
