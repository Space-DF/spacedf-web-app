import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React from 'react'

interface Props {
  onSave: () => void
  disabled?: boolean
  isLoading?: boolean
}

const DialogSaveDevice: React.FC<Props> = ({ onSave, disabled, isLoading }) => {
  const t = useTranslations('organization')
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="border border-brand-component-stroke-dark-soft rounded-lg p-2 disabled:opacity-55"
          disabled={disabled}
        >
          <Check className="size-4 text-brand-component-text-positive" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            {t('save')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {t('confirm_save_changes')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="grid grid-cols-2 gap-x-4 w-full">
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <Button onClick={onSave} loading={isLoading}>
              {t('confirm')}
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DialogSaveDevice
