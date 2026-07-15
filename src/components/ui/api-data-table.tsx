'use client'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  useReactTable,
  OnChangeFn,
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
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ApiDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  tableHeadClass?: string
  tableCellClass?: string
  emptyLabel?: string
  showPaginate?: boolean
  pageCount: number
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  containerClassName?: string
  scrollClassName?: string
  stickyHeader?: boolean
}

export function ApiDataTable<TData, TValue>({
  columns,
  data,
  tableHeadClass,
  tableCellClass,
  emptyLabel = 'No results',
  showPaginate = true,
  pageCount,
  pagination,
  onPaginationChange,
  containerClassName,
  scrollClassName,
  stickyHeader = false,
}: ApiDataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    pageCount,
    state: {
      pagination,
    },
    onPaginationChange,
    manualPagination: true,
  })

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden border-brand-stroke-dark-soft',
        containerClassName
      )}
    >
      <div className={cn('w-full', scrollClassName)}>
        <Table>
          <TableHeader
            className={cn('bg-accent', stickyHeader && 'sticky top-0 z-[1]')}
          >
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className={tableCellClass || ''} key={cell.id}>
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
                  {emptyLabel}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPaginate && (
        <div className="flex items-center justify-between border-t p-2">
          <Button
            variant="outline"
            className="gap-2 bg-transparent text-sm font-semibold"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ArrowLeft size={20} />
            Previous
          </Button>
          <div className="text-sm font-semibold text-brand-component-text-gray">
            Page {table.getState().pagination.pageIndex + 1} of {pageCount}
          </div>
          <Button
            variant="outline"
            className="gap-2 bg-transparent text-sm font-semibold"
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
