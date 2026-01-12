import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useTranslations } from 'next-intl'
import { useEffect } from 'react'
import { dashboardSchema } from './schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useIsDemo } from '@/hooks/useIsDemo'
import { useCreateDashboard } from '@/containers/dashboard/hooks/useCreateDashboard'
import { Dashboard } from '@/types/dashboard'
import { useUpdateDashboard } from './hooks/useUpdateDashboard'

interface DashboardDialogProps {
  setDashboardId?: (id: string) => void
  closePopover?: () => void
  dashboard?: Dashboard
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

export const DashboardDialog = ({
  setDashboardId,
  closePopover,
  dashboard,
  isOpen,
  setIsOpen,
}: DashboardDialogProps) => {
  const t = useTranslations('dashboard')
  const form = useForm<z.infer<typeof dashboardSchema>>({
    resolver: zodResolver(dashboardSchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    if (dashboard) {
      form.setValue('name', dashboard.name)
    }
  }, [dashboard])

  const isDemo = useIsDemo()
  const { trigger: createDashboard, isMutating: isCreatingDashboard } =
    useCreateDashboard()

  const { trigger: updateDashboard, isMutating: isUpdatingDashboard } =
    useUpdateDashboard()

  const handleClose = async () => {
    await closePopover?.()
    form.reset()
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      handleClose()
    }
  }

  const onSubmit = async (data: z.infer<typeof dashboardSchema>) => {
    if (isDemo) return handleClose()
    if (dashboard) {
      await updateDashboard({ name: data.name, id: dashboard.id })
      handleClose()
      return
    }
    const newDashboard = await createDashboard({ name: data.name })
    handleClose()
    setDashboardId?.(newDashboard.id)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="text-sm text-brand-component-text-dark p-6">
        <DialogTitle>
          {dashboard ? t('update_dashboard') : t('create_dashboard')}
        </DialogTitle>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-brand-component-text-dark">
                    {t('dashboard_name')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-10 rounded-lg border-0 bg-brand-component-fill-dark-soft shadow-none"
                      {...field}
                      isError={!!fieldState.error}
                      placeholder={t('enter_dashboard_name')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              loading={isCreatingDashboard || isUpdatingDashboard}
              type="submit"
              className="w-full"
            >
              {dashboard ? t('save') : t('create_dashboard')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
