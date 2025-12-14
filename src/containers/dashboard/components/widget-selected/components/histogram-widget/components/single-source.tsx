import React, { useMemo, useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

import { ChevronDown, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SourceColor } from '@/constants'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { FieldArrayWithId, useFormContext } from 'react-hook-form'
import { Trash } from '@/components/icons/trash'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import DefaultColor from '@/components/icons/default-color'
import { HistogramPayload } from '@/validator'
import { useDeviceEntity } from '../../../hooks/useDeviceEntity'
import { useDebounce } from '@/hooks'
import { Skeleton } from '@/components/ui/skeleton'
interface Props {
  index: number
  field: FieldArrayWithId<
    {
      sources: HistogramPayload['sources']
    },
    'sources',
    'id'
  >
  onRemove: () => void
}

const SingleSource: React.FC<Props> = ({ index, field, onRemove }) => {
  const [entityName, setEntityName] = useState('')
  const entityNameDebounce = useDebounce(entityName)
  const { data: entities, isLoading } = useDeviceEntity(
    'histogram',
    entityNameDebounce
  )
  const entityList = entities?.results || []

  const form = useFormContext<HistogramPayload>()
  const [openDialog, setOpenDialog] = useState(false)
  const [openCombobox, setOpenCombobox] = useState(false)
  const t = useTranslations('dashboard')
  const entityId = form.watch(`sources.${index}.entity_id`)

  const currentEntity = useMemo(() => {
    return entityList.find((entity) => entity.id === entityId)
  }, [entityList, entityId])

  const [colorValue] = form.watch([`sources.${index}.color`])

  const handleLegendManualChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value
    form.setValue(`sources.${index}.legend`, value)
  }

  return (
    <>
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent className="border border-[#0000003B]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              {t('delete_source')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t('confirm_delete_source')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="grid w-full grid-cols-2 gap-2">
            <AlertDialogCancel className="border-brand-component-stroke-dark-soft text-brand-component-text-gray">
              {t('cancel')}
            </AlertDialogCancel>
            <Button
              variant={'destructive'}
              onClick={() => {
                onRemove()
                setOpenDialog(false)
              }}
              className="border-2 border-brand-component-stroke-dark bg-brand-component-fill-negative"
            >
              {t('delete_source')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={`sources.${index}`}
      >
        <AccordionItem
          value={`sources.${index}`}
          className="overflow-hidden rounded-sm border border-brand-component-stroke-dark-soft"
        >
          <AccordionTrigger
            className="border-b border-brand-component-stroke-dark-soft bg-brand-component-fill-gray-soft p-3 text-sm font-semibold hover:no-underline"
            dropdownIcon={
              <ChevronDown className="h-5 w-5 shrink-0 text-brand-icon-gray transition-transform duration-200" />
            }
          >
            <div className="mr-2 flex w-full items-center justify-between">
              <p>{currentEntity?.name}</p>
              <Trash
                width={20}
                height={20}
                onClick={(e) => {
                  e.stopPropagation()
                  setOpenDialog(true)
                }}
              />
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-3">
            <div className="space-y-3" key={field.id}>
              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name={`sources.${index}.entity_id`}
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel
                        className="text-sm font-semibold text-brand-component-text-dark"
                        required
                      >
                        {t('device_entity')}
                      </FormLabel>
                      <FormControl>
                        <Popover
                          open={openCombobox}
                          onOpenChange={setOpenCombobox}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openCombobox}
                              className="font-normal text-sm w-full justify-between border-none bg-brand-component-fill-dark-soft outline-none ring-0 hover:bg-brand-component-fill-dark-soft focus:ring-0 dark:bg-brand-heading dark:hover:bg-brand-heading"
                            >
                              <p className="truncate w-5/6 text-start">
                                {currentEntity
                                  ? `${currentEntity?.unique_key}.${currentEntity?.entity_type.unique_key} - ${currentEntity.device_name}`
                                  : t('select_entity')}
                              </p>
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0 bg-brand-component-fill-light-fixed dark:bg-brand-heading">
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
                                    <CommandEmpty>
                                      {t('no_devices_found')}
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {entityList.length > 0 &&
                                        entityList.map((entity) => (
                                          <CommandItem
                                            key={entity.id}
                                            value={entity.id}
                                            onSelect={() => {
                                              field.onChange(entity.id)
                                              setOpenCombobox(false)
                                            }}
                                            className="data-[selected=true]:bg-brand-component-fill-gray-soft"
                                          >
                                            {`${entity.unique_key}.${entity.entity_type.unique_key} - ${entity.device_name}`}
                                            <Check
                                              className={cn(
                                                'ml-auto h-4 w-4',
                                                field.value === entity.id
                                                  ? 'opacity-100'
                                                  : 'opacity-0'
                                              )}
                                            />
                                          </CommandItem>
                                        ))}
                                    </CommandGroup>
                                  </>
                                )}
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
                control={form.control}
                name={`sources.${index}.legend`}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-semibold text-brand-component-text-dark">
                        {t('legend')}
                      </FormLabel>
                      <FormField
                        control={form.control}
                        name={`sources.${index}.show_legend`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        className="border-none outline-none ring-0 focus:outline-none focus:ring-0"
                        onChange={handleLegendManualChange}
                        isError={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`sources.${index}.color`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-brand-component-text-dark">
                      {t('color')}
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger
                          icon={
                            <ChevronDown className="w-3 text-brand-icon-gray" />
                          }
                          className="border-none bg-brand-component-fill-dark-soft outline-none ring-0 focus:ring-0 dark:dark:bg-brand-heading"
                        >
                          <SelectValue
                            placeholder={
                              <span className="text-brand-component-text-gray">
                                {t('select_color')}
                              </span>
                            }
                          >
                            {colorValue && colorValue !== 'default' ? (
                              <div className="flex items-center space-x-2">
                                <div
                                  className="h-4 w-4 rounded-full"
                                  style={{
                                    backgroundColor: `#${form.watch(`sources.${index}.color`)}`,
                                  }}
                                />
                                <p className="text-brand-component-text-dark">
                                  {form.watch(`sources.${index}.color`)}
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <div className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full">
                                  <DefaultColor width={100} height={100} />
                                </div>
                                <p className="text-brand-component-text-dark">
                                  {t('default')}
                                </p>
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)] bg-brand-component-fill-dark-soft dark:bg-brand-heading">
                          <SelectGroup className="flex flex-wrap gap-2">
                            <SelectItem
                              showCheckIcon={false}
                              value="default"
                              className="m-0 h-6 w-6 rounded-md border-brand-component-stroke-dark p-0"
                            >
                              <DefaultColor
                                className={cn(
                                  'stroke-brand-component-stroke-dark-soft hover:stroke-brand-component-stroke-dark',
                                  colorValue === 'default'
                                    ? 'stroke-brand-component-stroke-dark dark:stroke-brand-stroke-gray'
                                    : ''
                                )}
                              />
                            </SelectItem>
                            {SourceColor.map((color) => (
                              <SelectItem
                                key={color}
                                showCheckIcon={false}
                                value={color}
                                className="m-0 h-6 w-6 rounded-md border-brand-component-stroke-dark p-0"
                              >
                                <div
                                  className={cn(
                                    'h-6 w-6 rounded-md border border-transparent hover:border-brand-component-stroke-dark',
                                    colorValue === color
                                      ? 'border-brand-component-stroke-dark dark:border-brand-stroke-gray'
                                      : ''
                                  )}
                                  style={{
                                    backgroundColor: `#${color}`,
                                  }}
                                />
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}

export default SingleSource
