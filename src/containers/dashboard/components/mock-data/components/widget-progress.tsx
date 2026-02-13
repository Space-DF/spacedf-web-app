import { useMemo } from 'react'
import { WidgetContainer, WidgetTitle } from '.'
import { Progress } from '@/components/ui/progress'
import { WidgetInfo } from '@/widget-models/widget'

interface ProgressWidgetProps {
  widget_info: WidgetInfo
  value: number
  unit: string
  min: number
  max: number
  color: string
}

export const ProgressWidget = ({
  widget_info,
  value,
  unit,
  min,
  max,
  color,
}: ProgressWidgetProps) => {
  const progressValue = useMemo(() => {
    return ((value - min) / (max - min)) * 100
  }, [value, min, max])
  return (
    <WidgetContainer>
      <div className="flex justify-between items-center">
        <WidgetTitle>{widget_info.name}</WidgetTitle>
        <p className="font-semibold">{unit}</p>
      </div>
      <Progress
        value={progressValue}
        className="h-1"
        indicatorStyle={{ backgroundColor: color }}
      />
      <div className="flex justify-between font-medium text-[8px]">
        <p>{min}</p>
        <p>{max}</p>
      </div>
    </WidgetContainer>
  )
}
