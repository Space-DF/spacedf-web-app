import { WidgetChart } from '@/types/widget'
import { WidgetContainer, WidgetTitle } from '.'
import { PreviewChart } from '../../widget-selected/components/chart-widget/components/preview-chart'
import { TimeFormat } from '@/constants'
import dayjs from 'dayjs'
import { useMemo } from 'react'

interface Props extends WidgetChart {
  isShowFullChart?: boolean
  id?: string
  data: {
    data: Record<string, any>
  }
}

interface DataPoint {
  timestamp: string
  value: number
}

const convertDataToRechartsFormat = (
  data: DataPoint[],
  format: TimeFormat,
  sourceIndex: number = 0
) => {
  if (!Array.isArray(data) || data.length === 0) {
    return []
  }

  return data.map((item) => {
    const formattedDate = dayjs(item.timestamp).format(format)
    return {
      day: formattedDate,
      [`source.${sourceIndex}`]: item.value,
    }
  })
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
  data,
}: Props) => {
  const isSingleSource = isShowFullChart
    ? false
    : Array.isArray(sources) && sources.length === 1

  const newData = data.data || []
  const timeFormat = (format as TimeFormat) || TimeFormat.FULL_DATE_MONTH_YEAR

  const chartData = useMemo(
    () =>
      Array.isArray(newData) && newData.length > 0
        ? convertDataToRechartsFormat(newData as DataPoint[], timeFormat, 0)
        : [],
    [newData, timeFormat]
  )

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
        data={chartData}
      />
    </WidgetContainer>
  )
}
