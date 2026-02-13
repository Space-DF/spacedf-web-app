import { DEMO_USER } from '@/constants'
import { useIsDemo } from '@/hooks/useIsDemo'
import { PropsWithChildren, useEffect } from 'react'
import { signIn } from 'next-auth/react'

export const AuthDemoProvider = ({ children }: PropsWithChildren) => {
  const isDemo = useIsDemo()

  useEffect(() => {
    if (isDemo) {
      signIn('credentials', {
        redirect: false,
        signUpSuccessfully: true,
        dataUser: JSON.stringify(DEMO_USER),
      })
    }
  }, [isDemo])

  return <>{children}</>
}
