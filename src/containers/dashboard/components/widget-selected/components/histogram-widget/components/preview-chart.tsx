'use client'

import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import { TimeFormat } from '@/constants'
import { Orientation } from '@/widget-models/chart'
import { HistogramPayload } from '@/validator'
import React from 'react'
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
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

interface PreviewLineChartProps {
  sources: HistogramPayload['sources']
  isSingleSource?: boolean
  showData?: boolean
  orientation?: Orientation
  hideAxis?: boolean
  showXGrid?: boolean
  format?: TimeFormat
  widgetId?: string
  data: any
}

const getColor = (source: HistogramPayload['sources'][number]) => {
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
        {sources.map((source, index) => {
          const color = getColor(source)
          return (
            <Bar
              key={index}
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
              {showData && (
                <LabelList dataKey={`source.${index}`} position="top" />
              )}
            </Bar>
          )
        })}
        <Tooltip />
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
