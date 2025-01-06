'use client'

import React from 'react'
import SignUpForm from './sign-up-form'
import VerifyCodeForm from './verify-code-form'
import { useIdentityStore } from '@/stores/identity-store'
import { useShallow } from 'zustand/react/shallow'

export default function SignUpContainer() {
  const rootAuth = useIdentityStore(useShallow((state) => state.rootAuth))

  return <>{rootAuth[0] === 'sign-up' ? <SignUpForm /> : <VerifyCodeForm />}</>
}
