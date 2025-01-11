import React from 'react'

import { Button } from '@/components/ui/button'
import { ChartPayload, defaultSourceChartValues } from '@/validator'
import { PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useFieldArray, useFormContext } from 'react-hook-form'
import SingleSource from './single-source'

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
            key={index}
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
