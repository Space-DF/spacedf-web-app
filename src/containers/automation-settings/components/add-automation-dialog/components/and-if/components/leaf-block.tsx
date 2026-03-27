import { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { AddAutomationFormValues, AutomationCondition } from '../../../schema'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ChevronDown,
  Ellipsis,
  Scissors,
  SquarePen,
  Trash2,
} from 'lucide-react'
import { Copy, Duplicate } from '@/components/icons'
import { Separator } from '@/components/ui/separator'
import { useFormContext } from 'react-hook-form'
import { EditYamlPanel } from './edit-yaml-dialog'
import { useTranslations } from 'next-intl'
import { useAutomationStore } from '../stores/automation'
import { useShallow } from 'zustand/react/shallow'
import { LeafRow } from './leaf-row'
import { uppercaseFirstLetter } from '@/utils'

interface LeafBlockProps {
  path: `conditions.${number}.${string}`
  leaf: Extract<AutomationCondition, { type: 'leaf' }> & { id: string }
  onDuplicateSelf: (condition: AutomationCondition) => void
  onRemoveSelf: () => void
  isEditable: boolean
}

const withStopPropagation =
  (fn?: () => void) => (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    fn?.()
  }

export const LeafBlock = ({
  path,
  leaf,
  onDuplicateSelf,
  onRemoveSelf,
  isEditable,
}: LeafBlockProps) => {
  const [isEditingYaml, setIsEditingYaml] = useState(false)
  const { setValue } = useFormContext<AddAutomationFormValues>()
  const { setCurrentCondition } = useAutomationStore(
    useShallow((state) => ({
      setCurrentCondition: state.setCurrentCondition,
    }))
  )
  const t = useTranslations('automation')

  const handleCutCondition = () => {
    setCurrentCondition(leaf)
    onRemoveSelf()
  }

  const handleSaveYaml = (updated: AutomationCondition) => {
    setValue(
      path as AddAutomationFormValues['conditions'][number]['type'],
      updated
    )
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue={leaf.id}
    >
      <AccordionItem
        value={leaf.id}
        className="overflow-hidden rounded-sm border border-brand-component-stroke-dark-soft"
      >
        <AccordionTrigger
          className="border-b border-brand-component-stroke-dark-soft bg-brand-component-fill-gray-soft p-3 text-sm font-semibold hover:no-underline"
          dropdownIcon={
            isEditable ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div
                    className="cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Ellipsis className="h-5 w-5 shrink-0 text-brand-icon-gray" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={withStopPropagation(() => onDuplicateSelf(leaf))}
                  >
                    <Duplicate className="mr-2 h-4 w-4 text-brand-component-text-dark" />
                    {t('duplicate')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={withStopPropagation(() => {
                      setCurrentCondition(leaf)
                    })}
                  >
                    <Copy className="mr-2 h-4 w-4 text-brand-component-text-dark" />
                    {t('copy')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={withStopPropagation(handleCutCondition)}
                  >
                    <Scissors className="mr-2 h-4 w-4 text-brand-component-text-dark" />
                    {t('cut')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={withStopPropagation(() => setIsEditingYaml(true))}
                  >
                    <SquarePen className="mr-2 h-4 w-4 text-brand-component-text-dark" />
                    {t('edit_in_yaml')}
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem
                    onClick={onRemoveSelf}
                    className="text-brand-component-text-accent"
                  >
                    <Trash2 className="mr-2 h-4 w-4 text-brand-component-text-accent" />
                    {t('delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <></>
            )
          }
        >
          <ChevronDown className="h-5 w-5 shrink-0 text-brand-icon-gray transition-transform duration-200" />
          <div className="mr-2 flex w-full items-center">
            <div className="flex items-center space-x-1">
              <p className="text-sm font-semibold text-brand-component-text-dark">
                {uppercaseFirstLetter(leaf.entity) || 'Select entity'}
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-3">
          {isEditingYaml ? (
            <EditYamlPanel
              condition={leaf}
              onCancel={() => setIsEditingYaml(false)}
              onSave={handleSaveYaml}
            />
          ) : (
            <LeafRow
              path={path}
              onRemove={onRemoveSelf}
              isEditable={isEditable}
            />
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
