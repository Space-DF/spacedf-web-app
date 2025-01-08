'use client'

import React, { useState } from 'react'
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
import { cn } from '@/lib/utils'
import { Equalizer } from '@/components/icons/equalizer'
import { Responsive, WidthProvider, Layout, Layouts } from 'react-grid-layout'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { useMounted } from '@/hooks'
import GridLayout from './components/grid-layout'

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

const ResponsiveReactGridLayout = WidthProvider(Responsive)

const screenLayout: Layout[] = [
  { i: '1', x: 0, y: 0, w: 3, h: 1 },
  { i: '2', x: 3, y: 0, w: 1, h: 1 },
  { i: '3', x: 4, y: 0, w: 1, h: 1 },
  { i: '4', x: 0, y: 1, w: 3, h: 1 },
  { i: '5', x: 3, y: 1, w: 1, h: 1 },
  { i: '6', x: 4, y: 1, w: 1, h: 1 },
  { i: '7', x: 0, y: 2, w: 5, h: 1, minW: 2 },
  { i: '8', x: 0, y: 3, w: 4, h: 3, minH: 2, minW: 3 },
  { i: '9', x: 4, y: 3, w: 1, h: 1 },
  { i: '10', x: 4, y: 4, w: 1, h: 1 },
  { i: '11', x: 4, y: 5, w: 1, h: 1 },
  { i: '12', x: 0, y: 6, w: 2, h: 2, minW: 2, minH: 2 },
  { i: '13', x: 2, y: 7, w: 2, h: 3, minW: 2, minH: 3 },
  { i: '14', x: 0, y: 9, w: 5, h: 4, minW: 2, minH: 3 },
]

const columns = 5

interface Props {
  isEdit?: boolean
}

export const MockData: React.FC<Props> = ({ isEdit }) => {
  const { mounted } = useMounted()
  const [layouts, setLayouts] = useState<Layouts>({
    lg: screenLayout,
    md: screenLayout,
    sm: screenLayout,
    xxs: screenLayout,
  })

  const handleLayoutChange = (_: Layout[], layouts: Layouts) => {
    setLayouts({ ...layouts })
  }

  return (
    <div
      className={cn(
        'mt-1 h-dvh overflow-y-scroll scroll-smooth transition-all [&::-webkit-scrollbar-thumb]:bg-transparent [&::-webkit-scrollbar-thumb]:hover:bg-[#282C3F]',
      )}
    >
      <div
        className={cn(isEdit ? 'pb-44' : 'pb-32', 'relative')}
        id="dashboard-container"
      >
        {isEdit && <GridLayout margin={5} rowHeight={60} />}
        <ResponsiveReactGridLayout
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 5, md: 5, sm: 5, xs: 5, xxs: 5 }}
          rowHeight={60}
          margin={[5, 5]}
          onLayoutChange={handleLayoutChange}
          measureBeforeMount={false}
          useCSSTransforms={mounted}
          compactType="vertical"
          preventCollision={false}
          isDraggable={isEdit}
          isResizable={isEdit}
        >
          <div key="1">
            <WidgetSensor status="off">
              <WidgetTitle>Text</WidgetTitle>{' '}
            </WidgetSensor>
          </div>
          <div key="2">
            <WidgetText />
          </div>
          <div key="3">
            <WidgetSwitch>
              <WidgetTitle>Text</WidgetTitle>
            </WidgetSwitch>
          </div>
          <div key="4">
            <WidgetSensor status="on">
              <WidgetTitle>Text</WidgetTitle>{' '}
            </WidgetSensor>
          </div>
          <div key="5">
            <WidgetText />
          </div>
          <div key="6">
            <WidgetText />
          </div>
          <div key="7">
            <WidgetSlider />
          </div>
          <div key="8">
            <WidgetChart className="h-fit dark:stroke-[#4006AA] dark:text-[#4006AA]">
              <WidgetTitle className="mb-2">New Chart Widget</WidgetTitle>
            </WidgetChart>
          </div>
          <div key={'9'}>
            <WidgetSwitch>
              <WidgetTitle>Water Sensor</WidgetTitle>
            </WidgetSwitch>
          </div>
          <div key={'10'}>
            <WidgetSwitch>
              <WidgetTitle>Water Sensor</WidgetTitle>
            </WidgetSwitch>
          </div>
          <div key={'11'}>
            <WidgetSwitch>
              <WidgetTitle>Water Sensor</WidgetTitle>
            </WidgetSwitch>
          </div>
          <div key={'12'}>
            <WidgetChart className="dark:text-[#4006AA]">
              <WidgetTitle>Water Flood Level</WidgetTitle>
            </WidgetChart>
          </div>
          <div key={'13'} className="h-fit">
            <PolarChart className="aspect-square dark:text-[#4006AA]">
              <WidgetTitle>New Gauge Widget</WidgetTitle>
            </PolarChart>
          </div>
          <div key={'14'}>
            <PolarChart className="aspect-square dark:text-[#4006AA]">
              <WidgetTitle>New Gauge Widget</WidgetTitle>
            </PolarChart>
          </div>
        </ResponsiveReactGridLayout>
      </div>
    </div>
  )
}

interface WidgetProp {
  children?: React.ReactNode
  className?: string
}

const WidgetContainer = ({ children, className }: WidgetProp) => (
  <div
    className={cn(
      'h-full rounded-md border border-brand-component-stroke-dark-soft bg-brand-background-fill-outermost p-2 dark:bg-brand-component-fill-gray-soft',
      className,
    )}
  >
    {children}
  </div>
)

const WidgetTitle = ({ children, className }: WidgetProp) => (
  <div
    className={cn(
      'line-clamp-1 text-sm font-medium text-brand-component-text-dark',
      className,
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
                      className="fill-brand-component-text-gray text-xs font-medium"
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
