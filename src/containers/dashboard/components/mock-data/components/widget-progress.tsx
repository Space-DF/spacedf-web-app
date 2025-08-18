import { useMemo } from 'react'
import { WidgetContainer, WidgetTitle } from '.'
import { Progress } from '@/components/ui/progress'

interface ProgressWidgetProps {
  title: string
  value: number
  unit: string
  min: number
  max: number
  color: string
}

export const ProgressWidget = ({
  title,
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
        <WidgetTitle>{title}</WidgetTitle>
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
