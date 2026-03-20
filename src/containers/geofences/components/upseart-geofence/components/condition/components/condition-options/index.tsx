import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { Ellipsis, Scissors, SquarePen, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Separator } from '@/components/ui/separator'
import { TestTube, Duplicate, Copy } from '@/components/icons'

interface Props {
  onTest?: () => void
  onDuplicate?: () => void
  onCopy?: () => void
  onCut?: () => void
  onEditInYAML?: () => void
  onDelete?: () => void
}

const withStopPropagation =
  (fn?: () => void) => (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    fn?.()
  }

export const ConditionOptions = ({
  onTest,
  onDuplicate,
  onCopy,
  onCut,
  onEditInYAML,
  onDelete,
}: Props) => {
  const t = useTranslations('common')
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer">
          <Ellipsis className="h-5 w-5 shrink-0 text-brand-icon-gray transition-transform duration-200" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={withStopPropagation(onTest)}>
          <TestTube className="mr-2 h-4 w-4 text-brand-component-text-dark" />
          {t('test')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={withStopPropagation(onDuplicate)}>
          <Duplicate className="mr-2 h-4 w-4 text-brand-component-text-dark" />
          {t('duplicate')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={withStopPropagation(onCopy)}>
          <Copy className="mr-2 h-4 w-4 text-brand-component-text-dark" />
          {t('copy')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={withStopPropagation(onCut)}>
          <Scissors className="mr-2 h-4 w-4 text-brand-component-text-dark" />
          {t('cut')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={withStopPropagation(onEditInYAML)}>
          <SquarePen className="mr-2 h-4 w-4 text-brand-component-text-dark" />
          {t('edit_in_yaml')}
        </DropdownMenuItem>
        <Separator className="" />
        <DropdownMenuItem
          onClick={withStopPropagation(onDelete)}
          className="text-brand-component-text-accent"
        >
          <Trash2 className="mr-2 h-4 w-4 text-brand-component-text-accent" />
          {t('delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
