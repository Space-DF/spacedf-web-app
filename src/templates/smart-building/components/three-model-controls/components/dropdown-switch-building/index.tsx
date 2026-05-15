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
import { BuildingPlus, Trash2 } from '@/components/icons'
import { DialogUpload } from '../../../dialog-upload'
import { useAddDeviceStore } from '@/stores/template/add-device'
import { useShallow } from 'zustand/react/shallow'
import Pen from '@/components/icons/pen'
import type { Building } from '@/types/building'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useDeleteBuilding } from '@/templates/smart-building/hooks/useDeleteBuilding'
import { toast } from 'sonner'
export function DropdownSwitchBuilding() {
  const t = useTranslations('smartBuilding')
  const [selectOpen, setSelectOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [buildingToEdit, setBuildingToEdit] = useState<Building | null>(null)
  const [buildingToDelete, setBuildingToDelete] = useState<Building | null>(
    null
  )
  const { data: buildings } = useBuilding()
  const { mutateAsync: deleteBuilding, isPending: isDeleting } =
    useDeleteBuilding(buildingToDelete?.id)
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
    if (!buildingsData.length) return

    const matched = building
      ? buildingsData.find((item) => item.id === building.id)
      : undefined
    const next = matched ?? buildingsData[0]

    if (building?.id !== next.id) {
      setBuilding(next)
    }
  }, [buildingsData, building, setBuilding])

  const handleOpenChange = (next: boolean) => {
    setUploadOpen(next)
    if (!next) setBuildingToEdit(null)
  }
  const handleSaved = (saved: Building) => {
    setBuilding(saved)
  }

  const handleConfirmDelete = async () => {
    if (!buildingToDelete?.id) return
    if (buildingsData.length === 1) {
      toast.error(t('delete_building_last_building_error'))
      return
    }
    await deleteBuilding()

    const nextBuildings = buildingsData.filter(
      (item) => item.id !== buildingToDelete.id
    )
    if (building?.id === buildingToDelete.id) {
      setBuilding(nextBuildings[0])
    }
    setBuildingToDelete(null)
  }

  const handleCancel = () => {
    if (isDeleting) return
    setBuildingToDelete(null)
  }

  const handleAddBuilding = () => {
    setBuildingToEdit(null)
    setSelectOpen(false)
    setUploadOpen(true)
  }

  const handleDeleteBuilding = (build: Building) => {
    setBuildingToDelete(build)
    setSelectOpen(false)
  }

  const handleEditBuilding = (build: Building) => {
    setBuildingToEdit(build)
    setSelectOpen(false)
    setUploadOpen(true)
  }

  const handleSelectBuilding = (value: string) => {
    setBuilding(buildingsData.find((item) => item.id === value))
    setSelectOpen(false)
  }

  return (
    <>
      <ConfirmDialog
        open={!!buildingToDelete}
        title={t('delete_building_title')}
        description={t('delete_building_description', {
          name: buildingToDelete?.name ?? '',
        })}
        cancelLabel={t('cancel')}
        confirmLabel={t('delete')}
        destructive
        isConfirming={isDeleting}
        onCancel={handleCancel}
        onConfirm={handleConfirmDelete}
      />
      <DialogUpload
        open={uploadOpen}
        onOpenChange={handleOpenChange}
        buildingToEdit={buildingToEdit}
        onSaved={handleSaved}
      />
      <Select
        open={selectOpen}
        onOpenChange={setSelectOpen}
        value={building?.id}
        onValueChange={handleSelectBuilding}
      >
        <SelectTrigger
          aria-label="Switch floor"
          className="flex h-fit w-56 items-center rounded-lg bg-brand-component-hover-dark dark:bg-brand-component-fill-gray-soft font-medium text-sm text-white shadow-sm transition-colors border-none"
          icon={<ChevronDown className="size-4 opacity-80" />}
        >
          {building ? (
            <span className="truncate max-w-32">{building.name}</span>
          ) : (
            <SelectValue placeholder="Select Building" />
          )}
        </SelectTrigger>
        <SelectContent
          className="min-w-72 overflow-hidden bg-brand-component-fill-light dark:bg-brand-component-fill-gray-soft p-0 border-none"
          side="bottom"
        >
          <div className="flex max-h-96 flex-col">
            <div className="flex max-h-72 flex-col overflow-y-auto p-1">
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
                        'flex cursor-pointer items-center justify-between rounded-md p-2 py-4',
                        'text-brand-component-text-dark',
                        isActive && 'bg-brand-component-fill-dark-soft'
                      )}
                      itemTextClassName="flex w-full justify-between"
                      customRightIcon={
                        <div
                          className="flex space-x-1"
                          onPointerDown={(e) => e.stopPropagation()}
                          onPointerUp={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="icon"
                            type="button"
                            aria-label={t(
                              'edit_upload_3d_building_area_dialog_title'
                            )}
                            onClick={() => handleEditBuilding(build)}
                          >
                            <Pen />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            type="button"
                            aria-label={t('delete_building_title')}
                            onClick={() => handleDeleteBuilding(build)}
                          >
                            <Trash2 fill="#FFFFFF" />
                          </Button>
                        </div>
                      }
                    >
                      <span className="truncate font-medium">{build.name}</span>
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
            <div className="shrink-0 bg-brand-component-fill-light dark:bg-brand-component-fill-gray-soft p-1">
              <Button
                type="button"
                onPointerDown={(e) => e.preventDefault()}
                onClick={handleAddBuilding}
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
