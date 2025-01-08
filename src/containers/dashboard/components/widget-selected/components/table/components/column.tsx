import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react'
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
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
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
import { FIELD_DISPLAY_NAME } from '../table.const'

interface ColumnProps {
  index: number
  generalFields?: string[]
  specificFields?: string[]
  onRemove?: (index: number) => void
}

const Column: React.FC<ColumnProps> = ({
  index,
  generalFields = [],
  specificFields = [],
  onRemove,
}) => {
  const t = useTranslations('dashboard')
  const { control, setValue } = useFormContext<dataTablePayload>()
  const [openDialog, setOpenDialog] = useState(false)

  const type = useWatch({
    control,
    name: `columns.${index}.type`,
  })

  const previousValues = useRef({
    General: generalFields[0],
    Specific: specificFields[0],
  })

  const fieldOptions = useMemo(
    () => (type === 'General' ? generalFields : specificFields),
    [type, generalFields, specificFields],
  )

  const renderedFieldOptions = useMemo(
    () =>
      fieldOptions.map((fieldOption) => (
        <SelectItem key={fieldOption} value={fieldOption}>
          {fieldOption}
        </SelectItem>
      )),
    [fieldOptions],
  )

  const handleTypeChange = useCallback(
    (newType: 'General' | 'Specific') => {
      setValue(`columns.${index}.type`, newType)
      const newFieldValue =
        previousValues.current[newType] ||
        (newType === 'General' ? generalFields[0] : specificFields[0])

      setValue(`columns.${index}.field`, newFieldValue)
      previousValues.current[newType] = newFieldValue
    },
    [index, setValue, generalFields, specificFields],
  )

  return (
    <>
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent className="border border-[#0000003B]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              {t('delete_column')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t('confirm_delete_column')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="grid w-full grid-cols-2 gap-2">
            <AlertDialogCancel className="border-brand-component-stroke-dark-soft text-brand-component-text-gray">
              {t('cancel')}
            </AlertDialogCancel>
            <Button
              variant={'destructive'}
              onClick={() => {
                onRemove?.(index)
                setOpenDialog(false)
              }}
              className="border-2 border-brand-component-stroke-dark bg-brand-component-fill-negative"
            >
              {t('delete_column')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
                <p>#{index + 1}</p>
              </div>
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
                    {t('column_name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => field.onChange(e.target.value)}
                      value={
                        FIELD_DISPLAY_NAME[field.value] || field.value || ''
                      }
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
                    {t('column_type')}
                  </FormLabel>
                  <FormControl>
                    <div className="items-between flex w-full justify-center gap-1">
                      <Button
                        onClick={() => handleTypeChange('General')}
                        className={cn(
                          'flex w-1/2 items-center justify-start gap-1 rounded-lg border bg-transparent p-3 text-brand-component-text-dark transition-colors hover:bg-accent',
                          field.value === 'General'
                            ? 'border-brand-component-stroke-dark dark:border-brand-component-fill-secondary-soft'
                            : '',
                        )}
                      >
                        <PushPin />
                        {t('general')}
                      </Button>
                      <Button
                        onClick={() => handleTypeChange('Specific')}
                        className={cn(
                          'flex w-1/2 items-center justify-start gap-1 rounded-lg border bg-transparent p-3 text-brand-component-text-dark transition-colors hover:bg-accent',
                          field.value === 'Specific'
                            ? 'border-brand-component-stroke-dark dark:border-brand-component-fill-secondary-soft'
                            : '',
                        )}
                      >
                        <Scales />
                        {t('specific')}
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
                    {t('field')}
                  </FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || ''}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Field" />
                      </SelectTrigger>
                      <SelectContent>{renderedFieldOptions}</SelectContent>
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
