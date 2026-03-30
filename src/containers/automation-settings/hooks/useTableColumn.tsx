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
import { Eye } from 'lucide-react'
import { PencilSimple, Trash } from '@/components/icons'
import { ToggleAutomationSwitch } from '../components/toggle-automation-switch'

export const useTableColumn = (
  handleDelete: (id: string) => void,
  onToggleSuccess: () => void,
  onSelect: (automation: Automation) => void,
  onEdit: (automation: Automation) => void
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
        accessorKey: 'event_rule',
        header: t('trigger_when'),
        cell: ({ row }) => {
          const rule = row.original.event_rule
          const description = rule?.description || '—'
          const conditions = rule?.definition?.conditions?.and ?? []
          return (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="max-w-[160px] truncate text-sm text-brand-component-text-dark dark:text-brand-dark-text-gray">
                    {description}
                    {conditions.length > 1 && (
                      <span className="ml-0.5 text-brand-text-gray">...</span>
                    )}
                  </div>
                </TooltipTrigger>
                {conditions.length > 1 && (
                  <TooltipContent
                    side="bottom"
                    className="rounded-lg border-none bg-brand-component-fill-dark px-3 py-2 text-xs text-white shadow-lg"
                  >
                    <div className="flex flex-col leading-5">
                      {conditions.map((condition, i) => (
                        <span key={i}>{JSON.stringify(condition)}</span>
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
        accessorKey: 'device_id',
        header: t('target_device'),
        cell: ({ row }) => (
          <span className="text-sm text-brand-component-text-dark dark:text-brand-dark-text-gray">
            {row.original.device_id}
          </span>
        ),
      },
      {
        accessorKey: 'actions',
        header: t('assigned_action'),
        cell: ({ row }) => (
          <div className="flex flex-col text-sm text-brand-component-text-dark dark:text-brand-dark-text-gray">
            {row.original.actions.map((action) => (
              <span key={action.id}>{action.name}</span>
            ))}
          </div>
        ),
      },
      {
        id: 'status',
        header: t('status'),
        cell: ({ row }) => (
          <ToggleAutomationSwitch
            automation={row.original}
            onSuccess={onToggleSuccess}
          />
        ),
      },
      {
        accessorKey: 'updated_at',
        header: t('last_updated'),
        cell: ({ row }) => (
          <span className="text-sm text-brand-text-gray">
            {row.original.updated_at
              ? new Date(row.original.updated_at).toLocaleString()
              : '—'}
          </span>
        ),
      },
      {
        id: 'actions_col',
        header: () => <div className="text-center">{t('action')}</div>,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onSelect(row.original)}
            >
              <Eye width={16} height={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(row.original)}
            >
              <PencilSimple className="size-4 " />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash width={16} height={16} />
            </Button>
          </div>
        ),
      },
    ],
    [t, handleDelete, onToggleSuccess, onSelect]
  )
  return columns
}
