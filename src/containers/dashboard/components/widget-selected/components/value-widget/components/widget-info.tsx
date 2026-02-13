import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ValuePayload } from '@/validator'
import { useTranslations } from 'next-intl'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import ColorSelect from '../../color-select'

interface Props {}

const WidgetInfo: React.FC<Props> = () => {
  const form = useFormContext<ValuePayload>()
  const { control } = form
  const t = useTranslations('dashboard')
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="widget_info.name"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              className="text-sm font-semibold text-brand-component-text-dark"
              required
            >
              {t('widget_name')}
            </FormLabel>
            <FormControl>
              <Input {...field} isError={!!fieldState.error} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="space-y-4">
        <Label className="text-sm font-semibold text-brand-component-text-dark">
          {t('appearance')}
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={control}
            name="widget_info.appearance.show_state"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-semibold text-brand-component-text-dark">
                  {t('show_state')}
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={control}
        name={`widget_info.color`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-brand-component-text-dark">
              {t('color')}
            </FormLabel>
            <FormControl>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <ColorSelect fieldValue={field.value} />
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default WidgetInfo
