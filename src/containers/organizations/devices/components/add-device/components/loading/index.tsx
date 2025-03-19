import LoadingFullScreen from '@/components/ui/loading-fullscreen'
import { useTranslations } from 'next-intl'
import React, { memo, useEffect } from 'react'

interface Props {
  onNextStep: () => void
}

const AddDeviceLoading: React.FC<Props> = ({ onNextStep }) => {
  const t = useTranslations('organization')
  useEffect(() => {
    const timeout = setTimeout(() => {
      onNextStep()
    }, 3000)
    return () => clearTimeout(timeout)
  }, [onNextStep])

  return (
    <div className="space-y-2">
      <LoadingFullScreen />
      <p className="text-brand-component-text-dark text-sm font-semibold text-center">
        {t('preparing')}
      </p>
    </div>
  )
}

export default memo(AddDeviceLoading)
