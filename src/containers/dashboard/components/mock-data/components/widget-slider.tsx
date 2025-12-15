import { Slider } from '@/components/ui/slider'
import { WidgetContainer, WidgetTitle } from '.'
import { WidgetInfo } from '@/widget-models/widget'
import { SliderSource } from '@/validator'
import { Badge } from '@/components/ui/badge'

interface WidgetSliderProps {
  widget_info: WidgetInfo
  source: SliderSource
  data: {
    value: number
    unit_of_measurement: string
  }
}

const WidgetSlider = ({ widget_info, source, data }: WidgetSliderProps) => {
  const { max, min, step, unit } = source
  const { name } = widget_info
  const { value, unit_of_measurement } = data || {}

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
        defaultValue={[value]}
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
