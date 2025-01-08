import React, { useMemo, useCallback } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { dataTablePayload } from '@/validator'
import Column from './column'
import { useTranslations } from 'next-intl'
import { PlusIcon } from '@radix-ui/react-icons'

const getFieldTypes = (devices: Record<string, any>[]) => {
  const allFields = devices.reduce(
    (fields, device) => {
      Object.keys(device).forEach((key) => {
        fields[key] = (fields[key] || 0) + 1
      })
      return fields
    },
    {} as Record<string, number>,
  )

  const totalDevices = devices.length

  const generalFields = Object.keys(allFields).filter(
    (field) => allFields[field] === totalDevices,
  )

  const specificFields = Object.keys(allFields).filter(
    (field) => allFields[field] < totalDevices,
  )

  return { generalFields, specificFields }
}

const Columns: React.FC = () => {
  const t = useTranslations('dashboard')
  const { control, watch } = useFormContext<dataTablePayload>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'columns',
  })

  const source = watch('source.devices')

  const { generalFields, specificFields } = useMemo(
    () => getFieldTypes(source),
    [source],
  )

  const handleAddColumn = useCallback(() => {
    append({
      column_name: generalFields[0] || '',
      field: generalFields[0] || '',
      type: 'General',
    })
  }, [append, generalFields])

  return (
    <div className="mt-4 size-full space-y-4 px-4">
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
