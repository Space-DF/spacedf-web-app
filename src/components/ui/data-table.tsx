'use client'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  Row,
  useReactTable,
} from '@tanstack/react-table'
import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  getRowId?: (row: TData) => string
  tableHeadClass?: string
  tableCellClass?: string
  emptyLabel?: string
  showPaginate?: boolean
  isLoading?: boolean
}

interface DataTableBodyProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  rowsData: Row<TData>[]
  tableCellClass?: string
  emptyLabel?: string
  isLoading?: boolean
  pagination: PaginationState
  isEmpty?: boolean
}

const DataTableBody = <TData, TValue>({
  columns,
  rowsData,
  tableCellClass,
  emptyLabel = 'No results',
  isLoading = false,
  pagination,
  isEmpty = false,
}: DataTableBodyProps<TData, TValue>) => {
  if (isLoading) {
    return Array.from({ length: pagination.pageSize }).map((_, rowIndex) => (
      <TableRow key={`skeleton-row-${rowIndex}`}>
        {columns.map((_, colIndex) => (
          <TableCell
            className={tableCellClass || ''}
            key={`skeleton-cell-${rowIndex}-${colIndex}`}
          >
            <Skeleton className="h-5 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ))
  }
  return isEmpty ? (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-24 text-center">
        {emptyLabel}
      </TableCell>
    </TableRow>
  ) : (
    rowsData.map((row) => (
      <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
        {row.getVisibleCells().map((cell) => (
          <TableCell className={tableCellClass || ''} key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    ))
  )
}

export function DataTable<TData, TValue>({
  columns,
  data,
  tableHeadClass,
  tableCellClass,
  emptyLabel = 'No results',
  showPaginate = true,
  isLoading = false,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 5,
  })

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetPageIndex: false,
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
    getRowId,
  })

  const rowsData = table.getRowModel().rows

  return (
    <div className="overflow-hidden rounded-lg border border-brand-stroke-dark-soft">
      <Table>
        <TableHeader className="bg-brand-fill-dark-soft">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead className={tableHeadClass || ''} key={header.id}>
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
          <DataTableBody
            columns={columns}
            rowsData={rowsData}
            tableCellClass={tableCellClass}
            emptyLabel={emptyLabel}
            isLoading={isLoading}
            pagination={pagination}
            isEmpty={rowsData.length === 0}
          />
        </TableBody>
      </Table>
      {showPaginate && (
        <div className="flex items-center justify-between border-t p-2">
          <Button
            variant="outline"
            className="gap-2 border-brand-component-stroke-dark-soft bg-transparent text-sm font-semibold text-brand-component-text-dark"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeft size={20} />
            Previous
          </Button>
          <div className="text-sm font-semibold text-brand-component-text-gray">
            Page {table.getState().pagination.pageIndex + 1}/
            {Math.max(table.getPageCount(), 1)}
          </div>
          <Button
            variant="outline"
            className="gap-2 border-brand-component-stroke-dark-soft bg-transparent text-sm font-semibold text-brand-component-text-dark"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ArrowRight size={20} />
          </Button>
        </div>
      )}
    </div>
  )
}
