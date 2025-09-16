import React, { memo, useMemo, useState } from 'react'
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
  FormMessage,
} from '@/components/ui/form'
import { useTranslations } from 'next-intl'
import { Drag } from '@/components/icons'
import { Switch } from '@/components/ui/switch'
import ColorSelect from '../../color-select'
import { FIELD_DISPLAY_NAME, OPERATORS } from '../table.const'

const getAllColumnNames = (columns: any[]) =>
  columns.map((column) => column.field)

interface ConditionalProps {
  index: number
  onRemove?: (index: number) => void
}

const Conditional: React.FC<ConditionalProps> = ({ index, onRemove }) => {
  const t = useTranslations('dashboard')
  const form = useFormContext<dataTablePayload>()
  const { control, watch } = form
  const [openDialog, setOpenDialog] = useState(false)

  const [text_color, bg_color] = watch([
    `conditionals.${index}.text_color`,
    `conditionals.${index}.bg_color`,
  ])

  const columns = useWatch({ control, name: 'columns' })
  const allFields = useMemo(() => getAllColumnNames(columns), [columns])

  const renderedFieldOptions = useMemo(
    () =>
      allFields.map((name) => (
        <SelectItem key={name} value={name}>
          {FIELD_DISPLAY_NAME[name] || name}
        </SelectItem>
      )),
    [allFields]
  )

  return (
    <>
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
        <AlertDialogContent className="border border-[#0000003B]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              {t('delete_conditional_formatting')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {t('confirm_delete_conditional_formatting')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="grid w-full grid-cols-2 gap-2">
            <AlertDialogCancel className="border-brand-component-stroke-dark-soft text-brand-component-text-gray">
              {t('cancel')}
            </AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                onRemove?.(index)
                setOpenDialog(false)
              }}
              className="border-2 border-brand-component-stroke-dark bg-brand-component-fill-negative"
            >
              {t('delete_conditional_formatting')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue={`conditionals.${index}`}
      >
        <AccordionItem
          value={`conditionals.${index}`}
          className="overflow-hidden rounded-lg border border-brand-component-stroke-dark-soft"
        >
          <div className="flex items-center border-b border-brand-component-stroke-dark-soft bg-brand-component-fill-gray-soft">
            <div className="flex w-full items-center justify-between pl-3 text-sm font-semibold">
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
            <AccordionTrigger
              className="p-3 pl-2 text-sm font-semibold hover:no-underline"
              dropdownIcon={
                <ChevronDown className="h-5 w-5 shrink-0 text-brand-icon-gray transition-transform duration-200" />
              }
            />
          </div>
          <AccordionContent className="flex size-full flex-col gap-2 bg-brand-component-fill-light-fixed p-3 dark:bg-brand-heading">
            <div className="flex w-full flex-wrap items-center gap-2">
              {t('if')}
              <FormField
                control={control}
                name={`conditionals.${index}.field`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger
                          icon={
                            <ChevronDown className="w-3 text-brand-icon-gray" />
                          }
                          className="border-none bg-brand-component-fill-dark-soft p-2 px-2 outline-none ring-0 focus:ring-0 dark:dark:bg-brand-heading"
                        >
                          <SelectValue placeholder={t('select_column')} />
                        </SelectTrigger>
                        <SelectContent>{renderedFieldOptions}</SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {t('is')}
              <FormField
                control={control}
                name={`conditionals.${index}.operator`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select onValueChange={field.onChange}>
                        <SelectTrigger
                          icon={
                            <ChevronDown className="w-3 text-brand-icon-gray" />
                          }
                          className="text-brand-component-text-gray border-none bg-brand-component-fill-dark-soft p-2 px-2 outline-none ring-0 focus:ring-0 dark:dark:bg-brand-heading"
                        >
                          <SelectValue placeholder={t('select_operator')} />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(OPERATORS).map((operator) => (
                            <SelectItem key={operator} value={operator}>
                              {t(operator)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`conditionals.${index}.value`}
                render={({ field }) => {
                  const selectedField = allFields.find(
                    (f) => f === watch(`conditionals.${index}.field`)
                  )
                  const fieldType = columns.find(
                    (col) => col.field === selectedField
                  )?.field_type

                  return (
                    <FormItem>
                      <FormControl>
                        {fieldType === 'boolean' ? (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger
                              icon={
                                <ChevronDown className="w-3 text-brand-icon-gray" />
                              }
                              className="text-brand-component-text-gray border-none bg-brand-component-fill-dark-soft p-2 px-2 outline-none"
                            >
                              <SelectValue placeholder={t('select_value')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">True</SelectItem>
                              <SelectItem value="false">False</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            {...field}
                            className="max-w-14 p-2"
                            placeholder={t('value')}
                            onChange={(e) => field.onChange(e.target.value)}
                            value={field.value}
                            isError={
                              !!form.formState.errors.conditionals?.[index]
                                ?.value
                            }
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )
                }}
              />
              <p className="w-[156px]">{t('then_set_the_text_color_to')}</p>
              <FormField
                control={control}
                name={`conditionals.${index}.text_color`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <ColorSelect fieldValue={text_color} />
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="w-[156px]">{t('and_background_color_to')}</p>
              <FormField
                control={control}
                name={`conditionals.${index}.bg_color`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <ColorSelect fieldValue={bg_color} />
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex items-center gap-2">
              <p>{t('limit_to_this_column')}</p>
              <FormField
                control={control}
                name={`conditionals.${index}.limit`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={(checked) => field.onChange(checked)}
                      />
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

export default memo(Conditional)
