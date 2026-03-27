import { useTranslations } from 'next-intl'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { AddAutomationFormValues } from '../../schema'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useActions } from './hooks/useActions'

interface ActionsProps {
  isEditable: boolean
}

export const Actions = ({ isEditable }: ActionsProps) => {
  const { control } = useFormContext<AddAutomationFormValues>()
  const {
    fields: actionFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'actions',
  })

  const { data: actions } = useActions()

  const actionOptions =
    actions?.results.map((action) => ({
      value: action.id,
      label: action.name,
    })) || []

  const t = useTranslations('automation')
  return (
    <div className="flex flex-col gap-2">
      <div>
        <h3 className="text-lg font-semibold text-brand-component-text-dark">
          {t('then_do')}
        </h3>
        <p className="text-xs text-brand-component-text-gray leading-4">
          {t('then_do_description')}
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {actionFields.map((actionField, index) => (
          <div
            key={actionField.id}
            className="flex items-center gap-2 rounded-lg border border-brand-stroke-dark-soft px-4 py-3"
          >
            <span className="text-xs font-semibold text-brand-component-text-dark">
              {t('action')}:
            </span>
            <FormField
              control={control}
              name={`actions.${index}.type`}
              render={({ field }) => (
                <FormItem className="flex-1 space-y-0">
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!isEditable}
                  >
                    <FormControl>
                      <SelectTrigger
                        icon={<ChevronDown size={12} className="opacity-50" />}
                        className="h-[34px] border-0 bg-brand-component-fill-dark-soft text-sm focus:ring-0"
                      >
                        <SelectValue placeholder={t('select_action')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {actionOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {actionFields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                disabled={!isEditable}
                className="shrink-0 text-brand-component-text-accent hover:opacity-70 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
        {isEditable && (
          <Button
            type="button"
            className="w-fit gap-2"
            onClick={() => append({ id: uuidv4(), type: '' })}
          >
            {t('add_action')}
            <Plus size={16} />
          </Button>
        )}
      </div>
    </div>
  )
}
