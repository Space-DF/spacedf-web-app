'use client'

import { useTranslations } from 'next-intl'
import React, { memo } from 'react'
import { GoogleIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { useSocialAuth } from './hooks/useSocialAuth'
const AuthenticateWithGoogle = () => {
  const t = useTranslations('signUp')
  const { trigger, isMutating } = useSocialAuth()

  const handleSocialAuth = async () => {
    const response = await trigger({ provider: 'google' })
    window.location.href = response.redirectUrl
  }
  return (
    <div className="w-full animate-opacity-display-effect self-start">
      <p className="mb-2 text-sm font-medium">
        {t('continue_with_social_account')}
      </p>
      <Button
        variant="outline"
        className="h-12 w-full items-center gap-2 rounded-lg border-brand-stroke-dark-soft font-medium dark:border-brand-stroke-outermost"
        onClick={handleSocialAuth}
        loading={isMutating}
      >
        <GoogleIcon />
        {t('continue_with_provider', { provider: 'Google' })}
      </Button>
    </div>
  )
}

export default memo(AuthenticateWithGoogle)
