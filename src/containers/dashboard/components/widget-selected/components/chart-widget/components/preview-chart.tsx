'use client'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { TimeFormat } from '@/constants'
import { ChartType, Orientation } from '@/widget-models/chart'
import dayjs from 'dayjs'
import { ChartPayload } from '@/validator'
import React from 'react'
import {
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Line,
  Legend,
  ComposedChart,
  LabelList,
} from 'recharts'
import { brandColors } from '@/configs'

const chartConfig = {
  desktop: {
    label: 'Temperature',
    color: '#FCACB9',
  },
} satisfies ChartConfig

export const dailyOrders = [
  {
    'source.0': 42,
    'source.1': 48,
    'source.2': 35,
    'source.3': 58,
    'source.4': 45,
  },
  {
    'source.0': 55,
    'source.1': 41,
    'source.2': 62,
    'source.3': 47,
    'source.4': 39,
  },
  {
    'source.0': 38,
    'source.1': 56,
    'source.2': 44,
    'source.3': 32,
    'source.4': 61,
  },
  {
    'source.0': 61,
    'source.1': 43,
    'source.2': 51,
    'source.3': 57,
    'source.4': 36,
  },
  {
    'source.0': 46,
    'source.1': 59,
    'source.2': 33,
    'source.3': 52,
    'source.4': 48,
  },
  {
    'source.0': 53,
    'source.1': 37,
    'source.2': 59,
    'source.3': 41,
    'source.4': 54,
  },
  {
    'source.0': 40,
    'source.1': 62,
    'source.2': 45,
    'source.3': 49,
    'source.4': 34,
  },
]

const today = dayjs()

export const generateData = (format: TimeFormat) =>
  dailyOrders.map((order, index) => {
    const date = today.add(index * 2, 'minutes').format(format)
    return { ...order, day: date }
  })

interface PreviewLineChartProps {
  sources: ChartPayload['sources']
  isSingleSource?: boolean
  showData?: boolean
  orientation?: Orientation
  hideAxis?: boolean
  showXGrid?: boolean
  format?: TimeFormat
  widgetId?: string
  data: any
}

const renderChartComponents = (
  chartType: ChartType,
  source: ChartPayload['sources'][number],
  index: number,
  showData?: boolean,
  widgetId?: string
) => {
  const color =
    source.color === 'default'
      ? brandColors['component-fill-default-chart']
      : `#${source.color}`
  const gradientId = widgetId ? `color${index}-${widgetId}` : `color${index}`
  switch (chartType) {
    case ChartType.LineChart:
      return (
        <Line
          name={source.legend}
          key={index}
          type="monotone"
          dataKey={`source.${index}`}
          stroke={`${color}`}
          strokeWidth={2}
          dot={false}
          id="3"
          legendType={
            !source.show_legend || !source.legend ? 'none' : undefined
          }
        >
          {showData && <LabelList dataKey={`source.${index}`} position="top" />}
        </Line>
      )
    case ChartType.AreaChart:
      return (
        <Area
          type="monotone"
          dataKey={`source.${index}`}
          name={source.legend}
          stroke={color}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#${gradientId})`}
          stackId={1}
          legendType={
            !source.show_legend || !source.legend ? 'none' : undefined
          }
        >
          {showData && <LabelList dataKey={`source.${index}`} position="top" />}
        </Area>
      )
    case ChartType.BarChart:
      return (
        <Bar
          type="monotone"
          dataKey={`source.${index}`}
          name={source.legend}
          stroke={color}
          fill={color}
          strokeWidth={2}
          stackId={2}
          legendType={
            !source.show_legend || !source.legend ? 'none' : undefined
          }
        >
          {showData && <LabelList dataKey={`source.${index}`} position="top" />}
        </Bar>
      )
    case ChartType.BarChartDouble:
      return (
        <Bar
          type="monotone"
          dataKey={`source.${index}`}
          name={source.legend}
          stroke={color}
          fill={color}
          strokeWidth={2}
          legendType={
            !source.show_legend || !source.legend ? 'none' : undefined
          }
        >
          {showData && <LabelList dataKey={`source.${index}`} position="top" />}
        </Bar>
      )
  }
}

const getColor = (source: ChartPayload['sources'][number]) => {
  return source.color === 'default'
    ? brandColors['component-fill-default-chart']
    : `#${source.color}`
}

const PreviewChart: React.FC<PreviewLineChartProps> = ({
  sources,
  isSingleSource,
  showData,
  orientation = Orientation.Left,
  hideAxis = false,
  showXGrid = false,
  widgetId,
  data,
}) => {
  return (
    <ChartContainer
      config={chartConfig}
      className="size-full"
      style={isSingleSource ? { height: 120, width: '100%' } : {}}
    >
      <ComposedChart
        data={data}
        accessibilityLayer
        margin={{ top: 20, left: 10, right: 10 }}
      >
        <defs>
          {sources.map((source, index) => {
            const stopColor = getColor(source)
            const gradientId = widgetId
              ? `color${index}-${widgetId}`
              : `color${index}`
            return (
              <linearGradient
                key={index}
                id={gradientId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={stopColor} stopOpacity={0.4} />
                <stop offset="75%" stopColor={stopColor} stopOpacity={0.05} />
              </linearGradient>
            )
          })}
        </defs>

        <YAxis
          axisLine={false}
          tickLine={false}
          width={20}
          hide={hideAxis}
          orientation={hideAxis ? undefined : orientation}
          className="text-sm"
        />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          hide={hideAxis}
          className="text-sm"
        />
        <CartesianGrid horizontal={showXGrid} vertical={false} />
        {sources.map((source, index) =>
          renderChartComponents(
            source.chart_type as ChartType,
            source,
            index,
            showData,
            widgetId
          )
        )}
        <ChartTooltip content={<ChartTooltipContent />} />
        <Legend
          content={
            <div className="w-full overflow-x-auto custom-scrollbar scroll-smooth pb-1">
              <div className="flex space-x-4 justify-center min-w-max">
                {sources.map((source, index) => {
                  if (!source.show_legend) {
                    return <></>
                  }
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-1 flex-shrink-0"
                    >
                      <div
                        className="size-2 rounded-full"
                        style={{ backgroundColor: getColor(source) }}
                      />
                      <p className="text-sm text-brand-component-text-gray whitespace-nowrap">
                        {source.legend}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          }
        />
      </ComposedChart>
    </ChartContainer>
  )
}

export { PreviewChart }
