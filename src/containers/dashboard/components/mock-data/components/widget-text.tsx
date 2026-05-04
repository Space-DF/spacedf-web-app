import { WidgetContainer } from '.'

interface Props {
  content: string
  isEdit?: boolean
  onDelete?: () => void
}

export const TextWidget = ({ content, isEdit, onDelete }: Props) => {
  return (
    <WidgetContainer isEdit={isEdit} onDelete={onDelete}>
      <p className="font-medium text-xs">{content}</p>
    </WidgetContainer>
  )
}
