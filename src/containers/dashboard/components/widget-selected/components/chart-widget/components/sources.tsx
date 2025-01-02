import React from 'react'
import { Form } from '@/components/ui/form'

import { useFieldArray, useFormContext, UseFormReturn } from 'react-hook-form'
import { defaultSourceChartValues, SourceChartPayload } from '@/validator'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SingleSource from './single-source'
import { useTranslations } from 'next-intl'
import { ChartSources } from '@/widget-models/chart'

interface Props {}

const ChartSource: React.FC<Props> = () => {
  const form = useFormContext<SourceChartPayload>()
  const { control } = form
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sources',
  })
  const t = useTranslations()

  const onSubmit = () => {}

  const handleAddSource = () => {
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
                onRemove={() => remove(index)}
              />
            ))}
          </form>
        </Form>
        <Button disabled={fields.length >= 5} onClick={handleAddSource}>
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
