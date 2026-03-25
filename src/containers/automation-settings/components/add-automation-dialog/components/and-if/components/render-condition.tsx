import { useFormContext, useWatch } from 'react-hook-form'
import { GroupBlock } from './group-block'
import { AddAutomationFormValues, AutomationCondition } from '../../../schema'

interface RenderConditionProps {
  path: `conditions.${number}`
  id: string
  onDuplicate: (group: AutomationCondition) => void
  onRemove: () => void
}

export const RenderCondition = ({
  path,
  id,
  onDuplicate,
  onRemove,
}: RenderConditionProps) => {
  const { control } = useFormContext<AddAutomationFormValues>()
  const watchedGroup = useWatch({
    control,
    name: path,
  })

  const group = { ...watchedGroup, id }

  return (
    <GroupBlock
      group={group}
      path={path}
      onDuplicateSelf={onDuplicate}
      onRemoveSelf={onRemove}
    />
  )
}
