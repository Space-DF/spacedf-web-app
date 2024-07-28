import { SpaceDFLogoFull } from "@/components/icons"
import React, { useState } from "react"
import AuthenticateWithGoogle from "./authenticate-with-google"
import { Separator } from "@/components/ui/separator"
import SignUpForm from "./sign-up-form"
import SignInForm from "./sign-in-form"
import QrCode from "./qr-code"

export type AuthenticationMethod = "signIn" | "signUp"

const Authentication = () => {
  const [authenticateMethod, setAuthenticateMethod] =
    useState<AuthenticationMethod>("signIn")

  const isSignUp = authenticateMethod === "signUp"

  return (
    <div className="w-full md:max-w-md h-full flex items-center flex-col justify-center my-10">
      <SpaceDFLogoFull />
      <p className="text-3xl font-semibold my-6">
        {isSignUp ? "Sign up" : "Sign in"}
      </p>

      <AuthenticateWithGoogle isSignUp={isSignUp} />

      <Separator className="my-6" />

      {isSignUp ? (
        <SignUpForm setAuthMethod={setAuthenticateMethod} />
      ) : (
        <SignInForm setAuthMethod={setAuthenticateMethod} />
      )}

      <div className="mt-6">
        <QrCode />
      </div>
    </div>
  )
}

export default Authentication
