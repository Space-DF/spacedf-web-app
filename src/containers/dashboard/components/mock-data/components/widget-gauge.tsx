import { WidgetContainer, WidgetTitle } from '.'
import PreviewGauge from '../../widget-selected/components/gauge-widget/components/preview-gauge'

export const GaugeWidget = ({ widget }: any) => {
  const { source, widget_info } = widget

  return (
    <WidgetContainer className="flex flex-col">
      <WidgetTitle>{widget_info?.name}</WidgetTitle>
      <div className="flex-1 min-h-0">
        <PreviewGauge
          type={source?.type}
          decimal={+source?.decimal}
          min={source?.min}
          max={source?.max}
          values={source?.values}
          showValue={widget_info?.appearance?.show_value}
        />
      </div>
    </WidgetContainer>
  )
}
