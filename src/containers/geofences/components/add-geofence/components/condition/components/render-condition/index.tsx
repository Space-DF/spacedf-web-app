import {
  FieldArrayWithId,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { GeofenceForm } from '../../../../schema'
import ConditionTime from '../time'
import ConditionDistanceThreshold from '../distance-threshold'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { And, Graph } from '@/components/icons'
import { EqualNot, ChevronDown, Ellipsis } from 'lucide-react'
import { AddCondition } from '../add-condition'

interface Props {
  field: FieldArrayWithId<GeofenceForm, 'conditions', 'id'>
  path: string
}

export const RenderCondition = ({ field, path }: Props) => {
  const t = useTranslations('common')
  const form = useFormContext<GeofenceForm>()
  const { control } = form

  const nestedName = `${path}.rules`

  const { fields: nestedFields, append } = useFieldArray({
    control,
    name: nestedName as GeofenceForm['conditions'][number]['rules'],
  })

  switch (field.type) {
    case 'time':
      return <ConditionTime field={field} path={path} />
    case 'distance_threshold':
      return <ConditionDistanceThreshold field={field} path={path} />
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
                <div>
                  <Ellipsis className="h-5 w-5 shrink-0 text-brand-icon-gray transition-transform duration-200" />
                </div>
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
              <AddCondition onSelect={(key) => append({ type: key } as any)} />
              <div className="flex flex-col gap-3">
                {nestedFields.map((nestedField, nestedIndex) => (
                  <RenderCondition
                    key={nestedField.id}
                    field={nestedField as any}
                    path={`${nestedName}.${nestedIndex}`}
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
