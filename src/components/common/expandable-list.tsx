import React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExpandable } from '@/hooks/useExandable'

interface ExpandableListProps<T> {
  items: T[]
  initialCount?: number
  renderItem: (item: T, index: number, isExpanded: boolean) => React.ReactNode
  className?: string
}

const ExpandableList = <T,>({
  items,
  initialCount = 2,
  renderItem,
  className,
}: ExpandableListProps<T>) => {
  const {
    isExpanded,
    maxHeight,
    contentRef,
    toggleExpand,
    visibleItems,
    hiddenItems,
  } = useExpandable<T>({
    items,
    initialCount,
  })

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {visibleItems.map((item, index) => renderItem(item, index, true))}
      <div
        className="overflow-hidden transition-all duration-700 ease-in-out"
        style={{ maxHeight }}
      >
        <div ref={contentRef} className="gap-y-1 flex flex-col">
          {hiddenItems.map((item, index) =>
            renderItem(item, index, isExpanded)
          )}
        </div>
      </div>
      <button
        className="w-full border-none p-2 flex items-center justify-center gap-x-1 text-brand-component-text-dark text-sm font-medium"
        onClick={toggleExpand}
      >
        <p>{isExpanded ? 'Less' : 'More'}</p>{' '}
        <ChevronDown
          className={cn(
            'size-5 transition-transform duration-300',
            isExpanded ? 'rotate-180' : ''
          )}
        />
      </button>
    </div>
  )
}

export default ExpandableList
