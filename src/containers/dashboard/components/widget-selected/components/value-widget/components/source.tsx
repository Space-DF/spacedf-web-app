import React, { ChangeEvent, useMemo, useState } from 'react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useFormContext } from 'react-hook-form'
import { ValuePayload } from '@/validator'
import { Check, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useDeviceEntity } from '../../../hooks/useDeviceEntity'
import { cn } from '@/lib/utils'

const Source = () => {
  const form = useFormContext<ValuePayload>()
  const { control } = form
  const entityId = form.watch('source.entity_id')

  const [openCombobox, setOpenCombobox] = useState(false)

  const { data: entities } = useDeviceEntity('value')
  const entityList = entities?.results || []
  const t = useTranslations('dashboard')

  const handleDecimalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    const numericValue = Number(inputValue)
    if (inputValue === '') {
      form.setValue('source.decimal', 0)
      return
    }
    if (isNaN(numericValue)) return
    if (numericValue > 10) return form.setValue('source.decimal', 10)
    if (numericValue < 0) return form.setValue('source.decimal', 0)
    form.setValue('source.decimal', numericValue)
  }

  const currentEntity = useMemo(() => {
    return entities?.results.find((entity) => entity.id === entityId)
  }, [entities, entityId])

  return (
    <div className="space-y-4 mb-2">
      <div className="grid grid-cols-2 gap-2 gap-y-4">
        <FormField
          control={control}
          name="source.entity_id"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel
                className="text-xs font-semibold text-brand-component-text-dark"
                required
              >
                {t('device_entity')}
              </FormLabel>
              <FormControl>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="font-normal text-sm w-full justify-between border-none bg-brand-component-fill-dark-soft outline-none ring-0 hover:bg-brand-component-fill-dark-soft focus:ring-0 dark:bg-brand-heading dark:hover:bg-brand-heading"
                    >
                      <p className="truncate w-5/6 text-start">
                        {currentEntity
                          ? `${currentEntity?.unique_key}.${currentEntity?.entity_type.unique_key}`
                          : t('select_entity')}
                      </p>
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0 bg-brand-component-fill-light-fixed dark:bg-brand-heading">
                    <Command className="bg-brand-component-fill-light-fixed dark:bg-brand-heading">
                      <CommandInput
                        placeholder={t('search_entity')}
                        className="h-9"
                      />
                      <CommandList>
                        <CommandEmpty>{t('no_devices_found')}</CommandEmpty>
                        <CommandGroup>
                          {entityList.length > 0 &&
                            entityList.map((entity) => (
                              <CommandItem
                                key={entity.id}
                                value={`${entity.unique_key}.${entity.entity_type.unique_key}`}
                                onSelect={() => {
                                  field.onChange(entity.id)
                                  setOpenCombobox(false)
                                }}
                                className="data-[selected=true]:bg-brand-component-fill-gray-soft"
                              >
                                {`${entity.unique_key}.${entity.entity_type.unique_key}`}
                                <Check
                                  className={cn(
                                    'ml-auto size-4',
                                    field.value === entity.id
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="source.unit"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-brand-component-text-dark">
              {t('unit')}
            </FormLabel>
            <FormControl>
              <Input {...field} isError={!!fieldState.error} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="source.decimal"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="text-xs font-semibold text-brand-component-text-dark">
              {t('decimal_places')}
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                onChange={handleDecimalChange}
                isError={!!fieldState.error}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default Source
