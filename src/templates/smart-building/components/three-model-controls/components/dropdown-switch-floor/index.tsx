'use client'

import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffect, useMemo } from 'react'
import { useFloorBuilding } from '@/templates/smart-building/hooks/useFloorBuilding'
import { EmptySelect } from '@/components/ui/empty-select'
import { Floor } from '@/types/floor'

interface DropdownSwitchFloorProps {
  buildingId?: string
  activeFloor?: Floor
  setActiveFloor: (floor: Floor | undefined) => void
}

export function DropdownSwitchFloor({
  buildingId,
  activeFloor,
  setActiveFloor,
}: DropdownSwitchFloorProps) {
  const { data: floors, isLoading: isLoadingFloors } =
    useFloorBuilding(buildingId)
  const floorsData = useMemo(() => {
    if (isLoadingFloors || !floors) return []
    return floors.results
  }, [floors, isLoadingFloors])

  useEffect(() => {
    if (!floorsData.length) return
    setActiveFloor(floorsData[0])
  }, [floorsData])

  if (isLoadingFloors || !floorsData.length) {
    return (
      <EmptySelect
        ariaLabel="Switch floor"
        placeholder={isLoadingFloors ? 'Loading...' : 'No Floor'}
        triggerClassName="flex h-fit border-none items-center gap-2 py-2 w-32 rounded-lg bg-brand-component-hover-dark px-3 text-sm font-semibold text-white shadow-sm transition-colors"
        contentClassName="min-w-32"
      />
    )
  }

  return (
    <Select
      value={activeFloor?.id}
      onValueChange={(value) =>
        setActiveFloor(floorsData.find((floor) => floor.id === value))
      }
    >
      <SelectTrigger
        aria-label="Switch floor"
        className="flex h-fit items-center gap-2 py-2 w-32 rounded-lg bg-brand-component-hover-dark px-3 text-sm font-semibold text-white shadow-sm transition-colors border-none"
        icon={<ChevronDown className="size-4 opacity-80" />}
      >
        <SelectValue placeholder="Select Floor" />
      </SelectTrigger>
      <SelectContent className="min-w-32 bg-brand-component-fill-dark p-1">
        {floorsData.map((floor) => (
          <SelectItem
            key={floor.id}
            value={floor.id}
            showCheckIcon={false}
            className={cn(
              'flex items-center rounded-md p-2 cursor-pointer',
              'text-brand-component-text-gray focus:bg-brand-component-hover-dark focus:text-white',
              activeFloor?.id === floor.id &&
                !!activeFloor &&
                'text-white bg-brand-component-hover-dark'
            )}
          >
            <span className="font-medium tabular-nums">{floor.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
