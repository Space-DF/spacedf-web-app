'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useDeviceEntity } from '@/containers/dashboard/components/widget-selected/hooks/useDeviceEntity'
import { useBulkUpdateDeviceEntities } from '../../hooks/useBulkUpdateDeviceEntities'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useDeviceStore } from '@/stores/device-store'
import { HelpCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

const LIST_ENTITY_SKELETON_ROW_COUNT = 5

const entityRowClassName = cn(
  'flex items-center gap-3 rounded-lg border border-brand-stroke-dark-soft bg-white px-3 py-2.5 dark:border-brand-stroke-outermost dark:bg-brand-component-fill-light'
)

const ListEntity = () => {
  const t = useTranslations('addNewDevice')
  const tSpace = useTranslations('space')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const deviceSelected = useDeviceStore((state) => state.deviceSelected)
  const { data: entities, isLoading: isLoadingEntities } = useDeviceEntity(
    undefined,
    undefined,
    deviceSelected
  )
  const { mutateAsync: bulkUpdateEntities, isPending: isSavingEntities } =
    useBulkUpdateDeviceEntities()

  const showSkeleton = isLoadingEntities

  const allEntities = useMemo(
    () =>
      (entities?.results ?? []).filter(
        (entity) => entity.category !== 'location'
      ),
    [entities]
  )

  const allIds = useMemo(() => allEntities.map((e) => e.id), [allEntities])

  const allSelected =
    allIds.length > 0 && allIds.every((id) => selected.has(id))

  const noneSelected = selected.size === 0

  const selectAllState = useMemo(() => {
    if (allSelected) return true as const
    if (noneSelected) return false as const
    return 'indeterminate' as const
  }, [allSelected, noneSelected])

  const toggleId = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelected(new Set(allIds))
      return
    }
    setSelected(new Set())
  }

  const handleSave = useCallback(async () => {
    if (!deviceSelected || !allIds.length) return
    const visible_entity_ids = allIds.filter((id) => selected.has(id))
    const hidden_entity_ids = allIds.filter((id) => !selected.has(id))
    await bulkUpdateEntities({ visible_entity_ids, hidden_entity_ids })
  }, [allIds, bulkUpdateEntities, deviceSelected, selected])

  const isDirty = useMemo(
    () =>
      allEntities.some(
        (entity) => selected.has(entity.id) !== entity.is_enabled
      ),
    [allEntities, selected]
  )

  useEffect(() => {
    if (!allEntities.length) return
    setSelected(
      allEntities.reduce((ids, entity) => {
        if (entity.is_enabled) ids.add(entity.id)
        return ids
      }, new Set<string>())
    )
  }, [allEntities])

  return (
    <TooltipProvider delayDuration={200}>
      <section
        className="flex flex-col gap-4"
        aria-labelledby="list-entity-heading"
        aria-busy={showSkeleton}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2
              id="list-entity-heading"
              className="text-base font-semibold text-brand-component-text-dark"
            >
              {t('available_entity')}
            </h2>
            {showSkeleton ? (
              <Skeleton className="h-6 w-9 shrink-0 rounded-full" aria-hidden />
            ) : (
              <span
                className="items-center justify-center font-medium rounded-full bg-brand-dark-fill-secondary px-2 py-0.5 text-white"
                aria-label={t('entity_count', { count: entities?.count ?? 0 })}
              >
                {allEntities.length}
              </span>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="shrink-0 rounded-full p-1 text-brand-component-text-gray transition-colors hover:bg-brand-component-fill-gray-soft hover:text-brand-component-text-dark"
                aria-label={t('entity_list_help_label')}
              >
                <HelpCircle className="size-5" strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-60 ring-0">
              {t('entity_list_help')}
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {showSkeleton ? (
            <>
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 shrink-0 rounded-sm" aria-hidden />
                <Skeleton className="h-4 w-20" aria-hidden />
              </div>
              <Skeleton className="h-8 w-28 shrink-0 rounded-md" aria-hidden />
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="list-entity-select-all"
                  checked={selectAllState}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="list-entity-select-all"
                  className="cursor-pointer text-sm font-medium text-brand-component-text-dark"
                >
                  {t('select_all')}
                </label>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                disabled={!isDirty || isSavingEntities}
                loading={isSavingEntities}
                className="p-1 h-7 flex items-center gap-1 rounded-md leading-4"
              >
                {tSpace('save_changes')}
              </Button>
            </>
          )}
        </div>

        <ul className="flex flex-col gap-2">
          {showSkeleton
            ? Array.from(
                { length: LIST_ENTITY_SKELETON_ROW_COUNT },
                (_, index) => (
                  <li key={index} className={entityRowClassName}>
                    <Skeleton
                      className="size-10 shrink-0 rounded-full"
                      aria-hidden
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <Skeleton className="h-4 w-3/5 max-w-48" aria-hidden />
                      <Skeleton className="h-3 w-full max-w-xs" aria-hidden />
                    </div>
                    <Skeleton
                      className="size-4 shrink-0 rounded-sm"
                      aria-hidden
                    />
                  </li>
                )
              )
            : allEntities.map((entity) => {
                const isChecked = selected.has(entity.id)

                return (
                  <li key={entity.id} className={entityRowClassName}>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-component-fill-gray-soft dark:bg-brand-component-fill-dark-soft">
                      <Image
                        src={entity.icon}
                        alt={entity.name}
                        width={20}
                        height={20}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-brand-component-text-dark">
                        {entity.name}
                      </p>
                      <p className="truncate text-xs text-brand-component-text-gray">
                        {entity.unique_key}
                      </p>
                    </div>
                    <Checkbox
                      id={entity.id}
                      checked={isChecked}
                      onCheckedChange={() => toggleId(entity.id)}
                      className="shrink-0"
                      aria-label={entity.name}
                    />
                  </li>
                )
              })}
        </ul>
      </section>
    </TooltipProvider>
  )
}

export default ListEntity
