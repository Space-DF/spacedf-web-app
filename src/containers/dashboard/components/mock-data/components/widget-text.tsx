import { WidgetContainer } from '.'

interface Props {
  content: string
  isEdit?: boolean
  onDelete?: () => void
  onEdit?: () => void
}

export const TextWidget = ({ content, isEdit, onDelete, onEdit }: Props) => {
  return (
    <WidgetContainer isEdit={isEdit} onDelete={onDelete} onEdit={onEdit}>
      <p className="font-medium text-xs">{content}</p>
    </WidgetContainer>
  )
}
