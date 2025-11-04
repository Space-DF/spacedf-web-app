import { Switch } from '@/components/ui/switch'
import { WidgetContainer, WidgetTitle } from '.'
import { WidgetInfo } from '@/widget-models/widget'

interface WidgetSwitchProps {
  widget_info: WidgetInfo
  className?: string
  color?: string
  checked?: boolean
}

export const WidgetSwitch = ({
  widget_info,
  className,
  color,
  checked = true,
}: WidgetSwitchProps) => {
  return (
    <WidgetContainer className="flex flex-col gap-1">
      <WidgetTitle>{widget_info.name}</WidgetTitle>
      <Switch
        defaultChecked={checked}
        className={className}
        style={{ backgroundColor: color }}
      />
    </WidgetContainer>
  )
}
