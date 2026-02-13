import React from 'react'
import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from 'recharts'

import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { WidgetContainer, WidgetTitle } from './components'

const polarData = [{ desktop: 215 }]

interface WidgetProp {
  children?: React.ReactNode
  className?: string
}

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

export { WidgetText, WidgetSlider, PolarChart }
