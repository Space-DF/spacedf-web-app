import { useRef, useState } from 'react'

interface UseExpandableProps<T> {
  items: T[]
  initialCount?: number
  initialExpanded?: boolean
  onExpandChange?: (expanded: boolean) => void
}

interface UseExpandableReturn<T> {
  isExpanded: boolean
  maxHeight: string
  contentRef: React.RefObject<HTMLDivElement>
  toggleExpand: () => void
  visibleItems: T[]
  hiddenItems: T[]
}

export const useExpandable = <T>({
  items,
  initialCount = 2,
  initialExpanded = false,
  onExpandChange,
}: UseExpandableProps<T>): UseExpandableReturn<T> => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded)
  const contentRef = useRef<HTMLDivElement>(null)

  const visibleItems = isExpanded ? items : items.slice(0, initialCount)
  const hiddenItems = items.slice(initialCount)

  const maxHeight = isExpanded
    ? `${contentRef.current?.scrollHeight || 0}px`
    : '0px'

  const toggleExpand = () => {
    setIsExpanded((prev) => {
      const newValue = !prev
      onExpandChange?.(newValue)
      return newValue
    })
  }

  return {
    isExpanded,
    maxHeight,
    contentRef,
    toggleExpand,
    visibleItems,
    hiddenItems,
  }
}
