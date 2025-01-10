import React from 'react'

import { useFieldArray, useFormContext, UseFormReturn } from 'react-hook-form'
import { defaultSourceChartValues, ChartPayload } from '@/validator'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import SingleSource from './single-source'
import { useTranslations } from 'next-intl'

interface Props {}

const ChartSource: React.FC<Props> = () => {
  const form = useFormContext<ChartPayload>()
  const { control } = form
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sources',
  })
  const t = useTranslations('dashboard')

  const handleAddSource = () => {
    if (fields.length === 5) return
    append(defaultSourceChartValues)
  }

  return (
    <div className="flex flex-col scroll-smooth duration-300">
      <div className="space-y-4">
        {fields.map((field, index) => (
          <SingleSource
            field={field}
            index={index}
            onRemove={() => remove(index)}
          />
        ))}
        <Button disabled={fields.length >= 5} onClick={handleAddSource}>
          <div className="flex items-center space-x-2">
            <span>{t('add')}</span>
            <PlusIcon />
          </div>
        </Button>
      </div>
    </div>
  )
}

export default ChartSource
