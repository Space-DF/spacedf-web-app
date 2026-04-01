import { useFormContext, useWatch } from 'react-hook-form'
import { GroupBlock } from './group-block'
import { AddAutomationFormValues, AutomationCondition } from '../../../schema'
import { LeafBlock } from './leaf-block'

interface RenderConditionProps {
  path: `conditions.${number}.${string}`
  id: string
  onDuplicate: (group: AutomationCondition) => void
  onRemove: () => void
  isEditable: boolean
}

export const RenderCondition = ({
  path,
  id,
  onDuplicate,
  onRemove,
  isEditable,
}: RenderConditionProps) => {
  const { control } = useFormContext<AddAutomationFormValues>()
  const watchedGroup = useWatch({
    control,
    name: path,
  })

  const group = { ...watchedGroup, id }

  if (group.type === 'leaf') {
    return (
      <LeafBlock
        leaf={group}
        path={path}
        onDuplicateSelf={onDuplicate}
        onRemoveSelf={onRemove}
        isEditable={isEditable}
      />
    )
  }
  return (
    <GroupBlock
      group={group}
      path={path}
      onDuplicateSelf={onDuplicate}
      onRemoveSelf={onRemove}
      isEditable={isEditable}
    />
  )
}
