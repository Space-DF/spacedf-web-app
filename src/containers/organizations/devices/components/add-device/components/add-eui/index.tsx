import React, { memo, useMemo } from 'react'
import Info from '@/components/icons/info'
import { Button } from '@/components/ui/button'
import CloudArrowUp from '@/components/icons/cloud-arrow-up'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { Plus } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { EUIDevice } from '../../validator'
import { Form } from '@/components/ui/form'
import { getEUIColumns } from './utils'
import { v4 as uuidv4 } from 'uuid'

const AddEUI = () => {
  const t = useTranslations('organization')
  const form = useFormContext<EUIDevice>()
  const { watch, control } = form
  const { append, remove } = useFieldArray({
    name: 'eui',
    control,
  })
  const columns = useMemo(
    () => getEUIColumns({ t, remove, control }),
    [t, remove, control]
  )

  const handleAddDevice = () => {
    append({
      devEUI: '',
      joinEUI: '',
      name: '',
      country: '',
      status: 'active',
      id: uuidv4(),
    })
  }

  const data = watch('eui')

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-5">
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <Info className="size-5" />
          <p className="text-brand-component-text-gray text-xs font-normal">
            {t('import_csv')}{' '}
            <button className="text-brand-component-text-dark cursor-pointer">
              {t('csv_template')}
            </button>{' '}
            {t('get_started')}
          </p>
        </div>
        <Button>
          {t('import_CSV_button')} <CloudArrowUp />
        </Button>
      </div>
      <Form {...form}>
        <Table className="border border-brand-component-stroke-dark-soft rounded-lg">
          <TableHeader className="bg-brand-fill-dark-soft">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ minWidth: header.column.getSize() }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                      className="align-top"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t('empty')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell
                className="bg-brand-component-fill-light"
                colSpan={columns.length}
              >
                <Button
                  variant={'outline'}
                  className="text-brand-component-text-gray"
                  onClick={handleAddDevice}
                >
                  <Plus size={15} /> {t('add')}
                </Button>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Form>
    </div>
  )
}

export default memo(AddEUI)
