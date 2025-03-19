import Image from 'next/image'
import success from '/public/images/success.svg'
import { memo } from 'react'
import { useTranslations } from 'next-intl'

interface Props {
  deviceType?: string
}

const AddDeviceSuccessModal: React.FC<Props> = ({ deviceType }) => {
  const t = useTranslations('organization')
  return (
    <div className="space-y-2 items-center w-full flex flex-col justify-center">
      <Image src={success} width={52} height={52} alt="success" />
      <p className="font-bold text-2xl text-brand-component-text-dark">
        {t('congratulations')}
      </p>
      <span className="text-base font-medium text-brand-component-text-gray">
        {t('add_successful')} “
        <span className="font-semibold text-brand-component-text-dark text-base">
          {deviceType || 'GPS Tracker'}
        </span>
        ” {t('to_space')}
      </span>
    </div>
  )
}

export default memo(AddDeviceSuccessModal)
