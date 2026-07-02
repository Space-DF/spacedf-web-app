import { WidgetChart } from '@/types/widget'
import { WidgetContainer, WidgetTitle } from '.'
import dynamic from 'next/dynamic'

const PreviewChart = dynamic(
  () =>
    import(
      '../../widget-selected/components/histogram-widget/components/preview-chart'
    ).then((mod) => mod.PreviewChart),
  {
    ssr: false,
  }
)
import { TimeFormat } from '@/constants'
import { generateData } from '../../widget-selected/components/chart-widget/components/preview-chart'

interface Props extends WidgetChart {
  id?: string
  isEdit?: boolean
  onDelete?: () => void
  onEdit?: () => void
}

export const WidgetHistogram = ({
  id,
  sources,
  widget_info,
  orientation,
  format,
  hideAxis,
  showXGrid,
  isEdit,
  onDelete,
  onEdit,
}: Props) => {
  return (
    <WidgetContainer
      className="flex flex-col justify-center"
      isEdit={isEdit}
      onDelete={onDelete}
      onEdit={onEdit}
    >
      <WidgetTitle>{widget_info.name}</WidgetTitle>
      <PreviewChart
        sources={sources}
        orientation={orientation}
        hideAxis={hideAxis}
        showXGrid={showXGrid}
        format={format}
        widgetId={id}
        data={generateData(
          (format as TimeFormat) || TimeFormat.FULL_DATE_MONTH_YEAR
        )}
      />
    </WidgetContainer>
  )
}
