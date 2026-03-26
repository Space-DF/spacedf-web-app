'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useDeleteAutomation } from '../hooks/useDeleteAutomation'

interface DeleteAutomationDialogProps {
  onCancel: () => void
  onConfirm: () => void
  deleteTargetId?: string
}

export const DeleteAutomationDialog = ({
  onCancel,
  onConfirm,
  deleteTargetId,
}: DeleteAutomationDialogProps) => {
  const t = useTranslations('automation')
  const { trigger, isMutating } = useDeleteAutomation(deleteTargetId)

  const handleConfirm = async () => {
    await trigger()
    onConfirm()
  }

  return (
    <AlertDialog
      open={!!deleteTargetId}
      onOpenChange={(open) => !open && onCancel()}
    >
      <AlertDialogContent className="dark:bg-brand-component-fill-outermost p-4 sm:max-w-[402px] sm:rounded-2xl">
        <AlertDialogHeader className="space-y-3 text-center">
          <AlertDialogTitle className="text-center text-lg font-bold text-brand-component-text-dark">
            {t('delete_automation_title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-sm font-medium text-brand-component-text-gray">
            {t('delete_automation_description')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex gap-4">
          <AlertDialogCancel
            disabled={isMutating}
            className="h-12 flex-1 border-brand-component-stroke-dark-soft text-base font-semibold text-brand-component-text-gray shadow-none"
          >
            {t('cancel')}
          </AlertDialogCancel>
          <Button
            type="button"
            className="h-12 flex-1 items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-negative text-base font-semibold text-white shadow-sm transition-all hover:bg-brand-component-fill-negative hover:opacity-70 dark:border-brand-component-stroke-light"
            onClick={handleConfirm}
            loading={isMutating}
          >
            {t('delete')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
