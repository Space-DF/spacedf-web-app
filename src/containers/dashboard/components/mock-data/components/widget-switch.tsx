import { Switch } from '@/components/ui/switch'
import { WidgetContainer, WidgetTitle } from '.'
import { WidgetInfo } from '@/widget-models/widget'

interface WidgetSwitchProps {
  widget_info: WidgetInfo
  className?: string
  color?: string
  checked?: boolean
  isEdit?: boolean
  onDelete?: () => void
}

export const WidgetSwitch = ({
  widget_info,
  className,
  color,
  checked = true,
  isEdit,
  onDelete,
}: WidgetSwitchProps) => {
  return (
    <WidgetContainer
      className="flex flex-col gap-1"
      isEdit={isEdit}
      onDelete={onDelete}
    >
      <WidgetTitle>{widget_info.name}</WidgetTitle>
      <Switch
        checked={checked}
        className={className}
        style={{ backgroundColor: color }}
        disabled={isEdit}
      />
    </WidgetContainer>
  )
}
