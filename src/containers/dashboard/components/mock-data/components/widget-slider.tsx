import { Slider } from '@/components/ui/slider'
import { WidgetContainer, WidgetTitle } from '.'
import { WidgetInfo } from '@/widget-models/widget'
import { SliderSource } from '@/validator'
import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'

interface WidgetSliderProps {
  widget_info: WidgetInfo
  source: SliderSource
  data: {
    value: number
    unit_of_measurement: string
  }
}

function smoothValue(from: number, to: number, cb: (v: number) => void) {
  let start: number | null = null

  function animate(ts: number) {
    if (!start) start = ts
    const progress = Math.min((ts - start) / 200, 1)
    const value = from + (to - from) * progress
    cb(value)
    if (progress < 1) requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
}

const WidgetSlider = ({ widget_info, source, data }: WidgetSliderProps) => {
  const { max, min, step, unit } = source
  const { name } = widget_info
  const { value, unit_of_measurement } = data || {}
  const [sliderValue, setSliderValue] = useState([value])
  useEffect(() => {
    smoothValue(sliderValue[0], value, (v) => setSliderValue([v]))
  }, [value])
  return (
    <WidgetContainer className="flex flex-col gap-1">
      <WidgetTitle className="flex justify-between">
        <p className="truncate font-semibold text-brand-component-text-dark">
          {name}
        </p>
        <p className="truncate font-semibold text-brand-component-text-dark">
          {unit || unit_of_measurement}
        </p>
      </WidgetTitle>
      <Slider
        disabled
        value={sliderValue}
        max={max}
        min={min}
        step={step}
        thumbChildren={
          <Badge className="scale-0 group-hover:scale-100 transition-transform absolute left-1/2 -translate-x-1/2 -translate-y-1/2 -top-4">
            {value}
          </Badge>
        }
      />
      <div className="flex justify-between w-full text-xs">
        <p>{min}</p>
        <p>{max}</p>
      </div>
    </WidgetContainer>
  )
}

export default WidgetSlider
