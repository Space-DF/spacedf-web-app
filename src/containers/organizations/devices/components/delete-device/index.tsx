import { Trash } from '@/components/icons/trash'
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
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

interface Props {
  onRemove: () => void
}

const DialogDeleteDevice: React.FC<Props> = ({ onRemove }) => {
  const [open, setOpen] = useState(false)
  const handleRemove = () => {
    onRemove()
    setOpen(false)
  }

  const t = useTranslations('organization')

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button className="border border-brand-component-stroke-dark-soft rounded-lg p-2">
          <Trash className="size-4 text-brand-fill-outermost" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">
            {t('remove')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {t('confirm_remove_device')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="grid grid-cols-2 gap-x-4 w-full">
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <Button
              variant={'destructive'}
              className="bg-brand-component-fill-negative border-brand-component-hover-accent border-2"
              onClick={handleRemove}
            >
              {t('remove')}
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DialogDeleteDevice
