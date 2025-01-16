import { Slider } from '@/components/ui/slider'
import { GaugeType } from '@/widget-models/gauge'
import { useAnimationFrame } from 'framer-motion'
import { Triangle } from 'lucide-react'
import dynamic from 'next/dynamic'
import React, { useMemo, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'

const GaugeComponent = dynamic(() => import('react-gauge-component'), {
  ssr: false,
})

interface CircularChartProps {
  value: number
  unit: string
}

const CircularChart: React.FC<CircularChartProps> = ({ value, unit }) => {
  return (
    <GaugeComponent
      type="radial"
      arc={{
        padding: 0.005,
        colorArray: ['#00FF15', '#FF2121'],
        subArcs: [{ limit: 40 }, { limit: 60 }, { limit: 70 }],
      }}
      pointer={{ type: 'needle', animationDelay: 0 }}
      value={value}
      labels={{
        valueLabel: {
          style: {
            fontSize: 20,
            fill: 'hsl(var(--background-fill-default-chart))',
            textShadow: 'none',
          },
          formatTextValue: (value) => `${value} ${unit}`,
        },
        tickLabels: {
          defaultTickValueConfig: {
            formatTextValue: (value) => `${value} ${unit}`,
            style: {
              fill: 'hsl(var(--background-fill-default-chart))',
            },
          },
        },
      }}
    />
  )
}

interface Range {
  min: number
  max: number
  color: string
}

interface StackedBarChartProps {
  value: number
  min: number
  max: number
  ranges: Range[]
  height: number
  unit: string
}

const LinearChart: React.FC<StackedBarChartProps> = ({
  value,
  min,
  max,
  ranges,
  height,
  unit,
}) => {
  const [currentPercent, setCurrentPercent] = useState(0)

  const percent = useMemo(() => (value / max) * 100, [value, max])
  useAnimationFrame((_, delta) => {
    setCurrentPercent((prev) => {
      const nextValue = prev + delta * 0.05
      return nextValue > percent ? percent : nextValue
    })
  })

  const data = [{ value1: 20, value2: 40, value3: 60 }]

  return (
    <div className="w-full space-y-4">
      <span className="text-lg font-bold text-brand-component-text-dark">
        {value} {unit}
      </span>
      <div>
        <Slider
          classNameTrack="bg-transparent dark:bg-transparent"
          classNameThumb="bg-transparent dark:bg-transparent"
          className="mb-2 mx-1"
          classNameRange="bg-transparent dark:bg-transparent"
          disabled
          value={[currentPercent]}
          thumbIcon={
            <Triangle
              className="text-brand-component-text-dark w-4 h-4 rotate-180"
              fill="hsl(var(--background-fill-default-chart))"
            />
          }
        />
        <ResponsiveContainer height={height}>
          <BarChart layout="vertical" data={data} barGap={5}>
            <XAxis type="number" domain={[min, max]} hide />
            <YAxis type="category" hide />
            {ranges.map((range, index) => (
              <Bar
                key={index}
                dataKey={`value${index + 1}`}
                stackId="b"
                fill={range.color}
                radius={[10, 10, 10, 10]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <div className="w-full flex justify-between">
          <span className="text-sm text-brand-component-text-dark">
            {min} {unit}
          </span>
          <span className="text-sm text-brand-component-text-dark">
            {max} {unit}
          </span>
        </div>
      </div>
    </div>
  )
}

interface Props {
  type: GaugeType
}

const PreviewGauge: React.FC<Props> = ({ type }) => {
  const ranges = [
    { min: 0, max: 10, color: '#ff0000' },
    { min: 45, max: 95, color: '#ffff00' },
    { min: 80, max: 100, color: '#00ff00' },
  ]

  return type === GaugeType.Linear ? (
    <LinearChart
      ranges={ranges}
      height={20}
      value={65}
      min={0}
      max={100}
      unit="ml"
    />
  ) : (
    <CircularChart value={65} unit="ml" />
  )
}

export default PreviewGauge
