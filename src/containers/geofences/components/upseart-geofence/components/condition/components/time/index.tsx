import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ChevronDown } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
import { GeofenceForm } from '../../../../schema'
import { Calendar } from '@/components/icons'
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
import { ConditionOptions } from '../condition-options'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'
import { featuresToGeometries, transformConditions } from '../../../../utils'
import { useTestCondition } from '../render-condition/hooks/useTestCondition'
import { toast } from 'sonner'
import { useGeofenceStore } from '@/stores/geofence-store'

interface Props {
  fieldId: string
  path: string
  index: number
  onRemove: (index: number) => void
  onAppend: (value: GeofenceForm['conditions'][number]) => void
  onEditInYAML?: () => void
}

const mapInstance = MapInstance.getInstance()

const ConditionTime = ({
  fieldId,
  path,
  index,
  onRemove,
  onAppend,
  onEditInYAML,
}: Props) => {
  const t = useTranslations('common')
  const tGeofence = useTranslations('geofence')
  const { control, getValues } = useFormContext<GeofenceForm>()
  const weekdayOptions = [
    { value: 0, label: t('sunday') },
    { value: 1, label: t('monday') },
    { value: 2, label: t('tuesday') },
    { value: 3, label: t('wednesday') },
    { value: 4, label: t('thursday') },
    { value: 5, label: t('friday') },
    { value: 6, label: t('saturday') },
  ]

  const { trigger: testCondition } = useTestCondition()
  const setCurrentCondition = useGeofenceStore(
    (state) => state.setCurrentCondition
  )

  const value = getValues(path as GeofenceForm['conditions'][number]['rules'])

  const handleDuplicate = () => {
    onAppend(value)
  }

  const handleDelete = () => {
    onRemove(index)
  }

  const handleCopy = () => {
    setCurrentCondition(value)
  }

  const handleCut = () => {
    setCurrentCondition(value)
    onRemove(index)
  }

  const handleTest = () => {
    const values = getValues()
    const draw = mapInstance.getTerraDraw()
    const features = draw?.getSnapshot()
    if (!features?.length)
      return toast.error(tGeofence('please_draw_a_geofence'))
    const geometry = featuresToGeometries(features)
    testCondition({
      type_zone: values.type_zone,
      features: geometry,
      definition: transformConditions([value], values.type_zone),
    })
  }

  return (
    <Accordion
      key={fieldId}
      type="single"
      collapsible
      className="w-full"
      defaultValue={path}
    >
      <AccordionItem
        value={path}
        className="overflow-hidden rounded-sm border border-border"
      >
        <AccordionTrigger
          className="border-b border-border bg-card p-3 text-sm font-semibold hover:no-underline"
          dropdownIcon={
            <ConditionOptions
              onTest={handleTest}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onCopy={handleCopy}
              onCut={handleCut}
              onEditInYAML={onEditInYAML}
            />
          }
        >
          <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200" />
          <div className="mr-2 flex w-full items-center">
            <div className="flex space-x-1 items-center text-brand-component-text-dark">
              <Calendar className="size-5 text-muted-foreground" />
              <p className="text-sm font-semibold">{t('time')}</p>
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
                render={({ field, fieldState }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>{t('after')}</FormLabel>
                    <FormControl>
                      <TimePicker
                        {...field}
                        format="12h"
                        isError={!!fieldState.error}
                      />
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
                          className="h-9"
                          icon={
                            <ChevronDown className="w-3 text-muted-foreground" />
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
                render={({ field, fieldState }) => (
                  <FormItem className="col-span-3">
                    <FormLabel>{t('before')}</FormLabel>
                    <FormControl>
                      <TimePicker
                        {...field}
                        format="12h"
                        isError={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={
                  `${path}.before_type` as GeofenceForm['conditions'][number]['before_type']
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
                          className="h-9"
                          icon={
                            <ChevronDown className="w-3 text-muted-foreground" />
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
