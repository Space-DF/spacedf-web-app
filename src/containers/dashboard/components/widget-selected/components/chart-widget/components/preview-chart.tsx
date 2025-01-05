'use client'

import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { SourceChartPayload } from '@/validator'
import { ChartSources, ChartType } from '@/widget-models/chart'
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

const chartConfig = {
  desktop: {
    label: 'Temperature',
    color: '#FCACB9',
  },
} satisfies ChartConfig

export const dailyOrders = [
  {
    day: 'Mon',
    'source.0': 38,
    'source.1': 22,
    'source.2': 44,
    'source.3': 93,
    'source.4': 3,
  },
  {
    day: 'Tue',
    'source.0': 53,
    'source.1': 57,
    'source.2': 61,
    'source.3': 39,
    'source.4': 9,
  },
  {
    day: 'Wed',
    'source.0': 38,
    'source.1': 49,
    'source.2': 68,
    'source.3': 24,
    'source.4': 92,
  },
  {
    day: 'Thu',
    'source.0': 85,
    'source.1': 96,
    'source.2': 16,
    'source.3': 53,
    'source.4': 18,
  },
  {
    day: 'Fri',
    'source.0': 9,
    'source.1': 23,
    'source.2': 58,
    'source.3': 37,
    'source.4': 94,
  },
  {
    day: 'Sat',
    'source.0': 50,
    'source.1': 68,
    'source.2': 20,
    'source.3': 3,
    'source.4': 20,
  },
  {
    day: 'Sun',
    'source.0': 83,
    'source.1': 75,
    'source.2': 2,
    'source.3': 46,
    'source.4': 95,
  },
]

interface PreviewLineChartProps {
  sources: SourceChartPayload['sources']
  isSingleSource?: boolean
  showData?: boolean
}

const renderChartComponents = (
  chartType: ChartType,
  source: ChartSources,
  index: number,
  showData?: boolean,
) => {
  switch (chartType) {
    case ChartType.LineChart:
      return (
        <Line
          name={source.legend}
          key={index}
          type="linear"
          dataKey={`source.${index}`}
          stroke={`#${source.color}`}
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
          stroke={`#${source.color}`}
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
          stroke={`#${source.color}`}
          fill={`#${source.color}`}
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
}) => {
  return (
    <ChartContainer
      config={chartConfig}
      style={isSingleSource ? { height: 90, width: '100%' } : {}}
    >
      <ComposedChart data={dailyOrders} accessibilityLayer>
        <defs>
          {sources.map((source, index) => (
            <linearGradient
              key={index}
              id={`color${index}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor={`#${source.color}`}
                stopOpacity={0.4}
              />
              <stop
                offset="75%"
                stopColor={`#${source.color}`}
                stopOpacity={0.05}
              />
            </linearGradient>
          ))}
        </defs>

        <YAxis
          axisLine={false}
          tickLine={false}
          width={20}
          tick={!isSingleSource}
        />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={!isSingleSource}
        />
        <CartesianGrid horizontal={!isSingleSource} vertical={false} />
        {sources.map((source, index) =>
          renderChartComponents(source.chart_type, source, index, showData),
        )}
        <Legend />
        <Tooltip />
      </ComposedChart>
    </ChartContainer>
  )
}

export { PreviewChart }
