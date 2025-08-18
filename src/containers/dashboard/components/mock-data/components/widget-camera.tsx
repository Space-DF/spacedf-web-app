import { StreamVideo } from '@/containers/components/stream-video'
import { WidgetContainer, WidgetTitle } from '.'

export const WidgetCamera = ({ title }: { title: string }) => {
  return (
    <WidgetContainer className="flex flex-col">
      <WidgetTitle>{title}</WidgetTitle>
      <StreamVideo autoPlay={false} />
    </WidgetContainer>
  )
}
