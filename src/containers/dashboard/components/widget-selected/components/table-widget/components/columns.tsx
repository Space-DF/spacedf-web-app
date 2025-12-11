import React, { useMemo, useCallback } from 'react'
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { dataTablePayload } from '@/validator'
import Column from './column'
import { useTranslations } from 'next-intl'
import { PlusIcon } from '@radix-ui/react-icons'
import { FIELD_DISPLAY_NAME } from '../table.const'

const getFieldTypes = (entities: Record<string, any>[]) => {
  const allFields = entities.reduce(
    (fields, entity) => {
      Object.keys(entity).forEach((key) => {
        fields[key] = (fields[key] || 0) + 1
      })
      return fields
    },
    {} as Record<string, number>
  )

  const totalEntities = entities.length

  const generalFields = Object.keys(allFields).filter(
    (field) => allFields[field] === totalEntities
  )

  const specificFields = Object.keys(allFields).filter(
    (field) => allFields[field] < totalEntities
  )

  return { generalFields, specificFields }
}

const Columns: React.FC = () => {
  const t = useTranslations('dashboard')
  const { control } = useFormContext<dataTablePayload>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'columns',
  })

  const entities = useWatch({
    control,
    name: 'source.entities',
  })
  const { generalFields, specificFields } = useMemo(
    () => getFieldTypes(entities),
    [entities]
  )

  const handleAddColumn = useCallback(() => {
    append({
      column_name:
        FIELD_DISPLAY_NAME[generalFields[0]] || generalFields[0] || '',
      field: generalFields[0] || '',
      type: 'General',
      field_type: 'unknown',
    })
  }, [append, generalFields])

  return (
    <div className="mt-4 size-full space-y-4 px-4 pb-8">
      {fields.map((column, index) => (
        <Column
          key={column.id}
          index={index}
          generalFields={generalFields}
          specificFields={specificFields}
          onRemove={remove}
        />
      ))}
      <Button className="flex items-center gap-2" onClick={handleAddColumn}>
        {t('add_column')} <PlusIcon />
      </Button>
    </div>
  )
}

export default Columns
