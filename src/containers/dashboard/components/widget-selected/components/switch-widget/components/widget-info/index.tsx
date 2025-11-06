import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SwitchPayload } from '@/validator'
import { useTranslations } from 'next-intl'
import { useFormContext } from 'react-hook-form'

const SwitchWidgetInfo = () => {
  const form = useFormContext<SwitchPayload>()
  const t = useTranslations('dashboard')
  return (
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
  )
}

export default SwitchWidgetInfo
