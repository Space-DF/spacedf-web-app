'use client'

import { useTranslations } from 'next-intl'
import AccessRestrictedLayout from '@/components/common/access-restricted'

type SpaceLockedProps = {
  backHref: string
}

const SpaceLocked = ({ backHref }: SpaceLockedProps) => {
  const t = useTranslations('space')

  return (
    <AccessRestrictedLayout
      title={t('this_space_is_locked')}
      description={t('this_space_is_locked_description')}
      backHref={backHref}
      backLabel={t('back_to_your_space')}
    />
  )
}

export default SpaceLocked
