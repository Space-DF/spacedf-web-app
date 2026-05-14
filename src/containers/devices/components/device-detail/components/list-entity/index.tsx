'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  Droplets,
  HelpCircle,
  LucideIcon,
  Scale,
  Thermometer,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useMemo, useState } from 'react'

const ENTITY_ICONS = {
  thermometer: Thermometer,
  droplets: Droplets,
  scale: Scale,
} as const

type IconKey = keyof typeof ENTITY_ICONS

type MockEntityRow = {
  id: string
  titleKey: 'entity_temperature' | 'entity_humidity' | 'entity_weight'
  subtitleKey:
    | 'entity_id_temperature'
    | 'entity_id_humidity'
    | 'entity_id_weight'
  iconKey: IconKey
}

const MOCK_ENTITIES: MockEntityRow[] = [
  {
    id: 'temp-01',
    titleKey: 'entity_temperature',
    subtitleKey: 'entity_id_temperature',
    iconKey: 'thermometer',
  },
  {
    id: 'humidity-01',
    titleKey: 'entity_humidity',
    subtitleKey: 'entity_id_humidity',
    iconKey: 'droplets',
  },
  {
    id: 'humidity-02',
    titleKey: 'entity_humidity',
    subtitleKey: 'entity_id_humidity',
    iconKey: 'droplets',
  },
  {
    id: 'weight-01',
    titleKey: 'entity_weight',
    subtitleKey: 'entity_id_weight',
    iconKey: 'scale',
  },
  {
    id: 'weight-02',
    titleKey: 'entity_weight',
    subtitleKey: 'entity_id_weight',
    iconKey: 'scale',
  },
]

const initialSelectedIds = () =>
  new Set(
    MOCK_ENTITIES.filter(
      (e) => e.id !== 'weight-01' && e.id !== 'weight-02'
    ).map((e) => e.id)
  )

const ListEntity = () => {
  const t = useTranslations('addNewDevice')
  const tSpace = useTranslations('space')
  const [selected, setSelected] = useState<Set<string>>(initialSelectedIds)

  const allIds = useMemo(() => MOCK_ENTITIES.map((e) => e.id), [])
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

  const handleSave = useCallback(() => {
    // Mock: wire to API later
  }, [])

  return (
    <TooltipProvider delayDuration={200}>
      <section
        className="flex flex-col gap-4"
        aria-labelledby="list-entity-heading"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h2
              id="list-entity-heading"
              className="text-base font-semibold text-brand-component-text-dark"
            >
              {t('available_entity')}
            </h2>
            <span
              className="items-center justify-center font-medium rounded-full bg-brand-dark-fill-secondary px-2 py-0.5 text-white"
              aria-label={t('entity_count', { count: MOCK_ENTITIES.length })}
            >
              {MOCK_ENTITIES.length}
            </span>
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
            className="p-1 h-fit flex items-center gap-1 rounded-md leading-4"
          >
            {tSpace('save_changes')}
          </Button>
        </div>

        <ul className="flex flex-col gap-2">
          {MOCK_ENTITIES.map((entity) => {
            const Icon: LucideIcon = ENTITY_ICONS[entity.iconKey] ?? Thermometer
            const rowId = `list-entity-${entity.id}`
            const isChecked = selected.has(entity.id)

            return (
              <li
                key={entity.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border border-brand-stroke-dark-soft bg-white px-3 py-2.5 dark:border-brand-stroke-outermost dark:bg-brand-component-fill-light'
                )}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-component-fill-gray-soft dark:bg-brand-component-fill-dark-soft">
                  <Icon
                    className="size-5 text-brand-component-text-dark"
                    aria-hidden
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-brand-component-text-dark">
                    {t(entity.titleKey)}
                  </p>
                  <p className="truncate text-xs text-brand-component-text-gray">
                    {t(entity.subtitleKey)}
                  </p>
                </div>
                <Checkbox
                  id={rowId}
                  checked={isChecked}
                  onCheckedChange={() => toggleId(entity.id)}
                  className="shrink-0"
                  aria-label={t(entity.titleKey)}
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
