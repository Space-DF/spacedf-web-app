'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useSpaceStore } from '@/stores'

export default function CreateSpaceHeader() {
  const router = useRouter()
  const t = useTranslations('space')
  const shouldBackPreviousPage = useSpaceStore(
    (state) => state.shouldBackPreviousPage
  )
  const setLoading = useSpaceStore((state) => state.setLoading)
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    setLoading()
    setOpen(false)
    // @TODO: handle redirect to new space
  }

  return (
    <div className="flex items-center gap-1 border-b border-brand-stroke-dark-soft p-4 font-semibold text-brand-component-text-dark dark:text-white">
      <ArrowLeft
        size={20}
        className="cursor-pointer text-brand-text-gray"
        onClick={() => {
          if (shouldBackPreviousPage) {
            setOpen(true)
            return
          }
          router.back()
        }}
      />
      {t('create_new_space')}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-md p-4 sm:rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center font-bold text-brand-component-text-dark">
              {t('are_you_sure')}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium text-brand-text-gray">
              {t(
                'are_you_sure_you_want_to_go_back_you_can_still_add_your_member_later'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-4">
            <AlertDialogCancel className="h-12 flex-1 rounded-lg border-brand-stroke-dark-soft text-base font-semibold text-brand-text-gray shadow-none">
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-12 flex-1 rounded-lg text-base font-semibold shadow-none"
              onClick={handleConfirm}
            >
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
