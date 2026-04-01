import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

interface ConfirmDialogProps {
  deviceId?: string
  onCancel: () => void
  onConfirm: () => void
}

export const ConfirmDialog = ({
  deviceId,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) => {
  const t = useTranslations('automation')
  return (
    <AlertDialog open={!!deviceId} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="dark:bg-brand-component-fill-outermost p-4 sm:max-w-[402px] sm:rounded-2xl">
        <AlertDialogHeader className="space-y-3 text-center">
          <AlertDialogTitle className="text-center text-lg font-bold text-brand-component-text-dark">
            {t('changing_the_device')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm font-medium text-brand-component-text-gray">
            {t(
              'changing_the_device_will_clear_all_existing_conditions_and_actions_do_you_want_to_continue'
            )}
            ?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex gap-4">
          <AlertDialogCancel className="h-12 flex-1 border-brand-component-stroke-dark-soft text-base font-semibold text-brand-component-text-gray shadow-none">
            {t('cancel')}
          </AlertDialogCancel>
          <Button
            type="button"
            className="h-12 flex-1 items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark font-semibold shadow-sm transition-all hover:opacity-70"
            onClick={onConfirm}
          >
            {t('confirm')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
