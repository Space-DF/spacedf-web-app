import { Switch } from '@/components/ui/switch'
import { WidgetContainer, WidgetTitle } from '.'

interface WidgetSwitchProps {
  title: string
  className?: string
  color?: string
}

export const WidgetSwitch = ({
  title,
  className,
  color,
}: WidgetSwitchProps) => {
  return (
    <WidgetContainer className="flex flex-col gap-1">
      <WidgetTitle>{title}</WidgetTitle>
      <Switch
        checked
        className={className}
        style={{ backgroundColor: color }}
      />
    </WidgetContainer>
  )
}
