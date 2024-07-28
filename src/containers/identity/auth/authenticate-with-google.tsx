import { GoogleIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import React, { memo } from "react"

const AuthenticateWithGoogle = ({ isSignUp }: { isSignUp: boolean }) => {
  const authenticatedMethodText = isSignUp ? "Sign up" : "Sign in"
  return (
    <div className="w-full self-start animate-opacity-display-effect">
      <p className="font-medium mb-2">
        {authenticatedMethodText} with social account
      </p>
      <Button
        variant="outline"
        className="w-full items-center gap-2 h-10 font-medium border-brand-stroke-dark-soft dark:border-brand-stroke-outermost"
      >
        <GoogleIcon />
        {authenticatedMethodText} with Google
      </Button>
    </div>
  )
}

export default memo(AuthenticateWithGoogle)
