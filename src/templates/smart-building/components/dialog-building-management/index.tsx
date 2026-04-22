'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { DragDropProvider } from '@dnd-kit/react'
import { isSortableOperation } from '@dnd-kit/react/sortable'
import type { DragEndEvent } from '@dnd-kit/dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { Floor } from '@/types/floor'
import { Building } from '@/types/building'
import { useFloorBuilding } from '../../hooks/useFloorBuilding'
import {
  useDeleteFloor,
  useUpdateBuilding,
} from './hooks/useBuildingManagement'
import { BuildingFormValues, buildingSchema } from './schema'
import { DragFloor } from './components/drag-floor'
import { DialogFloor } from './components/dialog-floor'

export type DialogBuildingManagementProps = {
  trigger?: ReactNode
  building: Building
  refetch: () => void
}

export function DialogBuildingManagement({
  trigger,
  building,
  refetch,
}: DialogBuildingManagementProps) {
  const t = useTranslations('smartBuilding')
  const [open, setOpen] = useState(false)

  const { data: floorsData, mutate: mutateFloors } = useFloorBuilding(
    open ? building.id : undefined
  )
  const floors = floorsData?.results ?? []

  const { trigger: updateBuilding, isMutating: isUpdatingBuilding } =
    useUpdateBuilding(building.id)

  const form = useForm<BuildingFormValues>({
    defaultValues: { name: building.name },
    resolver: zodResolver(buildingSchema),
  })

  useEffect(() => {
    if (building) {
      form.reset({ name: building.name })
    }
  }, [building])

  const handleOpenChange = (next: boolean) => {
    if (isUpdatingBuilding) return
    setOpen(next)
    if (next) form.reset({ name: building.name })
  }

  async function handleSave(values: BuildingFormValues) {
    try {
      await updateBuilding({ name: values.name })
      toast.success(t('building_management_save_success'))
      refetch()
      setOpen(false)
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : t('building_management_save_error')
      )
    }
  }

  const [orderedFloors, setOrderedFloors] = useState<Floor[]>([])
  const [floorToDelete, setFloorToDelete] = useState<Floor | null>(null)

  const { trigger: deleteFloor, isMutating: isDeleting } = useDeleteFloor(
    floorToDelete?.id ?? ''
  )

  const displayedFloors = orderedFloors.length ? orderedFloors : floors

  useEffect(() => {
    if (floors.length) setOrderedFloors(floors)
  }, [floors])

  const handleDeleteConfirm = async () => {
    try {
      await deleteFloor()
      toast.success(t('delete_floor_success'))
      setFloorToDelete(null)
      mutateFloors()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('delete_floor_error'))
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return
    const { operation } = event
    if (!isSortableOperation(operation)) return
    const { source, target } = operation
    if (!source || !target) return

    const fromIndex = source.sortable.initialIndex
    const toIndex = target.sortable.index
    if (fromIndex === toIndex) return

    setOrderedFloors((prev) => {
      const updated = [...prev]
      const [moved] = updated.splice(fromIndex, 1)
      updated.splice(toIndex, 0, moved)
      return updated
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="p-4 max-w-lg">
        <DialogHeader className="border-b-0 p-0 pb-4">
          <DialogTitle className="text-base font-semibold text-brand-component-text-dark dark:text-white">
            {t('building_management_title', { name: building.name })}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel
                    required
                    className="text-xs font-semibold text-brand-component-text-dark dark:text-white"
                  >
                    {t('building_name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t('building_name_placeholder')}
                      className="placeholder:text-brand-component-text-gray placeholder:font-medium"
                      isError={fieldState.invalid}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <div>
                <p className="text-xs font-semibold text-brand-component-text-dark dark:text-white">
                  {t('floor_list')}
                </p>
                <p className="text-xs text-brand-component-text-gray mt-1.5">
                  {t('floor_list_hint')}
                </p>
              </div>

              <DragDropProvider onDragEnd={handleDragEnd}>
                <div className="space-y-2 p-2 rounded-xl border border-brand-stroke-dark-soft">
                  {displayedFloors.map((floor, index) => (
                    <DragFloor
                      key={floor.id}
                      floor={floor}
                      buildingId={building.id}
                      index={index}
                      onSuccess={mutateFloors}
                      onDelete={() => setFloorToDelete(floor)}
                    />
                  ))}
                  <DialogFloor
                    buildingId={building.id}
                    nextLevel={displayedFloors.length + 1}
                    onSuccess={mutateFloors}
                    trigger={
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border border-brand-component-stroke-dark text-xs font-semibold"
                      >
                        + {t('add_new_floor')}
                      </Button>
                    }
                  />
                </div>
              </DragDropProvider>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-lg"
                >
                  {t('cancel')}
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="h-12 rounded-lg"
                loading={isUpdatingBuilding}
                disabled={isUpdatingBuilding}
              >
                {t('save')}
              </Button>
            </div>
          </form>
        </Form>

        <ConfirmDialog
          open={!!floorToDelete}
          title={t('delete_floor_title')}
          description={
            floorToDelete
              ? t('delete_floor_description', { name: floorToDelete.name })
              : ''
          }
          cancelLabel={t('cancel')}
          confirmLabel={t('delete')}
          isConfirming={isDeleting}
          destructive
          onCancel={() => setFloorToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      </DialogContent>
    </Dialog>
  )
}
