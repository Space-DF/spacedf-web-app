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

interface Props {
  deleteId: string | undefined
  setDeleteId: (id: string | undefined) => void
  isDeleting: boolean
  onDeleteDashboard: () => void
}

export const ConfirmDeleteDashboard = ({
  deleteId,
  setDeleteId,
  isDeleting,
  onDeleteDashboard,
}: Props) => {
  const t = useTranslations('dashboard')
  return (
    <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(undefined)}>
      <AlertDialogContent className="bg-background p-4 sm:max-w-[402px] sm:rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-lg font-bold text-brand-component-text-dark">
            {t('are_you_sure')}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm font-medium text-brand-component-text-gray">
            {t(
              'the_dashboard_will_be_deleted_from_the_system_and_cannot_be_restored'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-4">
          <AlertDialogCancel className="h-12 flex-1 border-brand-component-stroke-dark-soft text-base font-semibold text-brand-component-text-gray shadow-none">
            {t('cancel')}
          </AlertDialogCancel>
          <Button
            loading={isDeleting}
            className="h-12 flex-1 items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-negative text-base font-semibold text-white shadow-sm transition-all hover:bg-brand-component-fill-negative hover:opacity-70 dark:border-brand-component-stroke-light"
            onClick={onDeleteDashboard}
          >
            {t('delete')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
