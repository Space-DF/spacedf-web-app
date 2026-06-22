import { useState } from 'react'
import {
  FieldArrayWithId,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import { useTranslations } from 'next-intl'
import {
  GeofenceForm,
  DEFAULT_CONDITIONS,
  ConditionType,
} from '../../../../schema'
import ConditionTime from '../time'
import ConditionDistanceThreshold from '../distance-threshold'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { And, Graph, Calendar, NumberIcon } from '@/components/icons'
import { EqualNot, ChevronDown } from 'lucide-react'
import { AddCondition } from '../add-condition'
import { ConditionOptions } from '../condition-options'
import { useGeofenceStore } from '@/stores/geofence-store'
import dynamic from 'next/dynamic'

const EditYamlPanel = dynamic(
  () => import('../edit-yaml-dialog').then((m) => m.EditYamlPanel),
  { ssr: false }
)
import { useTestCondition } from './hooks/useTestCondition'
import MapInstance from '@/templates/fleet-tracking/core/map-instance'
import { featuresToGeometries, transformConditions } from '../../../../utils'
import { toast } from 'sonner'
import { useShallow } from 'zustand/react/shallow'

const CONDITION_ICONS: Record<
  string,
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  and: And,
  or: Graph,
  not: EqualNot,
  time: Calendar,
  distance_threshold: NumberIcon,
}

interface Props {
  field: FieldArrayWithId<GeofenceForm, 'conditions', 'id'>
  path: string
  index: number
  onRemove: (index: number) => void
  onAppend: (value: GeofenceForm['conditions'][number]) => void
}

const mapInstance = MapInstance.getInstance()

export const RenderCondition = ({
  field,
  path,
  index,
  onRemove,
  onAppend,
}: Props) => {
  const t = useTranslations('common')
  const tGeofence = useTranslations('geofence')
  const form = useFormContext<GeofenceForm>()
  const { control } = form
  const [isEditingYaml, setIsEditingYaml] = useState(false)

  const { currentCondition, setCurrentCondition } = useGeofenceStore(
    useShallow((state) => ({
      currentCondition: state.currentCondition,
      setCurrentCondition: state.setCurrentCondition,
    }))
  )

  const nestedName = `${path}.rules`

  const {
    fields: nestedFields,
    append: nestedAppend,
    remove: nestedRemove,
  } = useFieldArray({
    control,
    name: nestedName as GeofenceForm['conditions'][number]['rules'],
  })

  const { trigger: testCondition } = useTestCondition()

  const handleAppendCondition = (key: ConditionType) => {
    if (currentCondition && key === 'paste') {
      nestedAppend(currentCondition)
      return
    }
    if (key === 'time' || key === 'distance_threshold') {
      nestedAppend(
        DEFAULT_CONDITIONS[key] as GeofenceForm['conditions'][number]
      )
    } else {
      nestedAppend({ type: key } as GeofenceForm['conditions'][number])
    }
  }

  const handleCopy = () => {
    const value = form.getValues(
      path as GeofenceForm['conditions'][number]['rules']
    )
    setCurrentCondition(value)
  }

  const handleCut = () => {
    const value = form.getValues(
      path as GeofenceForm['conditions'][number]['rules']
    )
    setCurrentCondition(value)
    onRemove(index)
  }

  const handleEditInYAML = () => {
    setIsEditingYaml(true)
  }

  const handleTest = () => {
    const value = form.getValues(
      path as GeofenceForm['conditions'][number]['rules']
    )
    const values = form.getValues()
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

  const handleYamlSave = (updated: GeofenceForm['conditions'][number]) => {
    form.setValue(path as `conditions.${number}`, updated, {
      shouldValidate: true,
    })
    setIsEditingYaml(false)
  }

  const currentValue = form.watch(path as `conditions.${number}`)

  if (isEditingYaml) {
    const Icon = CONDITION_ICONS[field.type] ?? EqualNot
    return (
      <Accordion
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
                onDuplicate={() => onAppend(currentValue)}
                onCopy={handleCopy}
                onCut={handleCut}
                onEditInYAML={handleEditInYAML}
                onTest={handleTest}
              />
            }
          >
            <ChevronDown className="h-5 w-5 shrink-0 text-brand-icon-gray transition-transform duration-200" />
            <div className="mr-2 flex w-full items-center">
              <div className="flex items-center space-x-1">
                <Icon className="h-5 w-5 shrink-0 text-brand-icon-gray" />
                <p className="text-sm font-semibold text-brand-component-text-dark">
                  {t(field.type as any)}
                </p>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0">
            <EditYamlPanel
              condition={currentValue}
              onSave={handleYamlSave}
              onCancel={() => setIsEditingYaml(false)}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  switch (field.type) {
    case 'time':
      return (
        <ConditionTime
          fieldId={field.id}
          path={path}
          index={index}
          onRemove={onRemove}
          onAppend={onAppend}
          onEditInYAML={handleEditInYAML}
        />
      )
    case 'distance_threshold':
      return (
        <ConditionDistanceThreshold
          fieldId={field.id}
          path={path}
          index={index}
          onRemove={onRemove}
          onAppend={onAppend}
          onEditInYAML={handleEditInYAML}
        />
      )
    case 'and':
    case 'or':
    case 'not': {
      const Icon =
        field.type === 'and' ? And : field.type === 'or' ? Graph : EqualNot
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
                <ConditionOptions
                  onDelete={() => onRemove(index)}
                  onDuplicate={() => onAppend(field)}
                  onCopy={handleCopy}
                  onCut={handleCut}
                  onEditInYAML={handleEditInYAML}
                  onTest={handleTest}
                />
              }
            >
              <ChevronDown className="h-5 w-5 shrink-0 text-brand-icon-gray transition-transform duration-200" />
              <div className="mr-2 flex w-full items-center">
                <div className="flex space-x-1 items-center">
                  <Icon className="h-5 w-5 shrink-0 text-brand-icon-gray" />
                  <p className="text-sm font-semibold text-brand-component-text-dark">
                    {t(field.type)}
                  </p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-3 space-y-3">
              <AddCondition onSelect={handleAppendCondition} />
              <div className="flex flex-col gap-3">
                {nestedFields.map((nestedField, nestedIndex) => (
                  <RenderCondition
                    key={nestedField.id}
                    field={nestedField as any}
                    path={`${nestedName}.${nestedIndex}`}
                    index={nestedIndex}
                    onRemove={nestedRemove}
                    onAppend={nestedAppend}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )
    }
    default:
      return null
  }
}
