'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Step } from '../add-device-scan-qr'
import Image from 'next/image'
import { Entity } from '@/types/entity'
import { useBulkUpdateDeviceEntities } from '../../../device-detail/hooks/useBulkUpdateDeviceEntities'

const entityRowClassName = cn(
  'flex items-center gap-3 rounded-lg bg-brand-component-fill-gray-soft px-3 py-2.5 dark:bg-brand-component-fill-light'
)

export interface SelectEntityProps {
  setStep: (step: Step) => void
  entities: Entity[]
  onClose: () => void
}

export const SelectEntity = ({
  setStep,
  entities,
  onClose,
}: SelectEntityProps) => {
  const t = useTranslations('addNewDevice')
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const { mutateAsync: bulkUpdateEntities, isPending: isSavingEntities } =
    useBulkUpdateDeviceEntities()

  const allEntities = entities.filter(
    (entity) => entity.category !== 'location'
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

  const handleSelectAll = useCallback(
    (checked: boolean | 'indeterminate') => {
      if (checked === true) {
        setSelected(new Set(allIds))
        return
      }
      setSelected(new Set())
    },
    [allIds]
  )

  const handleContinue = useCallback(async () => {
    if (!allIds.length) return
    const visible_entity_ids = allIds.filter((id) => selected.has(id))
    const hidden_entity_ids = allIds.filter((id) => !selected.has(id))
    await bulkUpdateEntities({ visible_entity_ids, hidden_entity_ids })
    setStep('add_device_success')
  }, [allIds, bulkUpdateEntities, selected, setStep])

  useEffect(() => {
    if (!allEntities.length) return
    setSelected(
      allEntities.reduce((ids, entity) => {
        if (entity.is_enabled) ids.add(entity.id)
        return ids
      }, new Set<string>())
    )
  }, [entities])

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="space-y-2 w-full">
        <div className="flex w-full items-center justify-between">
          <span className="text-xs font-semibold uppercase text-brand-component-text-gray">
            {t('entity_available')}
          </span>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectAllState}
              onCheckedChange={handleSelectAll}
            />
            <label
              htmlFor="select-all"
              className="cursor-pointer font-medium text-brand-component-text-dark"
            >
              {t('select_all')}
            </label>
          </div>
        </div>
        <Separator className="bg-brand-stroke-dark-soft" />
      </div>

      <ul className="flex flex-col gap-2">
        {allEntities.map((entity) => {
          const isChecked = selected.has(entity.id)
          const rowId = `select-entity-row-${entity.id}`

          return (
            <li key={entity.id} className={entityRowClassName}>
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-brand-component-fill-dark-soft">
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
                id={rowId}
                checked={isChecked}
                onCheckedChange={() => toggleId(entity.id)}
                className="shrink-0"
                aria-label={entity.name}
              />
            </li>
          )
        })}
      </ul>

      <div className="flex justify-end gap-4 pt-1">
        <Button type="button" variant="outline" onClick={onClose}>
          {t('cancel')}
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={isSavingEntities}
          loading={isSavingEntities}
        >
          {t('add_device')}
        </Button>
      </div>
    </div>
  )
}
