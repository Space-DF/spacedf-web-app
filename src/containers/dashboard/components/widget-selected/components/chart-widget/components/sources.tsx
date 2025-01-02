import React from 'react'
import { Form } from '@/components/ui/form'

import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { defaultSourceChartValues } from '@/validator'
import { Plus, PlusIcon } from 'lucide-react'
import { ChartSources } from '@/widget-models/chart'
import { Button } from '@/components/ui/button'
import SingleSource from './single-source'
import { useTranslations } from 'next-intl'

interface Props {
  form: UseFormReturn<
    {
      sources: ChartSources[]
    },
    any,
    undefined
  >
}

const ChartSource: React.FC<Props> = ({ form }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'sources',
  })
  const t = useTranslations()

  const onSubmit = () => {}

  const onAddSource = () => {
    if (fields.length === 5) return
    append(defaultSourceChartValues)
  }

  return (
    <div className="flex flex-col scroll-smooth duration-300">
      <div className="space-y-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-wrap gap-y-4"
          >
            {fields.map((field, index) => (
              <SingleSource
                field={field}
                index={index}
                form={form}
                onRemove={() => remove(index)}
              />
            ))}
          </form>
        </Form>
        <Button disabled={fields.length >= 5} onClick={onAddSource}>
          <div className="flex items-center space-x-2">
            <span>{t('dashboard.add')}</span>
            <PlusIcon />
          </div>
        </Button>
      </div>
    </div>
  )
}

export default ChartSource
