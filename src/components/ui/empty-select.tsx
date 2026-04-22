'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronDown } from 'lucide-react'

export type EmptySelectProps = {
  placeholder?: string
  emptyLabel?: string
  ariaLabel?: string
  className?: string
  triggerClassName?: string
  contentClassName?: string
}

export function EmptySelect({
  placeholder = 'No options',
  emptyLabel = 'No options',
  ariaLabel,
  className,
  triggerClassName,
  contentClassName,
}: EmptySelectProps) {
  return (
    <Select disabled>
      <SelectTrigger
        aria-label={ariaLabel}
        className={cn(triggerClassName)}
        icon={<ChevronDown className="size-4 opacity-80" />}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={cn('min-w-36', contentClassName)}>
        <SelectItem value="__empty__" disabled className={cn(className)}>
          {emptyLabel}
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
