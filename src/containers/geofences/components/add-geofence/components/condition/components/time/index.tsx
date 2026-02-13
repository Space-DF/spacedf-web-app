import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  ChevronDown,
  Ellipsis,
  Scissors,
  SquarePen,
  Trash2,
} from 'lucide-react'
import { FieldArrayWithId, useFormContext } from 'react-hook-form'
import { GeofenceForm } from '../../../../schema'
import { Calendar, TestTube, Duplicate, Copy } from '@/components/icons'
import { useTranslations } from 'next-intl'
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TimePicker } from '@/components/common/time-picker'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Props {
  field: FieldArrayWithId<GeofenceForm, 'conditions', 'id'>
  path: string
}

const ConditionTime = ({ field, path }: Props) => {
  const t = useTranslations('common')
  const { control } = useFormContext<GeofenceForm>()

  const weekdayOptions = [
    { value: 'sunday', label: t('sunday') },
    { value: 'monday', label: t('monday') },
    { value: 'tuesday', label: t('tuesday') },
    { value: 'wednesday', label: t('wednesday') },
    { value: 'thursday', label: t('thursday') },
    { value: 'friday', label: t('friday') },
    { value: 'saturday', label: t('saturday') },
  ]

  return (
    <Accordion
      key={field.id}
      type="single"
      collapsible
      className="w-full"
      defaultValue={path}
    >
      <AccordionItem
        value={path}
        className="overflow-hidden rounded-sm border border-brand-component-stroke-dark-soft"
      >
        <AccordionTrigger
          className="border-b border-brand-component-stroke-dark-soft bg-brand-component-fill-gray-soft p-3 text-sm font-semibold hover:no-underline"
          dropdownIcon={
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <div className="cursor-pointer">
                  <Ellipsis className="h-5 w-5 shrink-0 text-brand-icon-gray transition-transform duration-200" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <TestTube className="mr-2 h-4 w-4" />
                  Test
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Duplicate className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Scissors className="mr-2 h-4 w-4" />
                  Cut
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <SquarePen className="mr-2 h-4 w-4" />
                  Edit in YAML
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500 focus:text-red-500">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
        >
          <ChevronDown className="h-5 w-5 shrink-0 text-brand-icon-gray transition-transform duration-200" />
          <div className="mr-2 flex w-full items-center">
            <div className="flex space-x-1 items-center">
              <Calendar width={20} height={20} />
              <p className="text-sm font-semibold text-brand-component-text-dark">
                {t('time')}
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-3">
          <div className="grid grid-cols-1 gap-y-4">
            <div className="grid grid-cols-5 gap-5">
              <FormField
                control={control}
                name={
                  `${path}.after` as GeofenceForm['conditions'][number]['after']
                }
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>{t('after')}</FormLabel>
                    <FormControl>
                      <TimePicker {...field} format="12h" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={
                  `${path}.after_type` as GeofenceForm['conditions'][number]['after_type']
                }
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="invisible">Period</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue="am"
                      >
                        <SelectTrigger
                          className="h-9 bg-brand-component-fill-dark-soft"
                          icon={
                            <ChevronDown className="w-3 text-brand-icon-gray" />
                          }
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="am">AM</SelectItem>
                          <SelectItem value="pm">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-5 gap-5">
              <FormField
                control={control}
                name={
                  `${path}.before` as GeofenceForm['conditions'][number]['before']
                }
                render={({ field }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>{t('before')}</FormLabel>
                    <FormControl>
                      <TimePicker {...field} format="12h" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={
                  `${path}.before_type` as GeofenceForm['conditions'][number]['before']
                }
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel className="invisible">Period</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        defaultValue="am"
                      >
                        <SelectTrigger
                          className="h-9 bg-brand-component-fill-dark-soft"
                          icon={
                            <ChevronDown className="w-3 text-brand-icon-gray" />
                          }
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="am">AM</SelectItem>
                          <SelectItem value="pm">PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name={
                `${path}.weekdays` as GeofenceForm['conditions'][number]['weekdays']
              }
              render={({ field }) => {
                const selected = (field.value ?? []) as Array<
                  (typeof weekdayOptions)[number]['value']
                >

                return (
                  <FormItem>
                    <FormLabel>{t('weekdays')}</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        {weekdayOptions.map((opt) => {
                          const id = `${path}.weekdays.${opt.value}`
                          const checked = selected.includes(opt.value)

                          return (
                            <div
                              key={opt.value}
                              className="flex items-center gap-3"
                            >
                              <Checkbox
                                id={id}
                                checked={checked}
                                onCheckedChange={(nextChecked) => {
                                  const isChecked = nextChecked === true
                                  field.onChange(
                                    isChecked
                                      ? Array.from(
                                          new Set([...selected, opt.value])
                                        )
                                      : selected.filter((d) => d !== opt.value)
                                  )
                                }}
                              />
                              <label
                                htmlFor={id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {opt.label}
                              </label>
                            </div>
                          )
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default ConditionTime
