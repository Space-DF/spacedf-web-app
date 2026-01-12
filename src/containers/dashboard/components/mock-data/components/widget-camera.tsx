// import { StreamVideo } from '@/containers/components/stream-video'
import { WidgetContainer, WidgetTitle } from '.'
import { WidgetInfo } from '@/widget-models/widget'

interface WidgetCameraProps {
  widget_info: WidgetInfo
}

export const WidgetCamera = ({ widget_info }: WidgetCameraProps) => {
  return (
    <WidgetContainer className="flex flex-col">
      <WidgetTitle>{widget_info.name}</WidgetTitle>
      {/* <StreamVideo autoPlay={false} /> */}
    </WidgetContainer>
  )
}
