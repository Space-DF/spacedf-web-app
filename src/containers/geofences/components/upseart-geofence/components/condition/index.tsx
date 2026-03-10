import { useFieldArray, useFormContext } from 'react-hook-form'
import { GeofenceForm, DEFAULT_CONDITIONS } from '../../schema'
import { RenderCondition } from './components/render-condition'
import { AddCondition } from './components/add-condition'
import { useGeofenceStore } from '@/stores/geofence-store'

const GeofenceCondition = () => {
  const form = useFormContext<GeofenceForm>()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'conditions',
  })

  const currentCondition = useGeofenceStore((state) => state.currentCondition)

  const handleSelectCondition = (
    optionKey: GeofenceForm['conditions'][number]['type']
  ) => {
    if (currentCondition && optionKey === 'paste') {
      append(currentCondition)
      return
    }
    if (optionKey === 'time' || optionKey === 'distance_threshold') {
      append(
        DEFAULT_CONDITIONS[optionKey] as GeofenceForm['conditions'][number]
      )
    } else {
      append({ type: optionKey } as GeofenceForm['conditions'][number])
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <AddCondition onSelect={handleSelectCondition} />
      {fields.map((field, index) => (
        <RenderCondition
          key={field.id}
          field={field}
          path={`conditions.${index}`}
          index={index}
          onRemove={remove}
          onAppend={append}
        />
      ))}
    </div>
  )
}

export default GeofenceCondition
