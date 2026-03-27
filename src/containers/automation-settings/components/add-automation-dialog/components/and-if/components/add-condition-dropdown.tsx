import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GroupType } from '../../../schema'
import { Button } from '@/components/ui/button'
import { Clipboard, EqualNot, Plus, Scale } from 'lucide-react'
import { And, Graph } from '@/components/icons'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'
import { useAutomationStore } from '../stores/automation'

const CONDITION_OPTIONS = [
  ['and', And, 'And'],
  ['not', EqualNot, 'Not'],
  ['or', Graph, 'Or'],
  ['condition', Scale, 'Condition'],
] as const

interface Props {
  onAdd: (type: GroupType | 'leaf' | 'paste') => void
  isChildren?: boolean
}

export const AddConditionDropdown = ({ onAdd, isChildren }: Props) => {
  const currentCondition = useAutomationStore((state) => state.currentCondition)

  const conditionOptions = useMemo(() => {
    const conditionOptions = currentCondition
      ? [...CONDITION_OPTIONS, ['paste', Clipboard, 'Paste Condition'] as const]
      : CONDITION_OPTIONS
    return isChildren
      ? conditionOptions
      : conditionOptions.filter(([type]) => type !== 'condition')
  }, [isChildren, currentCondition])
  const t = useTranslations('automation')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" className="w-fit gap-2">
          {t('add_condition')}
          <Plus size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="min-w-40 rounded-xl border-0 bg-white p-1.5 shadow-lg"
        sideOffset={6}
      >
        {conditionOptions.map(([type, Icon, label]) => (
          <DropdownMenuItem
            key={type}
            onSelect={() =>
              onAdd(type === 'condition' ? 'leaf' : (type as GroupType))
            }
            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:bg-gray-100 data-[highlighted]:bg-gray-100 dark:text-gray-900 dark:focus:bg-gray-100"
          >
            <Icon className="size-4 shrink-0 text-black" />
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
