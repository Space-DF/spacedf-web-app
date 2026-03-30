import { useFormContext } from 'react-hook-form'
import { AddAutomationFormValues } from '../../../schema'
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { OPERATORS } from '@/containers/automation-settings/contanst'
import { useAutomationDialogPopoverPortal } from '../../../automation-dialog-popover-portal-context'

interface LeafRowProps {
  path: `conditions.${number}${string}`
  onRemove: () => void
  isEditable: boolean
}

export const LeafRow = ({ path, isEditable }: LeafRowProps) => {
  const { control } = useFormContext<AddAutomationFormValues>()
  const popoverPortal = useAutomationDialogPopoverPortal()

  return (
    <div className="grid grid-cols-9 gap-2 items-start">
      <FormField
        control={control}
        name={`${path}.operator` as `conditions.${number}.${string}`}
        render={({ field }) => (
          <FormItem className="col-span-2">
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={!isEditable}
            >
              <FormControl>
                <SelectTrigger
                  className="w-full bg-brand-component-fill-dark-soft h-9 text-sm"
                  icon={<ChevronDown size={12} className="opacity-50" />}
                >
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent
                container={popoverPortal?.popoverPortalContainerRef.current}
                className="z-[100]"
              >
                {OPERATORS.map((o) => (
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
      <FormField
        control={control}
        name={`${path}.value` as `conditions.${number}.${string}`}
        render={({ field }) => (
          <FormItem className="col-span-7">
            <FormControl>
              <Input
                placeholder="Value"
                className="w-full text-sm h-9"
                {...field}
                disabled={!isEditable}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
