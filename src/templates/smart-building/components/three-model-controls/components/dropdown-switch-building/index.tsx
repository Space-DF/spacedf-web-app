'use client'

import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { EmptySelect } from '@/components/ui/empty-select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useEffect, useMemo } from 'react'
import { Building } from '@/types/building'
import { Area } from '@/types/area'
import { PaginationResponse } from '@/types/global'

interface DropdownSwitchBuildingProps {
  activeBuildingArea: Building | Area | undefined
  setActiveBuildingArea: (buildingArea: Building | Area | undefined) => void
  isLoadingAreaAndBuilding: boolean
  areaAndBuilding?: {
    area: PaginationResponse<Area>
    building: PaginationResponse<Building>
  }
}

export function DropdownSwitchBuilding({
  activeBuildingArea,
  setActiveBuildingArea,
  isLoadingAreaAndBuilding,
  areaAndBuilding,
}: DropdownSwitchBuildingProps) {
  const areaBuildingData = useMemo(() => {
    if (isLoadingAreaAndBuilding || !areaAndBuilding) return []
    const areas = (areaAndBuilding?.area.results || []).map((area) => ({
      ...area,
      type: 'area',
    }))
    const buildings = (areaAndBuilding?.building.results || []).map(
      (building) => ({
        ...building,
        type: 'building',
      })
    )
    return [...buildings, ...areas]
  }, [areaAndBuilding, isLoadingAreaAndBuilding])

  useEffect(() => {
    if (!areaBuildingData.length || activeBuildingArea) return
    setActiveBuildingArea(areaBuildingData[0])
  }, [areaBuildingData, activeBuildingArea])

  if (isLoadingAreaAndBuilding || !areaBuildingData.length) {
    return (
      <EmptySelect
        ariaLabel="Switch building/area"
        placeholder={
          isLoadingAreaAndBuilding ? 'Loading...' : 'No Building/Area'
        }
        triggerClassName="flex h-fit border-none items-center gap-2 py-2 rounded-lg bg-brand-component-hover-dark px-3 text-sm font-semibold text-white shadow-sm transition-colors"
        contentClassName="min-w-36"
      />
    )
  }

  return (
    <Select
      value={activeBuildingArea?.id}
      onValueChange={(value) => {
        setActiveBuildingArea(
          areaBuildingData.find((item) => item.id === value)
        )
      }}
    >
      <SelectTrigger
        aria-label="Switch floor"
        className="flex h-fit w-48 items-center rounded-lg bg-brand-component-hover-dark font-medium text-sm text-white shadow-sm transition-colors border-none"
        icon={<ChevronDown className="size-4 opacity-80" />}
      >
        {activeBuildingArea ? (
          <span className="truncate">{activeBuildingArea.name}</span>
        ) : (
          <SelectValue placeholder="Select Building/Area" />
        )}
      </SelectTrigger>
      <SelectContent className="min-w-52 bg-brand-component-fill-dark p-1">
        {areaBuildingData.map((areaBuilding) => {
          const isArea = areaBuilding.type === 'area'
          const value = areaBuilding.id
          const isActive = activeBuildingArea?.id === value

          return (
            <SelectItem
              key={areaBuilding.id}
              value={value}
              showCheckIcon={false}
              customRightIcon={
                <span
                  className={cn(
                    'shrink-0 rounded px-2 py-0.5 text-xs font-semibold',
                    isArea
                      ? 'bg-brand-dark-olive text-brand-component-text-warning'
                      : 'bg-brand-navy-blue text-brand-component-text-info'
                  )}
                >
                  {isArea ? 'Area' : 'Building'}
                </span>
              }
              className={cn(
                'flex items-center justify-between rounded-md p-2 cursor-pointer',
                'text-brand-component-text-gray focus:bg-brand-component-hover-dark focus:text-white',
                isActive && 'text-white bg-brand-component-hover-dark'
              )}
              itemTextClassName="flex justify-between w-full"
            >
              <span className="font-medium">{areaBuilding.name}</span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
