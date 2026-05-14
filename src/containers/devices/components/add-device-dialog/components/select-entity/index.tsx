'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Droplets, LucideIcon, Thermometer } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useMemo, useState } from 'react'
import { Step } from '../add-device-scan-qr'

const ENTITY_ICONS: Record<string, LucideIcon> = {
  thermometer: Thermometer,
  droplets: Droplets,
}

export interface SelectEntityOption {
  id: string
  titleKey: string
  subtitle: string
  iconKey: keyof typeof ENTITY_ICONS
}

const DEFAULT_ENTITIES: SelectEntityOption[] = [
  {
    id: 'temp',
    titleKey: 'entity_temperature',
    subtitle: 'entity_id_temperature',
    iconKey: 'thermometer',
  },
  {
    id: 'humidity',
    titleKey: 'entity_humidity',
    subtitle: 'entity_id_humidity',
    iconKey: 'droplets',
  },
]

export interface SelectEntityProps {
  setStep: (step: Step) => void
  isAutoMode: boolean
  entities?: SelectEntityOption[]
}

export const SelectEntity = ({
  setStep,
  isAutoMode,
  entities = DEFAULT_ENTITIES,
}: SelectEntityProps) => {
  const t = useTranslations('addNewDevice')
  const [selected, setSelected] = useState<Set<string>>(() => new Set())

  const allIds = useMemo(() => entities.map((e) => e.id), [entities])
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selected.has(id))
  const noneSelected = selected.size === 0

  const selectAllState = useMemo(() => {
    if (allSelected) return true as const
    if (noneSelected) return false as const
    return 'indeterminate' as const
  }, [allSelected, noneSelected])

  const toggleId = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

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

  const handleContinue = () => {}

  const handleCancel = () => {
    if (isAutoMode) {
      setStep('add_device_auto')
    } else {
      setStep('add_device_manual')
    }
  }

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
        {entities.map((entity) => {
          const Icon = ENTITY_ICONS[entity.iconKey] ?? Thermometer
          const rowId = `entity-${entity.id}`
          const isChecked = selected.has(entity.id)

          return (
            <li
              key={entity.id}
              className={cn(
                'flex items-center gap-3 rounded-lg bg-brand-component-fill-gray-soft px-3 py-2.5 dark:bg-brand-component-fill-light'
              )}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-brand-component-fill-dark-soft">
                <Icon
                  className="size-5 text-brand-component-text-dark"
                  aria-hidden
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-component-text-dark">
                  {t(entity.titleKey as Parameters<typeof t>[0])}
                </p>
                <p className="truncate text-xs text-brand-component-text-gray">
                  {t(entity.subtitle as Parameters<typeof t>[0])}
                </p>
              </div>
              <Checkbox
                id={rowId}
                checked={isChecked}
                onCheckedChange={() => toggleId(entity.id)}
                className="shrink-0"
                aria-label={t(entity.titleKey as Parameters<typeof t>[0])}
              />
            </li>
          )
        })}
      </ul>

      <div className="flex justify-end gap-4 pt-1">
        <Button type="button" variant="outline" onClick={handleCancel}>
          {t('cancel')}
        </Button>
        <Button type="button" onClick={handleContinue}>
          {t('add_device')}
        </Button>
      </div>
    </div>
  )
}
