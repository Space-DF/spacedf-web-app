import React, { useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { dataTablePayload, Device } from '@/validator'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { FormLabel } from '@/components/ui/form'
import { useTranslations } from 'next-intl'
import { useDeviceEntity } from '../../../hooks/useDeviceEntity'
import { cn } from '@/lib/utils'
import { Check, ChevronDown } from 'lucide-react'

const getEntityNames = (entities: Device[]) => {
  return entities.map((entity) => entity.entity_name).join(', ')
}

const Source: React.FC = () => {
  const t = useTranslations('dashboard')
  const form = useFormContext<dataTablePayload>()
  const { setValue, watch } = form
  const selectedEntities = watch('source.entities') || []

  const [openCombobox, setOpenCombobox] = useState(false)

  const handleSelectEntity = (entity: Device) => {
    const isSelected = selectedEntities.some(
      (e) => e.entity_id === entity.entity_id
    )
    const updatedEntities = isSelected
      ? selectedEntities.filter((e) => e.entity_id !== entity.entity_id)
      : [...selectedEntities, entity]

    setValue('source.entities', updatedEntities)
  }

  const { data: entities } = useDeviceEntity('table')
  const entityList = entities?.results || []

  const entityNames = useMemo(
    () => getEntityNames(selectedEntities),
    [selectedEntities]
  )

  const selectedEntityIds = useMemo(() => {
    return selectedEntities.map((entity) => entity.entity_id)
  }, [selectedEntities])

  return (
    <div className="mt-4 size-full px-4">
      <p className="mb-[6px] text-sm font-semibold">
        <FormLabel
          className="text-sm font-semibold !text-brand-component-text-dark"
          required
        >
          {t('select_entity')}
        </FormLabel>
      </p>
      <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              'w-full justify-between rounded-lg bg-brand-fill-dark-soft px-3 duration-200 dark:bg-brand-heading font-normal text-sm',
              !!form.formState.errors.source?.entities &&
                'ring-red-600 ring-2 ring-offset-2 bg-brand-component-fill-negative-soft'
            )}
            variant="ghost"
            role="combobox"
            aria-expanded={openCombobox}
          >
            <p className="max-w-[86%] overflow-hidden text-ellipsis whitespace-nowrap text-brand-component-text-gray text-start">
              {entityNames || t('select_entity')}
            </p>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full p-0 bg-brand-component-fill-light-fixed dark:bg-brand-heading"
          align="start"
          sideOffset={4}
        >
          <Command className="bg-brand-component-fill-light-fixed dark:bg-brand-heading">
            <CommandInput placeholder={t('search_entity')} className="h-9" />
            <CommandList>
              <CommandEmpty>{t('no_entities_found')}</CommandEmpty>
              <CommandGroup>
                {entityList.length > 0 &&
                  entityList.map((entity) => (
                    <CommandItem
                      key={entity.id}
                      value={`${entity.unique_key}.${entity.entity_type.unique_key}`}
                      onSelect={() =>
                        handleSelectEntity({
                          entity_id: entity.id,
                          entity_name: entity.name,
                        })
                      }
                      className="cursor-pointer px-3 py-2 data-[selected=true]:bg-brand-component-fill-dark-soft"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div
                          className={cn(
                            'flex h-5 w-5 items-center justify-center rounded border border-brand-component-stroke-dark-soft',
                            selectedEntityIds.includes(entity.id)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-transparent'
                          )}
                        >
                          {selectedEntityIds.includes(entity.id) && (
                            <Check className="size-4" />
                          )}
                        </div>
                        <Label className="text-sm text-brand-component-text-dark cursor-pointer">
                          {`${entity.unique_key}.${entity.entity_type.unique_key}`}
                        </Label>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default Source
