'use client'

import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useMemo, useState } from 'react'

export function DropdownSwitchFloor({ className }: { className?: string }) {
  const floors = useMemo(() => ['1F', '2F', '3F'], [])
  const [activeFloor, setActiveFloor] = useState<string>(floors[0] ?? '1F')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Switch floor"
          className={cn(
            'flex h-fit items-center gap-2 py-2 rounded-lg bg-brand-component-fill-dark px-3 text-sm font-semibold text-white shadow-sm ring-1 ring-inset ring-white/10 transition-colors hover:bg-brand-component-fill-dark/80',
            className
          )}
        >
          <span className="tabular-nums">{activeFloor}</span>
          <ChevronDown className="size-4 opacity-80" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-[140px]">
        {floors.map((floor) => (
          <DropdownMenuItem
            key={floor}
            onSelect={() => {
              setActiveFloor(floor)
            }}
            className={cn(
              'flex items-center justify-between',
              activeFloor === floor && 'bg-accent'
            )}
          >
            <span className="font-medium text-brand-component-text-dark">
              {floor}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
