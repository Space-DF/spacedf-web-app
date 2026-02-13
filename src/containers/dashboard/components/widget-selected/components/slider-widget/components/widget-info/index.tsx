import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { SliderPayload } from '@/validator'
import { useTranslations } from 'next-intl'
import { useFormContext } from 'react-hook-form'

const SliderWidgetInfo = () => {
  const form = useFormContext<SliderPayload>()
  const t = useTranslations('dashboard')
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="widget_info.name"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              className="text-sm font-semibold !text-brand-component-text-dark"
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
        <FormLabel
          className="text-sm font-semibold !text-brand-component-text-dark"
          required
        >
          {t('appearance')}
        </FormLabel>
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
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

export default SliderWidgetInfo
