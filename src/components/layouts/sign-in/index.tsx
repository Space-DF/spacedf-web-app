import { SpaceDFLogoFull } from "@/components/icons"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { LogIn, X } from "lucide-react"
import React from "react"

import { Drawer as DrawerPrimitive } from "vaul"
import SignInWithGoogle from "./sign-in-with-google"
import { Separator } from "@/components/ui/separator"
import SignInForm from "./sign-in-form"
import QRCode from "./qr-code"

type SignInProps = {
  isCollapsed?: boolean
}

const SignIn = ({ isCollapsed }: SignInProps) => {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="h-10 w-full p-[2px] bg-transparent border border-brand-bright-lavender rounded-xl min-w-10 text-white cursor-pointer group">
          <div className="flex items-center justify-center border-brand-bright-lavender rounded-lg bg-gradient-to-r from-brand-very-light-blue to-brand-bright-lavender h-full group-hover:opacity-80 duration-300">
            {isCollapsed ? (
              <LogIn size={18} />
            ) : (
              <p className="text-xs truncate max-w-[90%] font-medium">
                Register your own organization
              </p>
            )}
          </div>
        </div>
      </DrawerTrigger>
      <DrawerContent className="h-[95%] dark:bg-brand-fill-outermost text-brand-text-dark dark:text-white">
        <div className="px-4 pb-4 border-b border-b-brand-stroke-dark-soft dark:border-b-brand-stroke-outermost flex items-center justify-between">
          <p className="font-semibold text-base">Sign in</p>

          <DrawerPrimitive.Close>
            <X
              size={20}
              className="hover:scale-110 duration-300 hover:-rotate-90 dark:text-brand-dark-text-gray cursor-pointer"
            />
          </DrawerPrimitive.Close>
        </div>

        <div className="flex items-center justify-center w-full h-full p-10 md:p-0 overflow-auto">
          <div className="w-full md:max-w-md flex items-center flex-col">
            <SpaceDFLogoFull />
            <p className="text-3xl font-semibold my-6">Sign in</p>

            <SignInWithGoogle />

            <Separator className="my-6" />

            <SignInForm />

            <div className="mt-6">
              <QRCode />
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

export default SignIn
