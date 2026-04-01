import { useTranslations } from 'next-intl'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { AddAutomationFormValues, GroupType } from '../../schema'
import { AddConditionDropdown } from './components/add-condition-dropdown'
import { RenderCondition } from './components/render-condition'
import { useAutomationStore } from './stores/automation'

interface AndIfProps {
  isEditable: boolean
}

export const AndIf = ({ isEditable }: AndIfProps) => {
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

  const handleAddCondition = (
    type: GroupType | 'leaf' | 'paste',
    entity?: string
  ) => {
    if (type === 'paste') {
      if (!currentCondition) return
      append(currentCondition)
      return
    }
    if (type === 'leaf') {
      append({ type: 'leaf', entity: entity ?? '', operator: 'lte', value: '' })
      return
    }
    append({ type, rules: [] })
  }

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className="text-lg font-semibold text-brand-component-text-dark">
          {t('and_if')}
        </h3>
        <p className="text-xs text-brand-component-text-gray leading-4">
          {t('these_conditions_must_be_satisfied_for_the_automation_to_run')}.
        </p>
        <p className="text-xs text-brand-component-text-gray leading-4">
          {t(
            'conditions_allow_you_to_evaluate_device_entity_values_and_create_more_precise_automation_rules'
          )}
          .
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {conditionFields.map((condition, index) => {
          const key = condition.id
          return (
            <RenderCondition
              key={key}
              id={key}
              path={`conditions.${index}` as `conditions.${number}.${string}`}
              onDuplicate={(group) => insert(index, group)}
              onRemove={() => remove(index)}
              isEditable={isEditable}
            />
          )
        })}
        {isEditable && <AddConditionDropdown onAdd={handleAddCondition} />}
      </div>
    </div>
  )
}
