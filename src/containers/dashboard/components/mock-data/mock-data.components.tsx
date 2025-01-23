import React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Equalizer } from '@/components/icons/equalizer'
import { cn } from '@/lib/utils'

const chartData = [
  {
    day: 'Mon',
    uv: 50,
  },
  {
    day: 'Tue',
    uv: 60,
  },
  {
    day: 'Wed',
    uv: 40,
  },
  {
    day: 'Thu',
    uv: 70,
  },
  {
    day: 'Fri',
    uv: 50,
  },
  {
    day: 'Sat',
    uv: 40,
  },
  {
    day: 'Sun',
    uv: 60,
  },
]

const polarData = [{ desktop: 215 }]

interface WidgetProp {
  children?: React.ReactNode
  className?: string
}

const WidgetContainer = ({ children, className }: WidgetProp) => (
  <div
    className={cn(
      'size-full rounded-md border border-brand-component-stroke-dark-soft bg-brand-background-fill-outermost p-2 dark:bg-brand-component-fill-gray-soft',
      className
    )}
  >
    {children}
  </div>
)

const WidgetTitle = ({ children, className }: WidgetProp) => (
  <div
    className={cn(
      'line-clamp-1 text-sm font-medium text-brand-component-text-dark',
      className
    )}
  >
    {children}
  </div>
)

const WidgetChart = ({ children }: WidgetProp) => (
  <WidgetContainer>
    {children}
    <ResponsiveContainer className={'pb-3'}>
      <AreaChart accessibilityLayer data={chartData}>
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="15%" stopColor="currentColor" stopOpacity={0.8} />
            <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis
          axisLine={false}
          tickLine={false}
          width={20}
          tick={{ fontSize: 12 }}
        />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
          tick={{ fontSize: 12 }}
        />
        <CartesianGrid vertical={false} opacity={0.3} />
        <Area
          type="linear"
          dataKey="uv"
          stroke="currentColor"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorUv)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </WidgetContainer>
)

const PolarChart = ({ children, className }: WidgetProp) => (
  <WidgetContainer>
    {children}
    <ResponsiveContainer
      className={cn('mx-auto w-full object-contain', className)}
    >
      <RadialBarChart
        data={polarData}
        endAngle={240}
        startAngle={-60}
        innerRadius={55}
        outerRadius={35}
      >
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-brand-component-text-dark text-sm font-bold"
                    >
                      215.00
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 16}
                      className="fill-brand-component-text-gray text-sm font-medium"
                    >
                      ml
                    </tspan>
                    <tspan
                      x={(viewBox.cx || 0) - 26}
                      y={(viewBox.cy || 0) + 55}
                      className="fill-brand-component-text-dark text-[10px] font-medium"
                    >
                      100
                    </tspan>
                    <tspan
                      x={(viewBox.cx || 0) + 26}
                      y={(viewBox.cy || 0) + 55}
                      className="fill-brand-component-text-dark text-[10px] font-medium"
                    >
                      300
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </PolarRadiusAxis>
        <RadialBar
          dataKey="desktop"
          stackId="a"
          cornerRadius={10}
          fill="currentColor"
          className="size-full stroke-transparent"
        />
      </RadialBarChart>
    </ResponsiveContainer>
  </WidgetContainer>
)

const WidgetSlider = () => (
  <WidgetContainer>
    <div className="flex justify-between">
      <WidgetTitle>New Slider Widget</WidgetTitle>
      <WidgetTitle>ml</WidgetTitle>
    </div>
    <Slider
      className="my-1"
      classNameRange="bg-[#171A28] dark:bg-[#4006AA]"
      classNameThumb="bg-[#171A28] dark:bg-[#4006AA]"
      defaultValue={[50]}
      max={100}
      step={1}
    />
    <div className="flex justify-between text-[8px] font-medium dark:text-brand-component-text-dark">
      <span>0</span>
      <span>100</span>
    </div>
  </WidgetContainer>
)

const WidgetText = () => {
  return (
    <WidgetContainer>
      <WidgetTitle>Note:</WidgetTitle>
      <WidgetTitle className="line-clamp-1">Turn off</WidgetTitle>
    </WidgetContainer>
  )
}

const WidgetSwitch = ({ children, className }: WidgetProp) => {
  return (
    <WidgetContainer className="flex flex-col gap-1">
      {children}
      <Switch checked className={className} />
    </WidgetContainer>
  )
}

const WidgetSensor = ({
  children,
  className,
  status,
}: {
  className?: string
  children: React.ReactNode
  status: 'on' | 'off'
}) => (
  <WidgetContainer className="flex gap-3">
    <div className="relative flex size-7 items-center justify-center rounded-full">
      <div className="absolute inset-0 rounded-full bg-brand-icon-dark opacity-20 dark:bg-brand-dark-fill-secondary" />
      <Equalizer className={cn('relative z-10 opacity-100', className)} />
    </div>
    <div>
      {children}
      <p className="text-sm capitalize text-brand-component-text-gray">
        {status}
      </p>
    </div>
  </WidgetContainer>
)

export {
  WidgetSensor,
  WidgetSwitch,
  WidgetContainer,
  WidgetText,
  WidgetSlider,
  WidgetChart,
  PolarChart,
  WidgetTitle,
}
