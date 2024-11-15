/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { X } from 'lucide-react'
import { useSession } from 'next-auth/react'
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
  const { openDrawer, setOpenDrawer, organizationDomain } = useIdentityStore(
    useShallow((state) => ({
      openDrawer: state.openDrawerIdentity,
      organizationDomain: state.organizationDomain,

      setOpenDrawer: state.setOpenDrawerIdentity,
    })),
  )
  const { status } = useSession()
  const { isOrganization } = useOrganization()

  const [identityStep, setIdentityStep] =
    useState<`${IdentityStepEnum}`>('authentication')

  const isAuthenticated = status === 'authenticated'

  useEffect(() => {
    if (!isAuthenticated) return setIdentityStep('authentication')

    if (!!organizationDomain) return setIdentityStep('initial-organization')
    if (!isOrganization) return setIdentityStep('create-organization')
  }, [isAuthenticated, organizationDomain])

  const dataDrawer = getDrawerData(identityStep)

  return (
    <>
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerContent className="h-[95vh] text-brand-text-dark dark:bg-brand-fill-outermost dark:text-white">
          <div className="flex size-full flex-col overflow-auto">
            <div className="sticky top-0 z-40 flex items-center justify-between border-b border-b-brand-stroke-dark-soft bg-white px-4 pb-4 dark:border-b-brand-stroke-outermost dark:bg-brand-fill-outermost">
              <p className="text-base font-semibold">{dataDrawer.title}</p>

              <DrawerPrimitive.Close>
                <X
                  size={20}
                  className="cursor-pointer duration-300 hover:-rotate-90 hover:scale-110 dark:text-brand-dark-text-gray"
                />
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
      {/* <Guideline /> */}
    </>
  )
}

export default Identity
