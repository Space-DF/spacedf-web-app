import { GoogleIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import React from "react"

const SignInWithGoogle = () => {
  return (
    <div className="w-full self-start">
      <p className="font-medium mb-2">Sign in with social account</p>
      <Button
        variant="outline"
        className="w-full items-center gap-2 h-10 font-medium border-brand-stroke-dark-soft dark:border-brand-stroke-outermost"
      >
        <GoogleIcon />
        Sign in with Google
      </Button>
    </div>
  )
}

export default SignInWithGoogle
