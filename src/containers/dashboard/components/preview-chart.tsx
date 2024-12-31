'use client'

import { ChartConfig, ChartContainer } from '@/components/ui/chart'
import React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts'

const chartConfig = {
  desktop: {
    label: 'Temperature',
    color: '#FCACB9',
  },
} satisfies ChartConfig

const dailyOrders = [
  { day: 'Mon', uv: Math.floor(Math.random() * 100) },
  { day: 'Tue', uv: Math.floor(Math.random() * 100) },
  { day: 'Wed', uv: Math.floor(Math.random() * 100) },
  { day: 'Thu', uv: Math.floor(Math.random() * 100) },
  { day: 'Fri', uv: Math.floor(Math.random() * 100) },
  { day: 'Sat', uv: Math.floor(Math.random() * 100) },
  { day: 'Sun', uv: Math.floor(Math.random() * 100) },
]

const PreviewLineChart = () => {
  return (
    <ChartContainer config={chartConfig}>
      <LineChart data={dailyOrders} accessibilityLayer>
        <YAxis axisLine={false} tickLine={false} width={20} />
        <XAxis dataKey="day" axisLine={false} tickLine={false} />
        <CartesianGrid vertical={false} />
        <Line
          type="linear"
          dataKey="uv"
          stroke="#171A28"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  )
}

const PreviewStackedAreaChart = () => {
  return (
    <ChartContainer config={chartConfig}>
      <AreaChart accessibilityLayer data={dailyOrders}>
        <defs>
          <linearGradient id="colorUv-1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="15%" stopColor="#171A28" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#171A28" stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis axisLine={false} tickLine={false} width={20} />
        <XAxis dataKey="day" axisLine={false} tickLine={false} />
        <CartesianGrid vertical={false} />
        <Area
          type="linear"
          dataKey="value"
          stroke="#171A28"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorUv-1)"
        />
      </AreaChart>
    </ChartContainer>
  )
}

const PreviewStackedBarChart = () => {
  return (
    <ChartContainer config={chartConfig}>
      <BarChart data={dailyOrders} accessibilityLayer>
        <YAxis axisLine={false} tickLine={false} width={20} />
        <XAxis dataKey="day" axisLine={false} tickLine={false} />
        <CartesianGrid vertical={false} />
        <Bar type="linear" dataKey="uv" stroke="#171A28" strokeWidth={2} />
      </BarChart>
    </ChartContainer>
  )
}

export { PreviewLineChart, PreviewStackedAreaChart, PreviewStackedBarChart }
