import { WidgetContainer, WidgetTitle } from '.'
import { mapPayload } from '@/validator'

export const MapWidget = ({ sources, widget_info }: mapPayload) => {
  return (
    <WidgetContainer className="flex flex-col ">
      <WidgetTitle>{widget_info.name}</WidgetTitle>
      <iframe
        style={{
          filter: 'invert(90%) hue-rotate(180deg)',
        }}
        className="flex-1 size-full rounded"
        src={`https://www.google.com/maps?q=${sources[0].coordinate[0]},${sources[0].coordinate[1]}&z=15&t=${sources[0].map_type}&output=embed`}
        loading="lazy"
      />
    </WidgetContainer>
  )
}
