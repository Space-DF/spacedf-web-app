'use client'

import type { ReactNode } from 'react'
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

export type CommonConfirmDialogProps = {
  open: boolean
  title: ReactNode
  description?: ReactNode
  cancelLabel?: ReactNode
  confirmLabel?: ReactNode
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  onCancel,
  onConfirm,
}: CommonConfirmDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => !nextOpen && onCancel()}
    >
      <AlertDialogContent className="dark:bg-brand-component-fill-outermost p-4 sm:max-w-[402px] sm:rounded-2xl">
        <AlertDialogHeader className="space-y-3 text-center">
          <AlertDialogTitle className="text-center text-lg font-bold text-brand-component-text-dark">
            {title}
          </AlertDialogTitle>
          {description ? (
            <AlertDialogDescription className="text-center text-sm font-medium text-brand-component-text-gray">
              {description}
            </AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        <AlertDialogFooter className="flex gap-4">
          <AlertDialogCancel className="h-12 flex-1 border-brand-component-stroke-dark-soft text-base font-semibold text-brand-component-text-gray shadow-none">
            {cancelLabel}
          </AlertDialogCancel>
          <Button
            type="button"
            className="h-12 flex-1 items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark font-semibold shadow-sm transition-all hover:opacity-70"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
