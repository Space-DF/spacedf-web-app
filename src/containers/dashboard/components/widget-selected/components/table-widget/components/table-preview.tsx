import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Column, dataTablePayload, Device } from '@/validator'
import { useTranslations } from 'next-intl'
import { FIELD_DISPLAY_NAME } from '../table.const'
import { truncateText } from '@/utils'
import { OPERATORS } from '../table.const'

interface TablePreviewProps {
  source: dataTablePayload['source']['entities']
  columns: dataTablePayload['columns']
  conditionals?: dataTablePayload['conditionals']
}

const TablePreview: React.FC<TablePreviewProps> = ({
  source,
  columns,
  conditionals = [],
}) => {
  const t = useTranslations('dashboard')
  const isEmptyData = !source?.length || !columns?.some((col) => col?.field)

  if (isEmptyData) {
    return (
      <p className="py-2 text-center text-sm font-semibold text-brand-component-text-gray">
        {t('no_data')}
      </p>
    )
  }

  const applyConditionalFormat = (value: any, column: Column) => {
    const condition = conditionals.find((cond) => cond.field === column.field)

    if (!condition) return { bgColor: '', textColor: '', limit: true }

    let meetsCondition = false
    switch (condition.operator) {
      case OPERATORS.Equals:
        meetsCondition = String(value) == condition.value
        break
      case OPERATORS.NotEquals:
        meetsCondition = String(value) != condition.value
        break
      case OPERATORS.GreaterThan:
        meetsCondition = Number(value) > Number(condition.value)
        break
      case OPERATORS.LessThan:
        meetsCondition = Number(value) < Number(condition.value)
        break
      default:
        break
    }

    if (!meetsCondition)
      return { bgColor: '', textColor: '', limit: condition.limit }

    return {
      bgColor: condition.bg_color ? `#${condition.bg_color}` : '',
      textColor: condition.text_color ? `#${condition.text_color}` : '',
      limit: condition.limit,
    }
  }

  return (
    <Table className="rounded-b-md bg-brand-component-fill-light-fixed text-sm dark:bg-brand-heading">
      <TableHeader className="bg-brand-component-fill-gray-soft">
        <TableRow>
          {columns.map((column, index) => (
            <TableHead className="h-full min-h-6 px-2 py-1" key={index}>
              {truncateText(
                FIELD_DISPLAY_NAME[column.column_name] || column.column_name
              )}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {source.map((device: Device, rowIndex: number) => {
          let rowStyles = { bgColor: '', textColor: '' }

          columns.forEach((column) => {
            const field = column.field
            const value = (device as Device)[field] ?? '____'
            const { bgColor, textColor, limit } = applyConditionalFormat(
              value,
              column
            )
            if (!limit && bgColor) {
              rowStyles = {
                bgColor: bgColor || rowStyles.bgColor,
                textColor: textColor || rowStyles.textColor,
              }
            }
          })

          return (
            <TableRow
              key={rowIndex}
              style={{
                backgroundColor: rowStyles.bgColor,
                color: rowStyles.textColor,
              }}
            >
              {columns.map((column, colIndex) => {
                const field = column.field
                const value = (device as any)[field] ?? '____'

                const displayValue =
                  typeof value === 'boolean' ? (value ? 'On' : 'Off') : value

                const { bgColor, textColor, limit } = applyConditionalFormat(
                  value,
                  column
                )

                return (
                  <TableCell
                    className="p-2"
                    style={{
                      color: limit ? textColor : '',
                      backgroundColor: limit ? bgColor : '',
                    }}
                    key={colIndex}
                  >
                    {displayValue}
                  </TableCell>
                )
              })}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export default TablePreview
