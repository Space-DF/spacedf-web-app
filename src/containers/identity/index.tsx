/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { useOrganization } from "@/hooks/useOrganization"
import { useIdentityStore } from "@/stores/identity-store"
import { X } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Drawer as DrawerPrimitive } from "vaul"
import { useShallow } from "zustand/react/shallow"
import Authentication from "./auth"
import { IdentityStepEnum } from "@/constants"
import OrganizationSetting from "./organization-setting"

const getDrawerData = (currentStep: `${IdentityStepEnum}`) => {
  let data = {
    title: "Authentication",
    children: <Authentication />,
  }

  switch (currentStep) {
    case "create-organization":
      return {
        ...data,
        title: "Organization Setting",
        children: <OrganizationSetting />,
      }

    default:
      return data
  }
}

const Identity = () => {
  const { openDrawer, setOpenDrawer } = useIdentityStore(
    useShallow((state) => ({
      openDrawer: state.openDrawerIdentity,
      setOpenDrawer: state.setOpenDrawerIdentity,
    }))
  )
  const { status } = useSession()
  const { isOrganization } = useOrganization()

  const [identityStep, setIdentityStep] =
    useState<`${IdentityStepEnum}`>("authentication")

  const isAuthenticated = status === "authenticated"

  useEffect(() => {
    if (!isAuthenticated) return setIdentityStep("authentication")

    if (!isOrganization) return setIdentityStep("create-organization")
  }, [isAuthenticated])

  const dataDrawer = getDrawerData(identityStep)

  return (
    <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
      <DrawerContent className="h-[95vh] dark:bg-brand-fill-outermost text-brand-text-dark dark:text-white">
        <div className="w-full h-full overflow-auto flex flex-col">
          <div className="px-4 pb-4 border-b border-b-brand-stroke-dark-soft dark:border-b-brand-stroke-outermost flex items-center justify-between sticky top-0 bg-white dark:bg-brand-fill-outermost z-40">
            <p className="font-semibold text-base">{dataDrawer.title}</p>

            <DrawerPrimitive.Close>
              <X
                size={20}
                className="hover:scale-110 duration-300 hover:-rotate-90 dark:text-brand-dark-text-gray cursor-pointer"
              />
            </DrawerPrimitive.Close>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-center w-full h-full">
              {dataDrawer.children}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default Identity
