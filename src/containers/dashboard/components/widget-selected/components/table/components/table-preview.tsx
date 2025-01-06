import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { dataTablePayload } from '@/validator'
import { useTranslations } from 'next-intl'
import { FIELD_DISPLAY_NAME } from '../table.const'

interface TablePreviewProps {
  source: dataTablePayload['source']['devices']
  columns: dataTablePayload['columns']
  conditional?: string | null
}

const TablePreview: React.FC<TablePreviewProps> = ({
  source,
  columns,
  conditional = '',
}) => {
  const t = useTranslations('dashboard')
  const isEmptyData = !source.length || !columns.some((col) => col.field)

  if (isEmptyData) {
    return (
      <div className="text-center text-sm text-brand-component-text-gray">
        {t('no_data')}
      </div>
    )
  }

  const applyConditionalColor = (value: string) => {
    if (conditional) {
      try {
        const conditionResult = new Function('value', `return ${conditional};`)(
          parseFloat(value),
        )
        if (conditionResult) {
          return 'bg-red-500'
        }
      } catch (e) {
        console.error('Invalid conditional string:', e)
      }
    }
    return ''
  }

  return (
    <Table className="rounded-b-md bg-brand-component-fill-light-fixed text-xs dark:bg-brand-heading">
      <TableHeader className="bg-brand-component-fill-gray-soft">
        <TableRow>
          {columns.map((column, index) => (
            <TableHead className="h-full min-h-6 px-2 py-1" key={index}>
              {FIELD_DISPLAY_NAME[column.column_name] ||
                column.column_name ||
                '------'}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {source.map((device: any, rowIndex: any) => (
          <TableRow key={rowIndex}>
            {columns.map((column, colIndex) => {
              const field = column.field
              const value = (device as any)[field] || '____'

              return (
                <TableCell
                  className={`p-2 ${applyConditionalColor(value)}`}
                  key={colIndex}
                >
                  {value}
                </TableCell>
              )
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default TablePreview
