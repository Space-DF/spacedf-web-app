'use client'

import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { Dashboard } from '@/types/dashboard'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Pencil, Trash } from 'lucide-react'

interface ColumnProps {
  handleDeleteSpace: (id: string) => void
  t: ReturnType<typeof useTranslations>
  handleSelectDashboard: (dashboard: Dashboard) => void
}

export const getColumns = (props: ColumnProps): ColumnDef<Dashboard>[] => {
  const { handleDeleteSpace, t, handleSelectDashboard } = props

  return [
    {
      accessorKey: 'name',
      header: t('dashboard.name' as any),
      cell: ({ row: { original } }) => {
        return <div className="flex items-center gap-2">{original.name}</div>
      },
    },
    {
      accessorKey: 'action',
      header: () => (
        <div className="text-center">{t('dashboard.action' as any)}</div>
      ),
      cell: ({ row: { original } }) => {
        const actionButtons = (
          <>
            <Button
              size="icon"
              variant="outline"
              className="size-8 shadow-none"
              disabled={original.is_deactivated}
              onClick={() => handleSelectDashboard(original)}
            >
              <Pencil size={16} />
            </Button>

            <Button
              size="icon"
              variant="outline"
              className="size-8 shadow-none"
              disabled={original.is_deactivated}
              onClick={() => handleDeleteSpace(original.id)}
            >
              <Trash size={16} />
            </Button>
          </>
        )

        if (!original.is_deactivated) {
          return (
            <div className="flex justify-center gap-1">{actionButtons}</div>
          )
        }

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex justify-center gap-1">{actionButtons}</div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[280px] text-xs">
              {t('dashboard.dashboard_deactivated_tooltip' as any)}
            </TooltipContent>
          </Tooltip>
        )
      },
    },
  ]
}
