import { WidgetMap } from '@/types/widget'
import { WidgetContainer, WidgetTitle } from '.'

export const MapWidget = ({
  latitude,
  longitude,
  title,
  map_type,
}: WidgetMap) => {
  return (
    <WidgetContainer className="flex flex-col ">
      <WidgetTitle>{title}</WidgetTitle>
      <iframe
        style={{
          filter: 'invert(90%) hue-rotate(180deg)',
        }}
        className="flex-1 size-full rounded"
        src={`https://www.google.com/maps?q=${latitude},${longitude}&z=15&t=${map_type}&output=embed`}
        loading="lazy"
      />
    </WidgetContainer>
  )
}
