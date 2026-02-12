import { useFieldArray, useFormContext } from 'react-hook-form'
import { GeofenceForm } from '../../schema'
import { RenderCondition } from './components/render-condition'
import { AddCondition } from './components/add-condition'

const GeofenceCondition = () => {
  const form = useFormContext<GeofenceForm>()
  const {
    fields,
    append,
    remove: _remove,
  } = useFieldArray({
    control: form.control,
    name: 'conditions',
  })

  const handleSelectCondition = (
    optionKey: GeofenceForm['conditions'][number]['type']
  ) => {
    append({ type: optionKey })
  }

  return (
    <div className="flex flex-col gap-4">
      <AddCondition onSelect={handleSelectCondition} />
      {fields.map((field, index) => (
        <RenderCondition
          key={field.id}
          field={field}
          path={`conditions.${index}`}
        />
      ))}
    </div>
  )
}

export default GeofenceCondition
