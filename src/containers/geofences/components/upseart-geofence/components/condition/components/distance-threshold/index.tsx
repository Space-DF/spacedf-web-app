import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ChevronDown } from 'lucide-react'
import { useFormContext } from 'react-hook-form'
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
import { ConditionOptions } from '../condition-options'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'
import { featuresToGeometries, transformConditions } from '../../../../utils'
import { useTestCondition } from '../render-condition/hooks/useTestCondition'
import { toast } from 'sonner'
import { useGeofenceStore } from '@/stores/geofence-store'
import { useShallow } from 'zustand/react/shallow'

interface Props {
  fieldId: string
  path: string
  index: number
  onRemove: (index: number) => void
  onAppend: (value: GeofenceForm['conditions'][number]) => void
  onEditInYAML?: () => void
}

const mapInstance = MapInstance.getInstance()

const ConditionDistanceThreshold = ({
  fieldId,
  path,
  index,
  onRemove,
  onAppend,
  onEditInYAML,
}: Props) => {
  const t = useTranslations('common')
  const tGeofence = useTranslations('geofence')
  const form = useFormContext<GeofenceForm>()
  const { control } = form
  const { trigger: testCondition } = useTestCondition()
  const { setCurrentCondition, geoFencesIds } = useGeofenceStore(
    useShallow((state) => ({
      setCurrentCondition: state.setCurrentCondition,
      geoFencesIds: state.geoFencesIds,
    }))
  )

  const handleThresholdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (!value) {
      form.setValue(
        `${path}.threshold` as GeofenceForm['conditions'][number]['threshold'],
        '',
        { shouldValidate: true }
      )
      return
    }
    const numericValue = Number(value)
    if (Number.isNaN(numericValue)) return
    if (numericValue < 0) return
    if (numericValue > 100_000) return
    form.setValue(
      `${path}.threshold` as GeofenceForm['conditions'][number]['threshold'],
      numericValue,
      { shouldValidate: true }
    )
  }

  const value = form.getValues(
    path as GeofenceForm['conditions'][number]['rules']
  )

  const handleCopy = () => {
    setCurrentCondition(value)
  }

  const handleCut = () => {
    setCurrentCondition(value)
    onRemove(index)
  }

  const handleTest = () => {
    const value = form.getValues(
      path as GeofenceForm['conditions'][number]['rules']
    )
    const values = form.getValues()
    const draw = mapInstance.getTerraDraw()
    const features = draw?.getSnapshot()
    if (!geoFencesIds.length || !features?.length)
      return toast.error(tGeofence('please_draw_a_geofence'))
    const currenGeofenceFeatures = features?.filter((f) =>
      geoFencesIds.includes(f.id as string)
    )
    const geometry = featuresToGeometries(currenGeofenceFeatures)
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
        className="overflow-hidden rounded-sm border border-brand-component-stroke-dark-soft"
      >
        <AccordionTrigger
          className="border-b border-brand-component-stroke-dark-soft bg-brand-component-fill-gray-soft p-3 text-sm font-semibold hover:no-underline"
          dropdownIcon={
            <ConditionOptions
              onDelete={() => onRemove(index)}
              onDuplicate={() => onAppend(value)}
              onCopy={handleCopy}
              onCut={handleCut}
              onEditInYAML={onEditInYAML}
              onTest={handleTest}
            />
          }
        >
          <ChevronDown className="h-5 w-5 shrink-0 text-brand-icon-gray transition-transform duration-200" />
          <div className="mr-2 flex w-full items-center">
            <div className="flex space-x-1 items-center text-brand-component-text-dark">
              <NumberIcon className="size-5" />
              <p className="text-sm font-semibold">{t('distance_threshold')}</p>
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
                        value={
                          field.value !== undefined && field.value !== null
                            ? `${field.value}`
                            : ''
                        }
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
                                className={`border-none shadow-none border-brand-stroke-dark-soft border border-l-0 p-0 focus:outline-none focus:ring-0 outline-none ring-0 h-7 ${fieldState.error ? 'bg-brand-component-fill-negative-soft' : 'bg-brand-fill-dark-soft dark:bg-brand-heading'}`}
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
