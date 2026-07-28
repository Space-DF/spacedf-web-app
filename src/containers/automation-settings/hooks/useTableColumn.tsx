import { Automation } from '@/types/automation'
import { ColumnDef } from '@tanstack/react-table'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { PencilSimple, Trash } from '@/components/icons'
import { ToggleAutomationSwitch } from '../components/toggle-automation-switch'

export const useTableColumn = (
  handleDelete: (id: string) => void,
  onToggleSuccess: () => void,
  onSelect: (automation: Automation) => void,
  onEdit: (automation: Automation) => void,
  disabled = false
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
        accessorKey: 'device_id',
        header: t('target_device'),
        cell: ({ row }) => (
          <span className="text-sm text-brand-component-text-dark dark:text-brand-dark-text-gray">
            {row.original.device_id}
          </span>
        ),
      },
      {
        id: 'status',
        header: t('status'),
        cell: ({ row }) => (
          <ToggleAutomationSwitch
            automation={row.original}
            onSuccess={onToggleSuccess}
            disabled={disabled}
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
              disabled={disabled}
              onClick={() => onSelect(row.original)}
            >
              <Eye width={16} height={16} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={disabled}
              onClick={() => onEdit(row.original)}
            >
              <PencilSimple className="size-4 " />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={disabled}
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash width={16} height={16} />
            </Button>
          </div>
        ),
      },
    ],
    [t, handleDelete, onToggleSuccess, onSelect, onEdit, disabled]
  )
  return columns
}
