import React, { useCallback } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { dataTablePayload } from '@/validator'
import Conditional from './single-conditional'
import { useTranslations } from 'next-intl'
import { PlusIcon } from '@radix-ui/react-icons'

const Conditionals: React.FC = () => {
  const t = useTranslations('dashboard')
  const { control } = useFormContext<dataTablePayload>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'conditionals',
  })

  const handleAddConditional = useCallback(() => {
    append({
      field: '',
      operator: '',
      value: '',
      text_color: '',
      bg_color: '',
      limit: false,
    })
  }, [append])

  return (
    <div className="mt-4 size-full space-y-4 px-4 pb-8">
      {fields.map((conditionals, index) => (
        <Conditional key={conditionals.id} index={index} onRemove={remove} />
      ))}
      <Button
        className="flex items-center gap-2"
        onClick={handleAddConditional}
      >
        {t('add_conditional')} <PlusIcon />
      </Button>
    </div>
  )
}
export default Conditionals
