'use client'

import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { TimeFormat } from '@/constants'
import { ChartSources, ChartType, Orientation } from '@/widget-models/chart'
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
  Tooltip,
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
    'source.0': 38,
    'source.1': 22,
    'source.2': 44,
    'source.3': 93,
    'source.4': 3,
  },
  {
    'source.0': 53,
    'source.1': 57,
    'source.2': 61,
    'source.3': 39,
    'source.4': 9,
  },
  {
    'source.0': 38,
    'source.1': 49,
    'source.2': 68,
    'source.3': 24,
    'source.4': 92,
  },
  {
    'source.0': 85,
    'source.1': 96,
    'source.2': 16,
    'source.3': 53,
    'source.4': 18,
  },
  {
    'source.0': 9,
    'source.1': 23,
    'source.2': 58,
    'source.3': 37,
    'source.4': 94,
  },
  {
    'source.0': 50,
    'source.1': 68,
    'source.2': 20,
    'source.3': 3,
    'source.4': 20,
  },
  {
    'source.0': 83,
    'source.1': 75,
    'source.2': 2,
    'source.3': 46,
    'source.4': 95,
  },
]

const today = dayjs()

const generateData = (format: TimeFormat) =>
  dailyOrders.map((order, index) => {
    const date = today.add(index, 'day').format(format)
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
}

const renderChartComponents = (
  chartType: ChartType,
  source: ChartSources,
  index: number,
  showData?: boolean
) => {
  const color =
    source.color === 'default'
      ? brandColors['component-fill-default-chart']
      : `#${source.color}`
  switch (chartType) {
    case ChartType.LineChart:
      return (
        <Line
          name={source.legend}
          key={index}
          type="linear"
          dataKey={`source.${index}`}
          stroke={`${color}`}
          strokeWidth={2}
          dot={false}
          id="3"
          legendType={
            !source.show_legend || !source.legend ? 'none' : undefined
          }
        >
          {showData && (
            <LabelList dataKey={`source.${index}`} position={'top'} />
          )}
        </Line>
      )
    case ChartType.AreaChart:
      return (
        <Area
          type="linear"
          dataKey={`source.${index}`}
          name={source.legend}
          stroke={color}
          strokeWidth={2}
          fillOpacity={1}
          fill={`url(#color${index})`}
          stackId={1}
          legendType={
            !source.show_legend || !source.legend ? 'none' : undefined
          }
        >
          {showData && (
            <LabelList dataKey={`source.${index}`} position={'top'} />
          )}
        </Area>
      )
    case ChartType.BarChart:
      return (
        <Bar
          type="linear"
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
          {showData && (
            <LabelList dataKey={`source.${index}`} position={'top'} />
          )}
        </Bar>
      )
  }
}

const PreviewChart: React.FC<PreviewLineChartProps> = ({
  sources,
  isSingleSource,
  showData,
  orientation = Orientation.Left,
  hideAxis = false,
  showXGrid = false,
  format = TimeFormat.FULL_DATE_MONTH_YEAR,
}) => {
  const data = generateData(format)
  return (
    <ChartContainer
      config={chartConfig}
      style={isSingleSource ? { height: 90, width: '100%' } : {}}
    >
      <ComposedChart
        data={data}
        accessibilityLayer
        margin={{ top: 20, left: 10, right: 10 }}
      >
        <defs>
          {sources.map((source, index) => {
            const color =
              source.color === 'default'
                ? brandColors['component-fill-default-chart']
                : `#${source.color}`
            return (
              <linearGradient
                key={index}
                id={`color${index}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                <stop offset="75%" stopColor={color} stopOpacity={0.05} />
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
          renderChartComponents(source.chart_type, source, index, showData)
        )}
        <Legend />
        <Tooltip />
      </ComposedChart>
    </ChartContainer>
  )
}

export { PreviewChart }
