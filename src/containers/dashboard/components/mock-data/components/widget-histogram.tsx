import { WidgetChart } from '@/types/widget'
import { WidgetContainer, WidgetTitle } from '.'
import { PreviewChart } from '../../widget-selected/components/histogram-widget/components/preview-chart'

interface Props extends WidgetChart {
  id?: string
}

export const WidgetHistogram = ({
  id,
  sources,
  widget_info,
  orientation,
  format,
  hideAxis,
  showXGrid,
}: Props) => {
  return (
    <WidgetContainer className="flex flex-col justify-center">
      <WidgetTitle>{widget_info.name}</WidgetTitle>
      <PreviewChart
        sources={sources}
        orientation={orientation}
        hideAxis={hideAxis}
        showXGrid={showXGrid}
        format={format}
        widgetId={id}
      />
    </WidgetContainer>
  )
}
