// import { StreamVideo } from '@/containers/components/stream-video'
import { WidgetContainer, WidgetTitle } from '.'
import { WidgetInfo } from '@/widget-models/widget'

interface WidgetCameraProps {
  widget_info: WidgetInfo
  isEdit?: boolean
  onDelete?: () => void
  onEdit?: () => void
}

export const WidgetCamera = ({
  widget_info,
  isEdit,
  onDelete,
  onEdit,
}: WidgetCameraProps) => {
  return (
    <WidgetContainer
      className="flex flex-col"
      isEdit={isEdit}
      onDelete={onDelete}
      onEdit={onEdit}
    >
      <WidgetTitle>{widget_info.name}</WidgetTitle>
      {/* <StreamVideo autoPlay={false} /> */}
    </WidgetContainer>
  )
}
