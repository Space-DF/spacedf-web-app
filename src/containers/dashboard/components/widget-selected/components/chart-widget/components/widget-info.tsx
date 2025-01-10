import { ChartPayload } from '@/validator'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface Props {}

const ChartWidgetInfo: React.FC<Props> = () => {
  const form = useFormContext<ChartPayload>()
  const t = useTranslations('dashboard')
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
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
        <Label className="text-xs font-semibold text-brand-component-text-dark">
          {t('appearance')}
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="widget_info.appearance.show_value"
            render={({ field }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="text-xs font-semibold text-brand-component-text-dark">
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

export default ChartWidgetInfo
