import { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  AddAutomationFormValues,
  AutomationCondition,
  GroupType,
} from '../../../schema'
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
import {
  FieldArrayWithId,
  useFieldArray,
  useFormContext,
} from 'react-hook-form'
import {
  GROUP_ICONS,
  GROUP_LABEL,
} from '@/containers/automation-settings/contanst'
import { AddConditionDropdown } from './add-condition-dropdown'
import { LeafRow } from './leaf-row'
import { EditYamlPanel } from './edit-yaml-dialog'
import { useTranslations } from 'next-intl'
import { useAutomationStore } from '../stores/automation'
import { useShallow } from 'zustand/react/shallow'

interface GroupBlockProps {
  path: string
  group: FieldArrayWithId<AddAutomationFormValues, 'conditions', 'id'>
  onDuplicateSelf: (group: AutomationCondition) => void
  onRemoveSelf: () => void
}

const withStopPropagation =
  (fn?: () => void) => (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    fn?.()
  }

export const GroupBlock = ({
  path,
  group,
  onDuplicateSelf,
  onRemoveSelf,
}: GroupBlockProps) => {
  const Icon = GROUP_ICONS[group.type as keyof typeof GROUP_ICONS]
  const label = GROUP_LABEL[group.type as keyof typeof GROUP_LABEL]
  const [isEditingYaml, setIsEditingYaml] = useState(false)

  const { control, setValue } = useFormContext<AddAutomationFormValues>()

  const rulesName = `${path}.rules` as `conditions.${number}.rules`
  const { fields, append, remove, insert } = useFieldArray({
    control,
    name: rulesName,
  })

  const { currentCondition, setCurrentCondition } = useAutomationStore(
    useShallow((state) => ({
      currentCondition: state.currentCondition,
      setCurrentCondition: state.setCurrentCondition,
    }))
  )

  const handleCutCondition = () => {
    setCurrentCondition(group)
    onRemoveSelf()
  }

  const ruleFields = fields as (AutomationCondition & { id: string })[]

  const t = useTranslations('automation')

  const handleSaveYaml = (updated: AutomationCondition) => {
    setValue(
      path as AddAutomationFormValues['conditions'][number]['type'],
      updated
    )
  }

  const handleAddCondition = (type: GroupType | 'leaf' | 'paste') => {
    if (type === 'paste') {
      append(currentCondition)
      return
    }
    if (type === 'leaf') {
      append({
        type: 'leaf',
        entity: '',
        operator: 'lte',
        value: '',
      })
      return
    }
    append({ type, rules: [] })
  }

  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      defaultValue={group.id}
    >
      <AccordionItem
        value={group.id}
        className="overflow-hidden rounded-sm border border-brand-component-stroke-dark-soft"
      >
        <AccordionTrigger
          className="border-b border-brand-component-stroke-dark-soft bg-brand-component-fill-gray-soft p-3 text-sm font-semibold hover:no-underline"
          dropdownIcon={
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
                  onClick={withStopPropagation(() => onDuplicateSelf(group))}
                >
                  <Duplicate className="mr-2 h-4 w-4 text-brand-component-text-dark" />
                  {t('duplicate')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={withStopPropagation(() => {
                    setCurrentCondition(group)
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
          }
        >
          <ChevronDown className="h-5 w-5 shrink-0 text-brand-icon-gray transition-transform duration-200" />
          <div className="mr-2 flex w-full items-center">
            <div className="flex items-center space-x-1">
              <Icon className="h-5 w-5 shrink-0 text-brand-icon-gray" />
              <p className="text-sm font-semibold text-brand-component-text-dark">
                {label}
              </p>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-3 space-y-3">
          {isEditingYaml ? (
            <EditYamlPanel
              condition={group}
              onCancel={() => setIsEditingYaml(false)}
              onSave={handleSaveYaml}
            />
          ) : (
            ruleFields.map((rule, ruleIndex) => {
              const key = rule.id
              return rule.type === 'leaf' ? (
                <LeafRow
                  key={key}
                  path={`${rulesName}.${ruleIndex}`}
                  onRemove={() => remove(ruleIndex)}
                />
              ) : (
                <GroupBlock
                  key={key}
                  path={`${rulesName}.${ruleIndex}`}
                  group={rule}
                  onDuplicateSelf={() => insert(ruleIndex, rule)}
                  onRemoveSelf={() => remove(ruleIndex)}
                />
              )
            })
          )}
          <AddConditionDropdown isChildren onAdd={handleAddCondition} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
