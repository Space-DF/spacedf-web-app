import { WidgetContainer, WidgetTitle } from '.'
import TablePreview from '../../widget-selected/components/table-widget/components/table-preview'

export const TableWidget = ({
  source,
  columns,
  widget_info,
  conditions,
}: any) => {
  return (
    <WidgetContainer>
      <WidgetTitle>{widget_info?.name}</WidgetTitle>
      <TablePreview
        source={source}
        columns={columns}
        conditionals={conditions}
      />
    </WidgetContainer>
  )
}
