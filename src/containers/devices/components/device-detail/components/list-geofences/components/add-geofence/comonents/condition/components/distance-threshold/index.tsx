import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ChevronDown, Ellipsis } from 'lucide-react'
import { FieldArrayWithId, useFormContext } from 'react-hook-form'
import { GeofenceForm } from '../../../../schema'
import { NumberIcon } from '@/components/icons'
import { useTranslations } from 'next-intl'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChangeEvent } from 'react'

interface Props {
  field: FieldArrayWithId<GeofenceForm, 'conditions', 'id'>
  path: string
}

const ConditionDistanceThreshold = ({ field, path }: Props) => {
  const t = useTranslations('common')
  const form = useFormContext<GeofenceForm>()
  const { control } = form
  const handleThresholdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numericValue = Number(value)
    if (isNaN(numericValue)) {
      return
    }
    if (numericValue < 0) {
      return
    }
    if (numericValue > 100000) {
      return
    }
    form.setValue(
      `${path}.threshold` as GeofenceForm['conditions'][number]['threshold'],
      numericValue
    )
  }

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
            <div>
              <Ellipsis className="h-5 w-5 shrink-0 text-brand-icon-gray transition-transform duration-200" />
            </div>
          }
        >
          <ChevronDown className="h-5 w-5 shrink-0 text-brand-icon-gray transition-transform duration-200" />
          <div className="mr-2 flex w-full items-center">
            <div className="flex space-x-1 items-center">
              <NumberIcon width={20} height={20} />
              <p className="text-sm font-semibold text-brand-component-text-dark">
                {t('distance_threshold')}
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-3">
          <div className="space-y-4">
            <p className="text-xs text-brand-component-text-gray">
              {t('distance_threshold_description')}
            </p>

            <div className="">
              <FormField
                control={control}
                name={
                  `${path}.threshold` as GeofenceForm['conditions'][number]['threshold']
                }
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-1.5 relative">
                    <FormLabel className="text-xs font-medium text-brand-component-text-gray">
                      {t('threshold')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={handleThresholdChange}
                        className="border-none bg-brand-component-fill-dark-soft"
                        isError={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage />

                    <FormField
                      control={control}
                      name={
                        `${path}.unit` as GeofenceForm['conditions'][number]['unit']
                      }
                      render={({ field }) => (
                        <FormItem className="absolute right-2 top-[23px]">
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? 'km'}
                              defaultValue="km"
                            >
                              <SelectTrigger
                                className="border-none shadow-none bg-brand-fill-dark-soft border-brand-stroke-dark-soft border border-l-0 p-0 focus:outline-none focus:ring-0 outline-none ring-0 h-7 dark:bg-brand-heading "
                                icon={
                                  <ChevronDown className="w-3 text-brand-icon-gray" />
                                }
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="km">km</SelectItem>
                                <SelectItem value="m">m</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export default ConditionDistanceThreshold
