import { GaugePayload } from '@/validator'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const WidgetInfo = () => {
  const { control } = useFormContext<GaugePayload>()
  const t = useTranslations('dashboard')
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="widget_info.name"
        render={({ field }) => (
          <FormItem>
            <FormLabel
              className="text-xs font-semibold text-brand-component-text-dark"
              required
            >
              {t('widget_name')}
            </FormLabel>
            <FormControl>
              <Input {...field} />
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
          <FormField
            control={control}
            name="widget_info.appearance.show_value"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-sm font-semibold text-brand-component-text-dark">
                  {t('show_value')}
                </FormLabel>
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  )
}

export default WidgetInfo
