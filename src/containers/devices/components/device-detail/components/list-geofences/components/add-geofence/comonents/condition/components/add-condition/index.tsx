import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EqualNot, PlusIcon } from 'lucide-react'
import { And, Calendar, Graph, NumberIcon } from '@/components/icons'
import { useTranslations } from 'next-intl'

const CONDITION_OPTIONS = [
  { key: 'distance_threshold', icon: NumberIcon },
  { key: 'time', icon: Calendar },
  { key: 'and', icon: And },
  { key: 'not', icon: EqualNot },
  { key: 'or', icon: Graph },
] as const

interface Props {
  onSelect: (key: (typeof CONDITION_OPTIONS)[number]['key']) => void
}

export const AddCondition = ({ onSelect }: Props) => {
  const t = useTranslations('common')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          className="w-fit gap-2 rounded-lg bg-gray-800 px-4 py-2 text-white shadow-sm hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          {t('add_condition')}
          <PlusIcon size={20} className="text-white" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-[220px] rounded-xl border-0 bg-white p-1.5 shadow-lg dark:bg-white dark:text-gray-900"
        sideOffset={6}
      >
        {CONDITION_OPTIONS.map(({ key, icon: Icon }) => (
          <DropdownMenuItem
            key={key}
            onSelect={() => onSelect(key)}
            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:bg-gray-100 data-[highlighted]:bg-gray-100 dark:text-gray-900 dark:focus:bg-gray-100 dark:data-[highlighted]:bg-gray-100"
          >
            <Icon className="size-4 shrink-0 text-black" />
            <span>{t(key)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
