import { useFieldArray, useFormContext } from 'react-hook-form'
import { GeofenceForm, DEFAULT_CONDITIONS } from '../../schema'
import { RenderCondition } from './components/render-condition'
import { AddCondition } from './components/add-condition'
import { useGeofenceStore } from '@/stores/geofence-store'
import { useShallow } from 'zustand/react/shallow'

const GeofenceCondition = () => {
  const form = useFormContext<GeofenceForm>()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'conditions',
  })

  const { currentCondition, setCurrentCondition } = useGeofenceStore(
    useShallow((state) => ({
      currentCondition: state.currentCondition,
      setCurrentCondition: state.setCurrentCondition,
    }))
  )

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

  const handleCopyCondition = (
    condition: GeofenceForm['conditions'][number]
  ) => {
    setCurrentCondition(condition)
  }

  const handleCutCondition = (
    condition: GeofenceForm['conditions'][number],
    index: number
  ) => {
    handleCopyCondition(condition)
    remove(index)
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
          onCopy={handleCopyCondition}
          onCut={handleCutCondition}
        />
      ))}
    </div>
  )
}

export default GeofenceCondition
