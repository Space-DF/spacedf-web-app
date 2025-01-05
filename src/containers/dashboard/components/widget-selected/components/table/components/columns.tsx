import React, { useState, useEffect } from 'react'
import { useFormContext, useFieldArray } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { dataTablePayload } from '@/validator'
import Column from './column'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations()
  const { control, watch } = useFormContext<dataTablePayload>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'columns',
  })

  const source = watch('source.devices')
  const [generalFields, setGeneralFields] = useState<string[]>([])
  const [specificFields, setSpecificFields] = useState<string[]>([])

  useEffect(() => {
    const { generalFields, specificFields } = getFieldTypes(source)
    setGeneralFields(generalFields)
    setSpecificFields(specificFields)
  }, [source])

  const handleAddColumn = () => {
    append({
      column_name: generalFields[0] || '',
      field: generalFields[0] || '',
      type: 'General',
    })
  }

  return (
    <div className="mt-4 size-full space-y-4 px-4">
      {fields.map((column, index) => (
        <Column
          key={column.id}
          index={index}
          generalFields={generalFields}
          specificFields={specificFields}
          remove={remove}
        />
      ))}
      <Button onClick={handleAddColumn}>{t('dashboard.add_column')}</Button>
    </div>
  )
}

export default Columns
