import { useTranslations } from 'next-intl'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { AddAutomationFormValues, GroupType } from '../../schema'
import { AddConditionDropdown } from './components/add-condition-dropdown'
import { RenderCondition } from './components/render-condition'
import { useAutomationStore } from './stores/automation'

export const AndIf = () => {
  const { control } = useFormContext<AddAutomationFormValues>()
  const {
    fields: conditionFields,
    append,
    remove,
    insert,
  } = useFieldArray({
    control,
    name: 'conditions',
  })
  const currentCondition = useAutomationStore((state) => state.currentCondition)

  const t = useTranslations('automation')

  const handleAddCondition = (type: GroupType | 'leaf' | 'paste') => {
    if (type === 'paste') {
      if (!currentCondition) return
      append(currentCondition)
      return
    }
    if (type === 'leaf') return
    append({ type, rules: [] })
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className="text-lg font-semibold text-brand-component-text-dark">
          {t('and_if')}
        </h3>
        <p className="text-xs text-brand-component-text-gray leading-4">
          {t('and_if_description')}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {conditionFields.map((condition, index) => {
          const key = condition.id
          return (
            <RenderCondition
              key={key}
              id={key}
              path={`conditions.${index}`}
              onDuplicate={(group) => insert(index, group)}
              onRemove={() => remove(index)}
            />
          )
        })}
        <AddConditionDropdown onAdd={handleAddCondition} />
      </div>
    </div>
  )
}
