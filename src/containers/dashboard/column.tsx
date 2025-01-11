'use client'

import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { Dashboard } from '.'
import { Button } from '@/components/ui/button'
import { Pencil, Trash } from 'lucide-react'

interface ColumnProps {
  handleDeleteSpace: (id: number) => void
  t: ReturnType<typeof useTranslations>
}

export const getColumns = (props: ColumnProps): ColumnDef<Dashboard>[] => {
  const { handleDeleteSpace, t } = props

  return [
    {
      accessorKey: 'name',
      header: t('dashboard.name' as any),
      cell: ({ row: { original } }) => {
        return <div className="flex items-center gap-2">{original.label}</div>
      },
    },
    {
      accessorKey: 'action',
      header: () => (
        <div className="text-center">{t('dashboard.action' as any)}</div>
      ),
      cell: ({ row: { original } }) => (
        <div className="flex justify-center gap-1">
          <Button
            size="icon"
            variant="outline"
            className="size-8 border-brand-stroke-dark-soft text-brand-text-gray shadow-none"
          >
            <Pencil size={16} />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="size-8 border-brand-stroke-dark-soft text-brand-text-gray shadow-none"
            onClick={() => handleDeleteSpace(original.id)}
          >
            <Trash size={16} />
          </Button>
        </div>
      ),
    },
  ]
}
