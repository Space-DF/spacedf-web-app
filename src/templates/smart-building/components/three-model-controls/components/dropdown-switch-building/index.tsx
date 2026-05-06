'use client'

import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBuilding } from '@/templates/smart-building/hooks/useBuilding'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { BuildingPlus } from '@/components/icons'
import { DialogUpload } from '../../../dialog-upload'
import { useAddDeviceStore } from '@/stores/template/add-device'
import { useShallow } from 'zustand/react/shallow'

export function DropdownSwitchBuilding() {
  const t = useTranslations('smartBuilding')
  const [selectOpen, setSelectOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const { data: buildings, mutate: mutateBuildings } = useBuilding()
  const { building, setBuilding } = useAddDeviceStore(
    useShallow((state) => ({
      building: state.building,
      setBuilding: state.setBuilding,
    }))
  )
  const buildingsData = useMemo(() => {
    return buildings?.results || []
  }, [buildings])

  useEffect(() => {
    if (!buildingsData.length || building) return
    setBuilding(buildingsData[0])
  }, [buildingsData, building])

  return (
    <>
      <DialogUpload
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        refetch={mutateBuildings}
      />
      <Select
        open={selectOpen}
        onOpenChange={setSelectOpen}
        value={building?.id}
        onValueChange={(value) => {
          setBuilding(buildingsData.find((item) => item.id === value))
          setSelectOpen(false)
        }}
      >
        <SelectTrigger
          aria-label="Switch floor"
          className="flex h-fit w-48 items-center rounded-lg bg-brand-component-hover-dark font-medium text-sm text-white shadow-sm transition-colors border-none"
          icon={<ChevronDown className="size-4 opacity-80" />}
        >
          {building ? (
            <span className="truncate">{building.name}</span>
          ) : (
            <SelectValue placeholder="Select Building" />
          )}
        </SelectTrigger>
        <SelectContent className="min-w-52 overflow-hidden bg-brand-component-fill-dark p-0">
          <div className="flex max-h-96 flex-col">
            <div className="flex min-h-40 max-h-72 flex-col overflow-y-auto p-1">
              {buildingsData.length ? (
                buildingsData.map((build) => {
                  const value = build.id
                  const isActive = building?.id === value

                  return (
                    <SelectItem
                      key={build.id}
                      value={value}
                      showCheckIcon={false}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-md p-2',
                        'text-brand-component-text-gray focus:bg-brand-component-hover-dark focus:text-white',
                        isActive && 'bg-brand-component-hover-dark text-white'
                      )}
                      itemTextClassName="flex w-full justify-between"
                    >
                      <span className="font-medium">{build.name}</span>
                    </SelectItem>
                  )
                })
              ) : (
                <div className="flex flex-1 items-center justify-center px-2 text-center">
                  <span className="text-sm text-brand-component-text-gray">
                    {t('no_buildings')}
                  </span>
                </div>
              )}
            </div>
            <div className="shrink-0 bg-brand-component-fill-dark p-1">
              <Button
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => {
                  setSelectOpen(false)
                  setUploadOpen(true)
                }}
                className="gap-2 w-full"
              >
                <span className="size-4 shrink-0">
                  <BuildingPlus width={22} height={22} />
                </span>
                {t('add_new_model')}
              </Button>
            </div>
          </div>
        </SelectContent>
      </Select>
    </>
  )
}
