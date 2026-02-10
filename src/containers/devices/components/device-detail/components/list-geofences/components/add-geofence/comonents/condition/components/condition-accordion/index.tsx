import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ChevronDown, Ellipsis, EqualNot } from 'lucide-react'
import { GeofenceForm } from '../../../../schema'
import {
  FieldArrayWithId,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import { And, Graph } from '@/components/icons'
import { useTranslations } from 'next-intl'
import { AddCondition } from '../add-condition'

interface Props {
  field: FieldArrayWithId<GeofenceForm, 'conditions', 'id'>
  index: number
}

export const ConditionAccordion = ({ field, index }: Props) => {
  const Icon =
    field.type === 'and' ? And : field.type === 'or' ? Graph : EqualNot
  const t = useTranslations('common')
  const form = useFormContext<GeofenceForm>()
  const { control } = form
  const { append } = useFieldArray({
    control,
    name: 'conditions',
  })
  return (
    <Accordion
      key={field.id}
      type="single"
      collapsible
      className="w-full"
      defaultValue={`sources.${index}`}
    >
      <AccordionItem
        value={`sources.${index}`}
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
        <AccordionContent className="p-3">
          <AddCondition onSelect={(key) => append({ type: key })} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
