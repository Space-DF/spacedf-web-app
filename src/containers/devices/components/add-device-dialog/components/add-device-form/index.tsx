import { useTranslations } from 'next-intl'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'
import { AddDeviceSchema } from '../../schema'
import { useAddDeviceManually } from '@/containers/devices/hooks/useAddDeviceManually'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CircleCheck } from 'lucide-react'
import {
  countTwoDigitNumbers,
  formatValueEUI,
} from '@/containers/devices/utils'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export type Mode = 'auto' | 'manual'

interface AddDeviceFormProps {
  mode: Mode
  onSuccess: () => Promise<void>
  onClose: () => void
}

export const AddDeviceForm = ({
  mode,
  onSuccess,
  onClose,
}: AddDeviceFormProps) => {
  const t = useTranslations('addNewDevice')
  const form = useFormContext<AddDeviceSchema>()
  const { trigger: addDevice, isMutating } = useAddDeviceManually()

  async function onSubmit(values: AddDeviceSchema) {
    await addDevice(
      {
        ...values,
        dev_eui: values.dev_eui.replace(/\s+/g, ''),
      },
      {
        onSuccess: async () => {
          await onSuccess()
          toast.success(t('add_device_successfully'))
        },
        onError: (error) =>
          toast.error(error.message || t('failed_to_add_device')),
      }
    )
  }

  const isModeAuto = mode === 'auto'

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        {isModeAuto && (
          <div className="flex items-center gap-1 bg-brand-component-fill-positive-soft p-2 text-xs font-semibold text-brand-semantic-success rounded-sm">
            <CircleCheck size={16} />
            {t('scan_qr_code_successfully')}
          </div>
        )}
        <FormField
          control={form.control}
          name="dev_eui"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="font-semibold text-brand-component-text-dark">
                {t('deveui')}
                <span className="text-brand-component-text-accent">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  disabled={isModeAuto}
                  placeholder="00 04 A3 0B  00 1B B0 DF"
                  {...field}
                  value={field.value}
                  onChange={(e) => {
                    const rawValue = e.target.value
                      .replace(/\s/g, '')
                      .toUpperCase()

                    if (/^[0-9A-Fa-f]*$/.test(rawValue)) {
                      const binaryValue = formatValueEUI(rawValue)

                      if (
                        countTwoDigitNumbers(binaryValue) <= 8 &&
                        binaryValue.split(' ').length <= 8
                      ) {
                        field.onChange(binaryValue)
                      }
                    }
                  }}
                  isError={!!fieldState.error}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="font-semibold text-brand-component-text-dark">
                {t('device_name')}
                <span className="text-brand-component-text-accent">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t('enter_device_name')}
                  {...field}
                  isError={!!fieldState.error}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="font-semibold text-brand-component-text-dark">
                {t('description')}
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('enter_description')}
                  className="resize-none"
                  {...field}
                  isError={!!fieldState.error}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="submit" loading={isMutating}>
            {t('add_device')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
