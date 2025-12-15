import { useTheme } from 'next-themes'
import { WidgetContainer, WidgetTitle } from '.'
import { mapPayload } from '@/validator'

interface Props extends mapPayload {
  data: {
    coordinate: {
      latitude: number
      longitude: number
    }
  }
}

export const MapWidget = ({ sources, widget_info, data }: Props) => {
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'
  const { latitude, longitude } = data?.coordinate || {}
  return (
    <WidgetContainer className="flex flex-col ">
      <WidgetTitle>{widget_info.name}</WidgetTitle>
      <iframe
        style={{
          filter: isDarkMode ? 'invert(90%) hue-rotate(180deg)' : 'none',
        }}
        className="flex-1 size-full rounded"
        src={`https://www.google.com/maps?q=${latitude || 0},${longitude || 0}&z=15&t=${sources[0].map_type}&output=embed`}
        loading="lazy"
      />
    </WidgetContainer>
  )
}
