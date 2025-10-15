'use client'

import { ArrowLeftIcon, X } from 'lucide-react'
import { signOut } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { useShallow } from 'zustand/react/shallow'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { IdentityStepEnum } from '@/constants'
import { useOrganization } from '@/hooks/useOrganization'
import { useIdentityStore } from '@/stores/identity-store'
import Authentication from './auth'
import InitializingOrganization from './initializing-organization'
import OrganizationSetting from './organization-setting'
import Guideline from '@/containers/identity/guideline'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useAuthForm } from './auth/stores/useAuthForm'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useDecodedToken } from './auth/hooks/useDecodedToken'
import { DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Dialog } from '@/components/ui/dialog'
import Image from 'next/image'
import { useProfile } from '@/components/layouts/general-setting/hooks/useProfile'
import { AuthTypeEnum } from '@/types/auth'
import { toast } from 'sonner'
import { useAuthenticated } from '@/hooks/useAuthenticated'

const getDrawerData = (currentStep: `${IdentityStepEnum}`) => {
  const data = {
    title: 'Authentication',
    children: <Authentication />,
  }

  switch (currentStep) {
    case 'create-organization':
      return {
        ...data,
        title: 'Organization Setting',
        children: <OrganizationSetting />,
      }

    case IdentityStepEnum.INITIAL_ORGANIZATION:
      return {
        title: 'Initializing Organization',
        children: <InitializingOrganization />,
      }

    default:
      return data
  }
}

const Identity = () => {
  const { openDrawer, setOpenDrawer, organizationDomain, openGuideline } =
    useIdentityStore(
      useShallow((state) => ({
        openDrawer: state.openDrawerIdentity,
        organizationDomain: state.organizationDomain,
        openGuideline: state.openGuideline,
        setOpenDrawer: state.setOpenDrawerIdentity,
      }))
    )
  const t = useTranslations('signUp')
  const [isDifferentUser, setIsDifferentUser] = useState(false)

  const { setFormType, formType } = useAuthForm((state) => ({
    formType: state.formType,
    setFormType: state.setFormType,
  }))

  const { isOrganization } = useOrganization()
  const searchParams = useSearchParams()
  const [identityStep, setIdentityStep] =
    useState<`${IdentityStepEnum}`>('authentication')

  const isAuthenticated = useAuthenticated()

  useEffect(() => {
    if (!isAuthenticated) return setIdentityStep('authentication')

    if (!!organizationDomain) return setIdentityStep('initial-organization')
    if (!isOrganization) return setIdentityStep('create-organization')
  }, [isAuthenticated, organizationDomain])

  const token = searchParams.get('token')
  const type = searchParams.get('type')

  const { data: decodedToken } = useDecodedToken(token)

  const pathName = usePathname()

  const router = useRouter()
  const { data: me, isLoading: isMeLoading } = useProfile(isAuthenticated)

  useEffect(() => {
    const isDifferentUser =
      isAuthenticated &&
      !isMeLoading &&
      !!token &&
      !!me?.email &&
      me?.email !== decodedToken?.email_receiver &&
      !type
    setIsDifferentUser(isDifferentUser)
  }, [
    isAuthenticated,
    isMeLoading,
    token,
    me?.email,
    decodedToken?.email_receiver,
    type,
  ])

  useEffect(() => {
    if (!decodedToken) return
    const isTokenExpired =
      decodedToken && new Date(decodedToken.exp * 1000) < new Date()
    if (isTokenExpired) {
      toast.error(t('reset_password_link_expired'))
      return router.replace('/')
    }
    if (type === AuthTypeEnum.FORGET_PASSWORD && token && decodedToken) {
      setOpenDrawer(true)
      setFormType('createNewPassword')
    }
  }, [type, token, setOpenDrawer, setFormType, decodedToken])

  useEffect(() => {
    if (decodedToken && !isAuthenticated && !type) {
      setOpenDrawer(true)
      setFormType('signUp')
    }
  }, [decodedToken, isAuthenticated, setOpenDrawer, setFormType])

  const dataDrawer = getDrawerData(identityStep)

  const isOtp = formType === 'otp'

  const handleCancel = () => {
    setIsDifferentUser(false)
    router.replace(pathName)
  }

  const handleLogout = () => {
    signOut({
      redirect: false,
    })
    setIsDifferentUser(false)
    setOpenDrawer(true)
    setFormType('signUp')
  }

  const handleCloseDrawer = () => {
    setOpenDrawer(false)
    setFormType('signIn')
  }

  return (
    <>
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerContent className="h-[95vh] text-brand-text-dark dark:bg-brand-fill-outermost dark:text-white">
          <div className="flex size-full flex-col overflow-auto">
            <div className="sticky top-0 z-40 flex items-center justify-between border-b border-b-brand-stroke-dark-soft bg-white px-4 pb-4 dark:border-b-brand-stroke-outermost dark:bg-brand-fill-outermost">
              <p className="text-base font-semibold">
                {isOtp ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-12 w-full items-center gap-2 rounded-lg border-brand-stroke-dark-soft font-medium dark:border-brand-stroke-outermost text-brand-component-text-gray"
                      >
                        <ArrowLeftIcon className="size-4" />
                        {t('back')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="sm:max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-center font-bold text-brand-component-text-dark">
                          {t('cancel')}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                          {t('are_you_sure_you_want_to_cancel')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="grid grid-cols-2 gap-2">
                        <AlertDialogCancel asChild>
                          <Button
                            variant="outline"
                            className="text-brand-text-gray"
                          >
                            {t('cancel')}
                          </Button>
                        </AlertDialogCancel>
                        <AlertDialogAction asChild>
                          <Button onClick={() => setFormType('signUp')}>
                            {t('confirm')}
                          </Button>
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  dataDrawer.title
                )}
              </p>

              <DrawerPrimitive.Close asChild>
                <Button variant="ghost" size="icon" onClick={handleCloseDrawer}>
                  <X
                    size={20}
                    className="cursor-pointer duration-300 hover:-rotate-90 hover:scale-110 dark:text-brand-dark-text-gray"
                  />
                </Button>
              </DrawerPrimitive.Close>
            </div>
            <div className="flex-1">
              <div className="flex size-full items-center justify-center">
                {dataDrawer.children}
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
      {openGuideline && <Guideline />}
      <Dialog open={isDifferentUser}>
        <DialogTitle />
        <DialogContent showCloseIcon={false} className="p-4">
          <div className="flex w-full flex-col items-center justify-center gap-y-4">
            <div className="w-full justify-center flex">
              <Image
                src="/images/different-user.svg"
                alt="different-user"
                className="size-52"
                width={208}
                height={208}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <p className="text-center text-2xl font-bold text-brand-text-dark">
                {t('you_are_logged_into_a_different_account')}
              </p>
              <p className="text-center text-sm text-brand-text-gray">
                {t('you_are_logged_into_a_different_account_description')}
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleCancel}>
                {t('cancel')}
              </Button>
              <Button onClick={handleLogout}>{t('logout')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Identity
