import { WidgetChart } from '@/types/widget'
import { WidgetContainer, WidgetTitle } from '.'
import { PreviewChart } from '../../widget-selected/components/chart-widget/components/preview-chart'

interface Props extends WidgetChart {
  isShowFullChart?: boolean
  id?: string
}

export const ChartWidget = ({
  id,
  sources,
  widget_info,
  orientation,
  format,
  hideAxis,
  showXGrid,
  isShowFullChart,
}: Props) => {
  const isSingleSource = isShowFullChart
    ? false
    : Array.isArray(sources) && sources.length === 1

  return (
    <WidgetContainer className="flex flex-col justify-center">
      <WidgetTitle>{widget_info.name}</WidgetTitle>
      <PreviewChart
        sources={sources}
        isSingleSource={isSingleSource}
        orientation={orientation}
        hideAxis={hideAxis}
        showXGrid={showXGrid}
        format={format}
        widgetId={id}
      />
    </WidgetContainer>
  )
}
