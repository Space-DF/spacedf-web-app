import React from 'react'
import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from 'recharts'

import { cn } from '@/lib/utils'
import { WidgetContainer } from './components'

const polarData = [{ desktop: 215 }]

interface WidgetProp {
  children?: React.ReactNode
  className?: string
}

export const PolarChart = ({ children, className }: WidgetProp) => (
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
