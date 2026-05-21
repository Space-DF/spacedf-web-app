import { WidgetContainer, WidgetTitle } from '.'
import TablePreview from '../../widget-selected/components/table-widget/components/table-preview'

export const TableWidget = ({
  source,
  columns,
  widget_info,
  conditionals,
  isEdit,
  onDelete,
  onEdit,
}: any) => {
  return (
    <WidgetContainer isEdit={isEdit} onDelete={onDelete} onEdit={onEdit}>
      <WidgetTitle>{widget_info?.name}</WidgetTitle>
      <TablePreview
        source={source.entities}
        columns={columns}
        conditionals={conditionals}
      />
    </WidgetContainer>
  )
}
