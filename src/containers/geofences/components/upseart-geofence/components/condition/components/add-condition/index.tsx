import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EqualNot, PlusIcon, Clipboard } from 'lucide-react'
import { And, Calendar, Graph, NumberIcon } from '@/components/icons'
import { useTranslations } from 'next-intl'
import { useGeofenceStore } from '@/stores/geofence-store'

const CONDITION_OPTIONS = [
  { key: 'distance_threshold', icon: NumberIcon },
  { key: 'time', icon: Calendar },
  { key: 'and', icon: And },
  { key: 'not', icon: EqualNot },
  { key: 'or', icon: Graph },
] as const

interface Props {
  onSelect: (key: string) => void
}

export const AddCondition = ({ onSelect }: Props) => {
  const t = useTranslations('common')

  const currentCondition = useGeofenceStore((state) => state.currentCondition)
  const conditionOptions = currentCondition
    ? [...CONDITION_OPTIONS, { key: 'paste', icon: Clipboard }]
    : CONDITION_OPTIONS

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" className="w-fit gap-2">
          {t('add_condition')}
          <PlusIcon size={20} className="text-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[220px] rounded-xl border-0 bg-white p-1.5 shadow-lg dark:bg-white dark:text-gray-900"
        sideOffset={6}
      >
        {conditionOptions.map(({ key, icon: Icon }) => (
          <DropdownMenuItem
            key={key}
            onSelect={() => onSelect(key)}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:bg-gray-100 data-[highlighted]:bg-gray-100 dark:text-gray-900 dark:focus:bg-gray-100 dark:data-[highlighted]:bg-gray-100"
          >
            <Icon className="size-4 shrink-0 text-black" />
            <span>{t(key as any)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
