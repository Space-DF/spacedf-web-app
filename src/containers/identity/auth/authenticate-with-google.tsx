'use client'

import { GoogleIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import React, { memo } from 'react'

const AuthenticateWithGoogle = ({ isSignUp }: { isSignUp: boolean }) => {
  // const { toast } = useToast()
  const authenticatedMethodText = isSignUp ? 'Sign up' : 'Sign in'
  return (
    <div className="w-full animate-opacity-display-effect self-start">
      <p className="mb-2 font-medium">
        {authenticatedMethodText} with social account
      </p>
      <Button
        variant="outline"
        className="h-10 w-full items-center gap-2 border-brand-stroke-dark-soft font-medium dark:border-brand-stroke-outermost"
        onClick={() => {
          console.log('clicked')

          toast.success('Scheduled: Catch up')
        }}
      >
        <GoogleIcon />
        {authenticatedMethodText} with Google
      </Button>
    </div>
  )
}

export default memo(AuthenticateWithGoogle)
