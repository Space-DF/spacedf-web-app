import { Button } from '@/components/ui/button'
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
import {
  FormItem,
  FormField,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Label } from '@/components/ui/label'
import { useTranslations } from 'next-intl'
import { SwitchPayload } from '@/validator'
import { useFormContext, useWatch } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { useDeviceEntity } from '../../../../hooks/useDeviceEntity'
import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useDebounce } from '@/hooks'
import { Skeleton } from '@/components/ui/skeleton'

const SwitchSource = () => {
  const t = useTranslations('dashboard')
  const form = useFormContext<SwitchPayload>()
  const [openCombobox, setOpenCombobox] = useState(false)

  const selectedEntityId = useWatch({
    control: form.control,
    name: 'source.entity_id',
  })

  const [entityName, setEntityName] = useState('')
  const entityNameDebounce = useDebounce(entityName)
  const { data: entities, isLoading } = useDeviceEntity(
    'switch',
    entityNameDebounce
  )
  const entityList = entities?.results || []

  const selectEntityName = useMemo(() => {
    return (
      entityList.find((entity) => entity.unique_key === selectedEntityId)
        ?.name || ''
    )
  }, [entityList, selectedEntityId])

  const handleSelectEntity = (entityId: string) => {
    const currentEntityId = form.getValues('source.entity_id')
    const isSelected = entityId === currentEntityId
    form.setValue('source.entity_id', isSelected ? '' : entityId)
  }

  const isError = form.formState.errors.source?.entity_id

  return (
    <div className="size-full">
      <FormField
        control={form.control}
        name="source.entity_id"
        render={() => (
          <FormItem>
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
                    isError &&
                      'ring-red-600 ring-2 ring-offset-2 bg-brand-component-fill-negative-soft'
                  )}
                  variant="ghost"
                  role="combobox"
                  aria-expanded={openCombobox}
                >
                  <p className="max-w-[86%] overflow-hidden text-ellipsis whitespace-nowrap text-brand-component-text-gray text-start">
                    {selectEntityName || t('select_entity')}
                  </p>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-full p-0 bg-brand-component-fill-light-fixed dark:bg-brand-heading"
                align="start"
                sideOffset={4}
              >
                <Command
                  className="bg-brand-component-fill-light-fixed dark:bg-brand-heading"
                  shouldFilter={false}
                >
                  <CommandInput
                    placeholder={t('search_entity')}
                    className="h-9"
                    onValueChange={(value) => setEntityName(value)}
                  />
                  <CommandList>
                    {isLoading ? (
                      <div className="p-2 space-y-2">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Skeleton
                            key={idx}
                            className="h-4 w-full bg-brand-component-fill-gray-soft"
                          />
                        ))}
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>{t('no_entities_found')}</CommandEmpty>
                        <CommandGroup>
                          {entityList.length > 0 &&
                            entityList.map((entity) => (
                              <CommandItem
                                key={entity.id}
                                value={entity.unique_key}
                                onSelect={() =>
                                  handleSelectEntity(entity.unique_key)
                                }
                                className={cn(
                                  'cursor-pointer px-3 py-2',
                                  selectedEntityId === entity.unique_key
                                    ? 'bg-brand-component-fill-dark-soft'
                                    : ''
                                )}
                              >
                                <div className="flex items-center gap-3 w-full">
                                  <Label className="text-sm text-brand-component-text-dark cursor-pointer">
                                    {`${entity.unique_key} - ${entity.device_name}`}
                                  </Label>
                                </div>
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default SwitchSource
