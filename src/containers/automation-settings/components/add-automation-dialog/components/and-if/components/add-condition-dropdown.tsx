import { AddAutomationFormValues, GroupType } from '../../../schema'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { UIEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { useAutomationStore } from '../stores/automation'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { useDeviceEntity } from '@/containers/dashboard/components/widget-selected/hooks/useDeviceEntity'
import { useFormContext, useWatch } from 'react-hook-form'
import { useDebounce } from '@/hooks'
import { uppercaseFirstLetter } from '@/utils'
import { useAutomationDialogPopoverPortal } from '../../../automation-dialog-popover-portal-context'

const CONDITION_OPTIONS = [
  ['and', 'And'],
  ['not', 'Not'],
  ['or', 'Or'],
] as const

interface Props {
  onAdd: (type: GroupType | 'leaf' | 'paste', entity?: string) => void
  isChildren?: boolean
}

export const AddConditionDropdown = ({ onAdd, isChildren }: Props) => {
  const popoverPortal = useAutomationDialogPopoverPortal()
  const currentCondition = useAutomationStore((state) => state.currentCondition)
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { control } = useFormContext<AddAutomationFormValues>()
  const deviceId = useWatch({ control, name: 'device_id' })
  const debouncedSearch = useDebounce(search, 300)
  const {
    data: entities,
    isLoading,
    isValidating,
    isReachingEnd,
    setSize,
  } = useDeviceEntity(undefined, debouncedSearch, deviceId)
  const entityOptions = useMemo(
    () =>
      entities?.results?.map((entity) => ({
        value: entity.category,
        label: uppercaseFirstLetter(entity.category),
      })) ?? [],
    [entities?.results]
  )

  useEffect(() => {
    setSize(1)
  }, [debouncedSearch, deviceId])

  const conditionOptions = useMemo(() => {
    const conditionOptions = currentCondition
      ? [...CONDITION_OPTIONS, ['paste', 'Paste Condition'] as const]
      : CONDITION_OPTIONS
    return conditionOptions
  }, [isChildren, currentCondition])

  const mergedOptions = useMemo(() => {
    const entityConditionOptions = entityOptions.map((entity) => ({
      key: entity.value,
      value: 'leaf' as const,
      label: entity.label,
      entity: entity.value,
      source: 'entity' as const,
    }))
    const baseConditionOptions = conditionOptions.map(([type, label]) => ({
      key: type,
      value: type,
      label,
      source: 'condition' as const,
    }))

    return [...baseConditionOptions, ...entityConditionOptions]
  }, [conditionOptions, entityOptions])

  const filteredOptions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    if (!normalizedSearch) return mergedOptions

    return mergedOptions.filter((option) =>
      `${option.value} ${option.label}`.toLowerCase().includes(normalizedSearch)
    )
  }, [mergedOptions, search])

  const handleScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      if (isValidating || isReachingEnd) return
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget
      if (scrollHeight - (scrollTop + clientHeight) <= 40) {
        setSize((prev) => prev + 1)
      }
    },
    [isReachingEnd, isValidating, setSize]
  )

  const t = useTranslations('automation')

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) setSearch('')
      }}
    >
      <PopoverTrigger asChild>
        <Button type="button" className="w-fit gap-2">
          {t('add_condition')}
          <Plus size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        container={popoverPortal?.popoverPortalContainerRef?.current}
        className="z-[100] min-w-52 rounded-xl border-0 bg-white p-1.5 shadow-lg pointer-events-auto"
        sideOffset={6}
      >
        <div className="border-b p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`${t('search_condition_placeholder')}...`}
              className="h-8 border-0 bg-brand-component-fill-dark-soft pl-8 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto p-1" onScroll={handleScroll}>
          {isLoading && entityOptions.length === 0 && (
            <div className="flex items-center gap-2 px-2 py-3 text-xs text-brand-component-text-gray">
              <Loader2 className="size-3 animate-spin" />
              <span>{t('loading_entities')}</span>
            </div>
          )}

          {filteredOptions.length === 0 && (
            <p className="px-2 py-3 text-xs text-brand-component-text-gray">
              {t('no_condition_found')}
            </p>
          )}

          {filteredOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                onAdd(
                  option.value as GroupType | 'leaf' | 'paste',
                  option.source === 'entity' ? option.entity : undefined
                )
                setIsOpen(false)
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-gray-900 hover:bg-gray-100 focus-visible:bg-gray-100 outline-none"
            >
              <span>{option.label}</span>
            </button>
          ))}

          {isValidating && entityOptions.length > 0 && (
            <div className="flex items-center justify-center gap-2 px-2 py-3 text-xs text-brand-component-text-gray">
              <Loader2 className="size-4 animate-spin" />
              <span>{t('loading_more_entities')}</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
