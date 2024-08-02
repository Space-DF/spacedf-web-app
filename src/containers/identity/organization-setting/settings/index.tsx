"use client"

import { useSession } from "next-auth/react"
import { useEffect, useMemo, useState } from "react"
import SettingLayout from "../setting-layout"
import { UpdateProfile } from "./update-profile"
import CreateOrganization from "./create-organization"
import { cn } from "@/lib/utils"

type SettingStep = "user-infos" | "create-organization"

const Settings = () => {
  const contents = useMemo(() => {
    return {
      title: "Create your organization.",
      subscription: "Give  your organization a name and icon or avatar.",
      children: <CreateOrganization />,
    }
  }, [])

  return (
    <SettingLayout title={contents.title} subscription={contents.subscription}>
      <div className={cn("animate-opacity-display-effect")}>
        {contents.children}
      </div>
    </SettingLayout>
  )
}

export default Settings
