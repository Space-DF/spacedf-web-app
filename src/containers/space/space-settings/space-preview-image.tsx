'use client'

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
import { Button } from '@/components/ui/button'
import ImageWithBlur from '@/components/ui/image-blur'
import { useRouter } from '@/i18n/routing'
import { useSpaceSettings } from '@/stores/space-settings-store'
import { ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import SpaceDelete from '/public/images/space-delete.webp'
import SpaceInformation from '/public/images/space-information.webp'

export function SpacePreviewImage() {
  const router = useRouter()
  const params = useParams()
  const t = useTranslations('space')

  const step = useSpaceSettings((state) => state.step)
  const shouldBackToHome = useSpaceSettings((state) => state.shouldBackToHome)
  const isOpenAlertDialog = useSpaceSettings((state) => state.isOpenAlertDialog)
  const setOpenAlertDialog = useSpaceSettings(
    (state) => state.setOpenAlertDialog
  )

  const handleNavigateBack = () => {
    router.push(params.spaceSlug ? `/spaces/${params.spaceSlug}` : '/')
  }

  const handleBack = () => {
    if (shouldBackToHome) {
      setOpenAlertDialog(true)
      return
    }
    handleNavigateBack()
  }

  return (
    <div className="relative flex w-1/2 flex-1 items-center justify-center p-4">
      <Button
        onClick={handleBack}
        size="sm"
        className="absolute left-4 top-4 z-10 cursor-pointer items-center gap-2 rounded-lg border-4 border-brand-heading bg-brand-fill-outermost text-sm font-semibold text-white shadow-sm dark:border-brand-stroke-outermost"
      >
        <ArrowLeft size={20} />
        {t('back_to_home')}
      </Button>

      <div>
        {step === 'delete' && (
          <ImageWithBlur
            src={SpaceDelete}
            className="size-full object-contain"
            alt=""
          />
        )}
        {step !== 'delete' && (
          <ImageWithBlur
            src={SpaceInformation}
            className="size-full object-contain"
            alt=""
          />
        )}
      </div>
      <AlertDialog open={isOpenAlertDialog} onOpenChange={setOpenAlertDialog}>
        <AlertDialogContent className="dark:bg-brand-component-fill-outermost p-4 sm:max-w-[402px] sm:rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-lg font-bold text-brand-component-text-dark">
              {t('are_you_sure')}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium text-brand-component-text-gray">
              {t(
                'are_you_sure_you_want_to_cancel_all_changes_made_will_not_be_saved'
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-4">
            <AlertDialogCancel className="h-12 flex-1 border-brand-component-stroke-dark-soft text-base font-semibold text-brand-component-text-gray shadow-none">
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-12 flex-1 items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-dark text-base font-semibold text-white shadow-sm dark:border-brand-component-stroke-light"
              onClick={handleNavigateBack}
            >
              {t('confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
