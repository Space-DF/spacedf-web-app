import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { ArrowLeft } from 'lucide-react'

export function SpacePreviewImage() {
  const t = useTranslations('space')
  return (
    <div className="relative w-1/2 flex-1">
      <Button
        size="sm"
        className="absolute left-4 top-4 items-center gap-2 rounded-lg border-4 border-brand-heading bg-brand-fill-outermost text-sm font-semibold text-white shadow-sm dark:border-brand-stroke-outermost"
      >
        <ArrowLeft size={20} />
        {t('back_to_home')}
      </Button>
    </div>
  )
}
