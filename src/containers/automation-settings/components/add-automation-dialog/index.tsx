'use client'

import { useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useTranslations } from 'next-intl'
import { useForm, FormProvider, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useGetDevices } from '@/hooks/useDevices'
import { AutomationRuleCondition } from '@/types/automation'
import { toast } from 'sonner'
import {
  addAutomationFormSchema,
  type AddAutomationFormValues,
  type AutomationCondition,
} from './schema'
import { AndIf } from './components/and-if'
import { Actions } from './components/actions'
import { useAutomationStore } from './components/and-if/stores/automation'
import { useCreateAutomation } from './hooks/useCreateAutomation'

const buildConditionPayload = (
  c: AutomationCondition
): AutomationRuleCondition => {
  if (c.type === 'leaf') {
    return { [c.entity]: { [c.operator]: Number(c.value) } }
  }
  const rules = c.rules.map(buildConditionPayload)
  return { [c.type]: rules } as AutomationRuleCondition
}

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const DEFAULT_VALUES: AddAutomationFormValues = {
  name: '',
  device_id: '',
  conditions: [],
  actions: [{ id: uuidv4(), type: '' }],
}

export const AddAutomationDialog = ({ isOpen, onClose, onSuccess }: Props) => {
  const t = useTranslations('automation')
  const { data: devices } = useGetDevices()

  const form = useForm<AddAutomationFormValues>({
    resolver: zodResolver(addAutomationFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onSubmit',
  })

  const { trigger: createAutomation, isMutating: isCreatingAutomation } =
    useCreateAutomation()

  const { reset, control, handleSubmit, formState } = form

  const deviceId = useWatch({ control, name: 'device_id' })

  const deviceOptions =
    devices?.map((device) => ({
      value: device.device.id,
      label: device.name,
    })) || []

  const setCurrentCondition = useAutomationStore(
    (state) => state.setCurrentCondition
  )

  useEffect(() => {
    if (isOpen) reset(DEFAULT_VALUES)
  }, [isOpen])

  const handleClose = () => {
    reset(DEFAULT_VALUES)
    setCurrentCondition(undefined)
    onClose()
  }

  const onValidSubmit = async (values: AddAutomationFormValues) => {
    const conditionPayloads = values.conditions.map(buildConditionPayload)
    const action_ids = values.actions.map((a) => a.type).filter(Boolean)
    if (!conditionPayloads.length) {
      return toast.error(t('please_add_at_least_one_condition'))
    }

    if (!action_ids.length) {
      return toast.error(t('please_add_at_least_one_action'))
    }

    createAutomation(
      {
        name: values.name,
        device_id: values.device_id,
        action_ids,
        event_rule: {
          rule_key: `rule_${uuidv4()}`,
          definition: { conditions: { and: conditionPayloads } },
        },
      },
      {
        onSuccess: () => {
          toast.success(t('automation_created_successfully'))
          onSuccess?.()
          handleClose()
        },
        onError: (error) => {
          toast.error(error?.message || t('automation_create_failed'))
        },
      }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        <DialogHeader className="border-none shrink-0">
          <DialogTitle className="text-brand-component-text-dark text-[16px] font-semibold">
            {t('add_automation')}
          </DialogTitle>
        </DialogHeader>
        <FormProvider {...form}>
          <Form {...form}>
            <form
              onSubmit={handleSubmit(onValidSubmit)}
              className="flex max-h-[90vh] flex-col overflow-hidden"
            >
              <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-2">
                <FormField
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-semibold text-brand-component-text-gray">
                        {t('automation_name')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t('automation_name_placeholder')}
                          className="bg-brand-fill-dark-soft"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-brand-component-text-dark">
                      {t('when')}
                    </h3>
                    <p className="text-xs text-brand-component-text-gray leading-4">
                      {t('when_description')}
                    </p>
                  </div>
                  <FormField
                    control={control}
                    name="device_id"
                    render={({ field }) => (
                      <FormItem>
                        <div className="rounded-lg border border-brand-stroke-dark-soft px-3 py-2.5 shadow-md">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-auto border-0 bg-transparent p-0 shadow-none focus:ring-0 text-sm font-medium [&>svg]:hidden">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`size-2 shrink-0 rounded-full ${field.value ? 'bg-brand-component-text-positive' : 'bg-gray-300'}`}
                                  />
                                  <SelectValue
                                    placeholder={t('select_device')}
                                  />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {deviceOptions.map((device) => (
                                <SelectItem
                                  key={device.value}
                                  value={device.value}
                                >
                                  {device.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {deviceId && <AndIf />}
                <Actions />
              </div>

              <div className="flex shrink-0 items-center justify-end gap-3 p-4">
                <Button type="button" variant="outline" onClick={handleClose}>
                  {t('cancel')}
                </Button>
                <Button
                  type="submit"
                  loading={formState.isSubmitting || isCreatingAutomation}
                >
                  {t('add')}
                </Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
