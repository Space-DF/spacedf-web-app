import React from 'react'
import { useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTranslations } from 'next-intl'
import { mapPayload } from '@/validator'

interface Props {}

const TableWidgetInfo: React.FC<Props> = () => {
  const form = useFormContext<mapPayload>()
  const t = useTranslations()
  return (
    <div className="mt-4 size-full px-4">
      <FormField
        control={form.control}
        name="widget_info.name"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel
              className="text-sm font-semibold !text-brand-component-text-dark"
              required
            >
              {t('dashboard.widget_name')}
            </FormLabel>
            <FormControl>
              <Input {...field} isError={!!fieldState.error} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export default TableWidgetInfo
