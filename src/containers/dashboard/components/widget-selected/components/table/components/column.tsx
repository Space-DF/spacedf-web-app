import React, { useRef } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFormContext, useWatch } from 'react-hook-form'
import { dataTablePayload } from '@/validator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ChevronDown } from 'lucide-react'
import { Trash } from '@/components/icons/trash'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useTranslations } from 'next-intl'
import { Drag, PushPin, Scales } from '@/components/icons'
import { FIELDDISPLAYNAME } from '../table.const'

interface ColumnProps {
  index: number
  generalFields: string[]
  specificFields: string[]
  remove: (index: number) => void
}

const Column: React.FC<ColumnProps> = ({
  index,
  generalFields,
  specificFields,
  remove,
}) => {
  const { control, setValue } = useFormContext<dataTablePayload>()
  const t = useTranslations()

  const type = useWatch({
    control,
    name: `columns.${index}.type`,
  })

  const previousValues = useRef({
    General: generalFields[0],
    Specific: specificFields[0],
  })

  const handleTypeChange = (newType: 'General' | 'Specific') => {
    setValue(`columns.${index}.type`, newType)

    const newFieldValue =
      previousValues.current[newType] ||
      (newType === 'General' ? generalFields[0] : specificFields[0])

    setValue(`columns.${index}.field`, newFieldValue)
    previousValues.current[newType] = newFieldValue
  }

  return (
    <>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={`columns.${index}`}
      >
        <AccordionItem
          value={`columns.${index}`}
          className="overflow-hidden rounded-lg border border-brand-component-stroke-dark-soft"
        >
          <AccordionTrigger
            className="border-b border-brand-component-stroke-dark-soft bg-brand-component-fill-gray-soft p-3 text-xs font-semibold hover:no-underline"
            dropdownIcon={
              <ChevronDown className="h-5 w-5 shrink-0 text-brand-icon-gray transition-transform duration-200" />
            }
          >
            <div className="mr-2 flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <Drag />
                <p>#{index}</p>
              </div>
              <Trash
                width={20}
                height={20}
                onClick={(e) => {
                  e.stopPropagation()
                  remove(index)
                }}
              />
            </div>
          </AccordionTrigger>
          <AccordionContent className="flex size-full flex-col gap-4 bg-brand-component-fill-light-fixed p-3 dark:bg-brand-heading">
            <FormField
              control={control}
              name={`columns.${index}.column_name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="text-xs font-semibold !text-brand-component-text-dark"
                    required
                  >
                    {t('dashboard.column_name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                      value={FIELDDISPLAYNAME[field.value] || field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`columns.${index}.type`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="text-xs font-semibold !text-brand-component-text-dark"
                    required
                  >
                    {t('dashboard.column_type')}
                  </FormLabel>
                  <FormControl>
                    <div className="items-between flex w-full justify-center gap-1">
                      <Button
                        onClick={() => handleTypeChange('General')}
                        className={cn(
                          'flex w-1/2 items-center justify-start gap-1 rounded-lg border bg-transparent p-3 text-brand-component-text-dark transition-colors',
                          field.value === 'General'
                            ? 'border-brand-component-stroke-dark dark:border-brand-component-stroke-secondary'
                            : '',
                        )}
                      >
                        <PushPin />
                        {t('dashboard.general')}
                      </Button>
                      <Button
                        onClick={() => handleTypeChange('Specific')}
                        className={cn(
                          'flex w-1/2 items-center justify-start gap-1 rounded-lg border bg-transparent p-3 text-brand-component-text-dark transition-colors',
                          field.value === 'Specific'
                            ? 'border-brand-component-stroke-dark dark:border-brand-component-stroke-secondary'
                            : '',
                        )}
                      >
                        <Scales />
                        {t('dashboard.specific')}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`columns.${index}.field`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel
                    className="text-xs font-semibold !text-brand-component-text-dark"
                    required
                  >
                    {t('dashboard.field')}
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || ''}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Field" />
                      </SelectTrigger>
                      <SelectContent>
                        {(type === 'General'
                          ? generalFields
                          : specificFields
                        ).map((fieldOption) => (
                          <SelectItem key={fieldOption} value={fieldOption}>
                            {fieldOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  )
}

export default Column
