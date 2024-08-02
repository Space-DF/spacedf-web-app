"use client"

import { GoogleIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import React, { memo } from "react"

const AuthenticateWithGoogle = ({ isSignUp }: { isSignUp: boolean }) => {
  // const { toast } = useToast()
  const authenticatedMethodText = isSignUp ? "Sign up" : "Sign in"
  return (
    <div className="w-full self-start animate-opacity-display-effect">
      <p className="font-medium mb-2">
        {authenticatedMethodText} with social account
      </p>
      <Button
        variant="outline"
        className="w-full items-center gap-2 h-10 font-medium border-brand-stroke-dark-soft dark:border-brand-stroke-outermost"
        onClick={() => {
          console.log("clicked")

          toast.success("Scheduled: Catch up")
        }}
      >
        <GoogleIcon />
        {authenticatedMethodText} with Google
      </Button>
    </div>
  )
}

export default memo(AuthenticateWithGoogle)
