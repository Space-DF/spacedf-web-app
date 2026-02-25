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

export const ConditionOptions = ({
  onTest,
  onDuplicate,
  onCopy,
  onCut,
  onEditInYAML,
  onDelete,
}: Props) => {
  const t = useTranslations('common')
  const handleDuplicate = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onDuplicate?.()
  }
  const handleCopy = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onCopy?.()
  }
  const handleCut = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onCut?.()
  }
  const handleEditInYAML = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onEditInYAML?.()
  }
  const handleDelete = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onDelete?.()
  }
  const handleTest = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onTest?.()
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer">
          <Ellipsis className="h-5 w-5 shrink-0 text-brand-icon-gray transition-transform duration-200" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleTest}>
          <TestTube className="mr-2 h-4 w-4 text-brand-component-text-dark" />
          {t('test')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDuplicate}>
          <Duplicate className="mr-2 h-4 w-4 text-brand-component-text-dark" />
          {t('duplicate')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4 text-brand-component-text-dark" />
          {t('copy')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCut}>
          <Scissors className="mr-2 h-4 w-4 text-brand-component-text-dark" />
          {t('cut')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEditInYAML}>
          <SquarePen className="mr-2 h-4 w-4 text-brand-component-text-dark" />
          {t('edit_in_yaml')}
        </DropdownMenuItem>
        <Separator className="" />
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-brand-component-text-accent"
        >
          <Trash2 className="mr-2 h-4 w-4 text-brand-component-text-accent" />
          {t('delete')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
