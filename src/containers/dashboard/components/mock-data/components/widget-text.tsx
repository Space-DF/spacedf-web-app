import { WidgetContainer } from '.'

interface Props {
  content: string
}

export const TextWidget = ({ content }: Props) => {
  return (
    <WidgetContainer>
      <p className="font-medium text-xs">{content}</p>
    </WidgetContainer>
  )
}
