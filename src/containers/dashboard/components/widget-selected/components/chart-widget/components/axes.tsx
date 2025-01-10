import React from 'react'
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

import { ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useFormContext } from 'react-hook-form'
import { ChartPayload } from '@/validator'
import { Orientation } from '@/widget-models/chart'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { DATE_FORMAT } from '@/constants'

interface Props {}

const Axes: React.FC<Props> = () => {
  const t = useTranslations('dashboard')
  const form = useFormContext<ChartPayload>()
  return (
    <div className="space-y-4">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="sources"
      >
        <AccordionItem
          value={`sources`}
          className="overflow-hidden rounded-sm border border-brand-component-stroke-dark-soft"
        >
          <AccordionTrigger
            className="border-b border-brand-component-stroke-dark-soft bg-brand-component-fill-gray-soft p-3 text-xs font-semibold hover:no-underline"
            dropdownIcon={
              <ChevronDown className="h-5 w-5 shrink-0 text-brand-icon-gray transition-transform duration-200" />
            }
          >
            {t('y_axis')}
          </AccordionTrigger>
          <AccordionContent className="p-3">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="axes.y_axis.orientation"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-semibold text-brand-component-text-dark">
                      {t('orientation')}
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value={Orientation.Left}
                                  id={Orientation.Left}
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={Orientation.Left}
                                className="text-brand-component-text-dark"
                              >
                                {t('left')}
                              </FormLabel>
                            </FormItem>

                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value={Orientation.Right}
                                  id={Orientation.Right}
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={Orientation.Right}
                                className="text-brand-component-text-dark"
                              >
                                {t('right')}
                              </FormLabel>
                            </FormItem>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="axes.y_axis.unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('unit')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="axes.hide_axis"
          render={({ field }) => (
            <FormItem className="my-2 flex items-center space-x-3">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-semibold text-brand-component-text-dark">
                {t('hide_axis')}
              </FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="axes.is_show_grid"
          render={({ field }) => (
            <FormItem className="my-2 flex items-center space-x-3">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-semibold text-brand-component-text-dark">
                {t('show_x_grid')}
              </FormLabel>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="axes.format"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-brand-component-text-dark">
                {t('date_format')}
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger
                    icon={<ChevronDown className="w-3 text-brand-icon-gray" />}
                    className="w-full border-none bg-brand-component-fill-dark-soft outline-none ring-0 focus:ring-0 dark:bg-brand-heading"
                  >
                    <SelectValue
                      placeholder={
                        <span className="text-brand-component-text-gray">
                          {t('select_format')}
                        </span>
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-brand-component-fill-dark-soft dark:bg-brand-heading">
                    <SelectGroup>
                      {DATE_FORMAT.map((date) => (
                        <SelectItem value={date.value} key={date.value}>
                          {date.label}
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
    </div>
  )
}

export default Axes
