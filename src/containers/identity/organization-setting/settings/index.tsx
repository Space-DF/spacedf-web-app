"use client"

import { useSession } from "next-auth/react"
import { useEffect, useMemo, useState } from "react"
import SettingLayout from "../setting-layout"
import { UpdateProfile } from "./update-profile"
import CreateOrganization from "./create-organization"
import { cn } from "@/lib/utils"

type SettingStep = "user-infos" | "create-organization"

const Settings = () => {
  const [currentStep, setCurrentStep] = useState<SettingStep>(
    "create-organization"
  )
  const { data } = useSession()
  const hasUserInfo = !!data?.user?.name

  useEffect(() => {
    if (!hasUserInfo) {
      setCurrentStep("user-infos")
    }
  }, [hasUserInfo])

  const contents = useMemo(() => {
    switch (currentStep) {
      case "user-infos":
        return {
          title: "Create your profile.",
          subscription: "Give  your profile a name and icon or avatar.",
          children: (
            <UpdateProfile
              onNextStep={() => setCurrentStep("create-organization")}
            />
          ),
        }

      default:
        return {
          title: "Create your organization.",
          subscription: "Give  your organization a name and icon or avatar.",
          children: <CreateOrganization />,
        }
    }
  }, [currentStep])

  return (
    <SettingLayout title={contents.title} subscription={contents.subscription}>
      <div key={currentStep} className={cn("animate-opacity-display-effect")}>
        {contents.children}
      </div>
    </SettingLayout>
  )
}

export default Settings
