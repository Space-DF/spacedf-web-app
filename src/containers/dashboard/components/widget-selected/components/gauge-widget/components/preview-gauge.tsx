import { Slider } from '@/components/ui/slider'
import { brandColors } from '@/configs'
import { GaugeValue } from '@/validator'
import { GaugeType } from '@/widget-models/gauge'
import { useAnimationFrame } from 'framer-motion'
import { Triangle } from 'lucide-react'
import dynamic from 'next/dynamic'
import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'

const GaugeComponent = dynamic(() => import('react-gauge-component'), {
  ssr: false,
})

const getDecimal = (value: number, decimal: number) => {
  if (decimal < 0) return value
  if (decimal > 10) return value.toFixed(10)
  return value.toFixed(decimal)
}

interface Range {
  color: string
}

interface CircularChartProps {
  value: number
  unit?: string
  decimal?: number
  min?: number
  max?: number
  values: GaugeValue[]
  ranges: Range[]
  showValue?: boolean
}

interface LinearChartProps extends CircularChartProps {
  height: number
}

const CircularChart: React.FC<CircularChartProps> = ({
  value,
  unit,
  decimal = 0,
  min = 0,
  max = 100,
  values,
  ranges,
  showValue,
}) => {
  const [isAnimate, setIsAnimate] = useState(true)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (isAnimate) {
      setIsAnimate(false)
    }
  }, [values])

  const chartData = useMemo(() => {
    if (!values.length) return [{ length: 1 }]

    const sortedValues = [...values].sort((a, b) => a.value - b.value)

    if (sortedValues.length === 1 && sortedValues[0].value === min) {
      return [{ length: 1 }]
    }

    const result =
      sortedValues[0].value !== min
        ? [{ length: (sortedValues[0].value - min) / max }]
        : []

    sortedValues.forEach((item, index) => {
      const nextValue = sortedValues[index + 1]?.value ?? max
      result.push({ length: (nextValue - item.value) / max })
    })

    return result
  }, [values, min, max])

  const rangesColor = useMemo(() => {
    if (!values?.length) return ranges.map((range) => range.color)

    const sortedValues = [...values].sort((a, b) => a.value - b.value)

    return sortedValues[0].value > min
      ? [
          brandColors['component-fill-default-chart'],
          ...ranges.map((range) => range.color),
        ]
      : ranges.map((range) => range.color)
  }, [ranges, values, min])

  const gaugeKey = useMemo(
    () =>
      `${JSON.stringify(rangesColor)}-${JSON.stringify(chartData)}-${decimal}-${showValue}-${unit}`,
    [rangesColor, chartData]
  )
  return (
    <div className="relative flex w-full h-full items-center justify-center">
      <GaugeComponent
        key={gaugeKey}
        type="radial"
        arc={{
          padding: 0.005,
          colorArray: rangesColor,
          subArcs: chartData,
        }}
        className="size-full"
        minValue={min}
        maxValue={max}
        pointer={{ type: 'needle', animationDelay: 0, animate: isAnimate }}
        value={value}
        labels={{
          valueLabel: {
            hide: !showValue,
            formatTextValue(value) {
              return `${value.toFixed(decimal)} ${unit?.slice(0, 10) || ''}`
            },
            style: {
              textShadow: 'none',
              fill: brandColors['component-fill-default-chart'],
            },
          },
          tickLabels: {
            defaultTickValueConfig: {
              hide: !showValue,
              formatTextValue(value) {
                return value.toFixed(0)
              },
            },
          },
        }}
      />
    </div>
  )
}

const LinearChart: React.FC<LinearChartProps> = ({
  value,
  min = 0,
  max = 100,
  ranges,
  height = 20,
  unit,
  decimal = 0,
  values,
  showValue,
}) => {
  const [currentPercent, setCurrentPercent] = useState(0)

  const percent = useMemo(() => (value / max) * 100, [value, max])

  useAnimationFrame((_, delta) => {
    setCurrentPercent((prev) => {
      const nextValue = prev + delta * 0.1
      return nextValue > percent ? percent : nextValue
    })
  })

  const chartData = useMemo(() => {
    if (!values?.length) return { value: max }

    const sortedValues = [...values].sort((a, b) => a.value - b.value)

    if (sortedValues.length === 1 && sortedValues[0].value === 0) {
      return { value0: max }
    }

    const firstValue = sortedValues[0].value - min

    return sortedValues.reduce(
      (acc, item, index) => {
        const nextValue = sortedValues[index + 1]?.value ?? max
        return {
          ...acc,
          [`value${index}`]: nextValue - item.value,
        }
      },
      { firstValue }
    )
  }, [values, min, max])

  return (
    <div className="size-full pt-2  space-y-4">
      <div className="h-4">
        {showValue && (
          <span className="text-lg font-bold text-brand-component-text-dark line-clamp-1">
            {getDecimal(value, decimal)} {unit?.slice(0, 10)}
          </span>
        )}
      </div>

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
              fill={brandColors['component-fill-default-chart']}
            />
          }
        />
        <ResponsiveContainer height={height}>
          <BarChart layout="vertical" data={[chartData]} barGap={5}>
            <XAxis type="number" domain={[min, max]} hide />
            <YAxis type="category" hide />
            <Bar
              dataKey="value"
              stackId="b"
              fill={brandColors['component-fill-default-chart']}
              radius={[10, 10, 10, 10]}
            />
            <Bar
              dataKey="firstValue"
              stackId="b"
              fill={brandColors['component-fill-default-chart']}
              radius={[10, 10, 10, 10]}
            />
            {ranges.map((range, index) => (
              <Bar
                key={index}
                dataKey={`value${index}`}
                stackId="b"
                fill={range.color}
                radius={[10, 10, 10, 10]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
        <div className="w-full flex justify-between">
          <span className="text-sm text-brand-component-text-dark line-clamp-1">
            {min}
          </span>
          <span className="text-sm text-brand-component-text-dark line-clamp-1">
            {max}
          </span>
        </div>
      </div>
    </div>
  )
}

interface Props {
  type: GaugeType
  decimal: number
  unit?: string
  min: number
  max: number
  values: GaugeValue[]
  showValue?: boolean
}

const formatRangesValue = (min: number, values: GaugeValue[]) => {
  const copyValues = [...values]
  copyValues.sort((a, b) => a.value - b.value)

  if (!copyValues.length) {
    return [{ color: brandColors['component-fill-default-chart'] }]
  }

  if (copyValues.length === 1 && copyValues[0].value === min) {
    const firstValue = copyValues[0]
    const color =
      firstValue.color && firstValue.color !== 'default'
        ? `#${firstValue.color}`
        : brandColors['component-fill-default-chart']
    return [{ color }]
  }

  const ranges: Range[] = []

  copyValues.forEach((item) => {
    ranges.push({
      color:
        item.color && item.color !== 'default'
          ? `#${item.color}`
          : brandColors['component-fill-default-chart'],
    })
  })
  return ranges
}

const PreviewGauge: React.FC<Props> = ({
  type,
  decimal,
  unit,
  min,
  max,
  values,
  showValue,
}) => {
  const ranges = formatRangesValue(min, values)
  return type === GaugeType.Linear ? (
    <LinearChart
      ranges={ranges}
      height={20}
      value={65}
      min={min}
      max={max}
      unit={unit}
      decimal={decimal}
      values={values}
      showValue={showValue}
    />
  ) : (
    <CircularChart
      value={65}
      unit={unit}
      decimal={decimal}
      min={min}
      max={max}
      values={values}
      ranges={ranges}
      showValue={showValue}
    />
  )
}

export default memo(PreviewGauge)
