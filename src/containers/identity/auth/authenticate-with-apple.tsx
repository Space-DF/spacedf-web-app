'use client'

import React, { memo } from 'react'
import { toast } from 'sonner'
import { AppleIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

const AuthenticateWithApple = () => {
  const t = useTranslations('signUp')
  // const { toast } = useToast()
  return (
    <div className="mt-2 w-full animate-opacity-display-effect self-start">
      <Button
        className="h-12 w-full items-center gap-2 rounded-lg border-2 border-brand-component-stroke-dark bg-brand-component-fill-dark font-semibold text-white shadow-sm dark:border-brand-component-stroke-light"
        onClick={() => {
          console.log('clicked')
          toast.success('Scheduled: Catch up')
        }}
      >
        <AppleIcon />
        {t('continue_with_provider', { provider: 'Apple' })}
      </Button>
    </div>
  )
}

export default memo(AuthenticateWithApple)
