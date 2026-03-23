import { Automation } from '@/types/automation'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Eye, Pen } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Trash } from '@/components/icons'
export const useTableColumn = (
  handleToggleStatus: (id: string) => void,
  handleDelete: (id: string) => void
) => {
  const t = useTranslations('automation')
  const columns = useMemo<ColumnDef<Automation>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('automation_name'),
        cell: ({ row }) => (
          <span className="text-sm font-medium text-brand-component-text-dark dark:text-white">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: 'triggers',
        header: t('trigger_when'),
        cell: ({ row }) => {
          const triggers = row.original.triggers
          return (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="max-w-[160px] truncate text-sm text-brand-component-text-dark dark:text-brand-dark-text-gray">
                    {triggers.join(' ')}
                    {triggers.length > 1 && (
                      <span className="ml-0.5 text-brand-text-gray">...</span>
                    )}
                  </div>
                </TooltipTrigger>
                {triggers.length > 1 && (
                  <TooltipContent
                    side="bottom"
                    className=" rounded-lg border-none bg-brand-component-fill-dark px-3 py-2 text-xs text-white shadow-lg"
                  >
                    <div className="flex flex-col leading-5">
                      {triggers.map((trigger, i) => (
                        <span key={i}>{trigger}</span>
                      ))}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )
        },
      },
      {
        accessorKey: 'targetDevice',
        header: t('target_device'),
        cell: ({ row }) => (
          <span className="text-sm text-brand-component-text-dark dark:text-brand-dark-text-gray">
            {row.original.targetDevice}
          </span>
        ),
      },
      {
        accessorKey: 'assignedAction',
        header: t('assigned_action'),
        cell: ({ row }) => (
          <div className="flex flex-col text-sm text-brand-component-text-dark dark:text-brand-dark-text-gray">
            {row.original.assignedAction.map((action, i) => (
              <span key={i}>{action}</span>
            ))}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t('status'),
        cell: ({ row }) => (
          <Switch
            checked={row.original.status === 'active'}
            onCheckedChange={() => handleToggleStatus(row.original.id)}
          />
        ),
      },
      {
        accessorKey: 'lastTriggered',
        header: t('last_triggered'),
        cell: ({ row }) => (
          <span className="text-sm text-brand-text-gray">
            {row.original.lastTriggered}
          </span>
        ),
      },
      {
        accessorKey: 'lastUpdated',
        header: t('last_updated'),
        cell: ({ row }) => (
          <span className="text-sm text-brand-text-gray">
            {row.original.lastUpdated}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <div className="text-center">{t('action')}</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            <Button variant={'outline'} size={'icon'}>
              <Eye width={16} height={16} />
            </Button>
            <Button variant={'outline'} size={'icon'}>
              <Pen width={13} height={13} />
            </Button>
            <Button
              variant={'outline'}
              size={'icon'}
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash width={16} height={16} />
            </Button>
          </div>
        ),
      },
    ],
    [t, handleToggleStatus, handleDelete]
  )
  return columns
}
