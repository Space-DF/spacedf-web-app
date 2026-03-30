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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Automation } from '@/types/automation'
import { toast } from 'sonner'
import { addAutomationFormSchema, type AddAutomationFormValues } from './schema'
import { AndIf } from './components/and-if'
import { Actions } from './components/actions'
import { useAutomationStore } from './components/and-if/stores/automation'
import { useCreateAutomation } from './hooks/useCreateAutomation'
import { X } from 'lucide-react'
import { PencilSimple } from '@/components/icons'
import { buildConditionPayload, mapBackendRuleToFormCondition } from './utils'
import { When } from './components/when'
import { useUpdateAutomation } from './hooks/useUpdateAutomation'
import {
  AutomationDialogPopoverPortalProvider,
  PopoverPortalAnchor,
} from './automation-dialog-popover-portal-context'
import Info from '@/components/icons/info'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  isEditable?: boolean
  automation?: Automation
  setIsEditAutomation: (isEdit: boolean) => void
}

const DEFAULT_VALUES: AddAutomationFormValues = {
  name: '',
  title: '',
  device_id: '',
  conditions: [],
  actions: [{ id: uuidv4(), type: '' }],
}

export const AddAutomationDialog = ({
  isOpen,
  onClose,
  onSuccess,
  isEditable,
  automation,
  setIsEditAutomation,
}: Props) => {
  const t = useTranslations('automation')

  const isCanEdit = (isEditable && !!automation) || !automation

  const isViewOnly = !isEditable && !!automation

  const form = useForm<AddAutomationFormValues>({
    resolver: zodResolver(addAutomationFormSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onSubmit',
  })

  const { trigger: createAutomation, isMutating: isCreatingAutomation } =
    useCreateAutomation()

  const { trigger: updateAutomation, isMutating: isUpdatingAutomation } =
    useUpdateAutomation(automation?.id)

  const { reset, control, handleSubmit, formState } = form

  const deviceId = useWatch({ control, name: 'device_id' })

  const setCurrentCondition = useAutomationStore(
    (state) => state.setCurrentCondition
  )

  useEffect(() => {
    if (isOpen && !automation) reset(DEFAULT_VALUES)
    if (isOpen && automation)
      reset({
        name: automation.name,
        title: automation.title,
        device_id: automation.device_id,
        conditions:
          automation.event_rule?.definition?.conditions?.and.map(
            (condition) => {
              const mapped = mapBackendRuleToFormCondition(condition)
              return mapped.type === 'leaf'
                ? { type: 'and', rules: [mapped] }
                : mapped
            }
          ) ?? [],
        actions: automation.actions.map((action) => ({
          id: action.id,
          type: action.id,
        })),
      })
  }, [isOpen, automation])

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

    const payload = {
      name: values.name,
      title: values.title,
      device_id: values.device_id,
      action_ids,
      event_rule: {
        rule_key: `rule_${uuidv4()}`,
        definition: { conditions: { and: conditionPayloads } },
      },
    }

    if (automation) {
      updateAutomation(payload, {
        onSuccess: () => {
          toast.success(t('automation_updated_successfully'))
          onSuccess?.()
          handleClose()
        },
        onError: (error) => {
          toast.error(error?.message || t('automation_update_failed'))
        },
      })
      return
    }

    createAutomation(payload, {
      onSuccess: () => {
        toast.success(t('automation_created_successfully'))
        onSuccess?.()
        handleClose()
      },
      onError: (error) => {
        toast.error(error?.message || t('automation_create_failed'))
      },
    })
  }

  const labelDialog = () => {
    if (isViewOnly) return t('automation_detail')
    if (automation) return t('edit_automation')
    return t('add_automation')
  }

  return (
    <AutomationDialogPopoverPortalProvider>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent
          showCloseIcon={false}
          className="max-w-2xl max-h-[90vh] flex flex-col overflow-visible p-0"
        >
          <div className="flex min-h-0 max-h-[90vh] flex-1 flex-col overflow-hidden">
            <DialogHeader className="border-none shrink-0">
              <DialogTitle className="text-brand-component-text-dark text-[16px] font-semibold">
                <div className="flex justify-between items-center">
                  {labelDialog()}
                  <div className="flex space-x-2 items-center">
                    {isViewOnly && (
                      <Button
                        className="flex items-center gap-2"
                        onClick={() => setIsEditAutomation(true)}
                      >
                        {t('edit')}
                        <PencilSimple className="size-4" />
                      </Button>
                    )}
                    <button type="button" onClick={handleClose}>
                      <X className="size-5" />
                    </button>
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            <FormProvider {...form}>
              <Form {...form}>
                <form
                  onSubmit={handleSubmit(onValidSubmit)}
                  className="flex min-h-0 flex-1 flex-col overflow-hidden"
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
                              disabled={!isCanEdit}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-sm font-semibold text-brand-component-text-gray">
                            {t('event_title')}
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={t('event_title_placeholder')}
                              className="bg-brand-fill-dark-soft"
                              disabled={!isCanEdit}
                            />
                          </FormControl>
                          <div className="flex items-center gap-x-1">
                            <Info className="size-4" />
                            <p className="font-medium text-xs text-brand-component-text-gray">
                              {t(
                                'this_text_will_appear_in_the_event_list_when_this_automation_is_triggered'
                              )}
                            </p>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <When isEditable={isCanEdit} />
                    {deviceId && <AndIf isEditable={isCanEdit} />}
                    <Actions isEditable={isCanEdit} />
                  </div>

                  <div className="flex shrink-0 items-center justify-end gap-3 p-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      loading={
                        formState.isSubmitting ||
                        isCreatingAutomation ||
                        isUpdatingAutomation
                      }
                      disabled={!isCanEdit}
                    >
                      {isCanEdit ? t('save') : t('add')}
                    </Button>
                  </div>
                </form>
              </Form>
            </FormProvider>
          </div>
          <PopoverPortalAnchor />
        </DialogContent>
      </Dialog>
    </AutomationDialogPopoverPortalProvider>
  )
}
