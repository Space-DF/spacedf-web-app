'use client'

import { useTranslations } from 'next-intl'
import AccessRestrictedLayout from '@/components/common/access-restricted'

type AccessRestrictedProps = {
  backHref: string
}

const AccessRestricted = ({ backHref }: AccessRestrictedProps) => {
  const t = useTranslations('space')

  return (
    <AccessRestrictedLayout
      title={t('create_space_is_available_on_pro')}
      description={t('create_space_available_on_pro_description')}
      backHref={backHref}
      backLabel={t('back_to_your_space')}
    />
  )
}

export default AccessRestricted
