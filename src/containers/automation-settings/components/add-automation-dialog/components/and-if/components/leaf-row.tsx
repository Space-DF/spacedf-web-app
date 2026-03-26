import { useFormContext, useWatch } from 'react-hook-form'
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
import { ChevronDown, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { OPERATORS } from '@/containers/automation-settings/contanst'
import { useDeviceEntity } from '@/containers/dashboard/components/widget-selected/hooks/useDeviceEntity'

interface LeafRowProps {
  path: `conditions.${number}.rules.${number}`
  onRemove: () => void
}

export const LeafRow = ({ path, onRemove }: LeafRowProps) => {
  const { control } = useFormContext<AddAutomationFormValues>()
  const deviceId = useWatch({ control, name: 'device_id' })
  const { data: entities } = useDeviceEntity(undefined, undefined, deviceId)
  const entityOptions =
    entities?.results?.map((entity) => ({
      value: entity.id,
      label: entity.name,
    })) || []

  return (
    <div className="grid grid-cols-9 gap-2 items-start">
      <FormField
        control={control}
        name={`${path}.entity`}
        render={({ field }) => (
          <FormItem className="col-span-3">
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger
                  className="flex-1 bg-brand-component-fill-dark-soft h-9 text-sm"
                  icon={<ChevronDown size={12} className="opacity-50" />}
                >
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {entityOptions.map((o) => (
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
        name={`${path}.operator`}
        render={({ field }) => (
          <FormItem className="col-span-2">
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger
                  className="w-full bg-brand-component-fill-dark-soft h-9 text-sm"
                  icon={<ChevronDown size={12} className="opacity-50" />}
                >
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
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
        name={`${path}.value`}
        render={({ field }) => (
          <FormItem className="col-span-3">
            <FormControl>
              <Input
                placeholder="Value"
                className="w-full text-sm h-9"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className=" relative">
        <button
          type="button"
          onClick={onRemove}
          className="text-brand-component-text-accent hover:opacity-70 transition-opacity absolute top-5 -translate-y-1/2 left-1/2 -translate-x-1/2"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
