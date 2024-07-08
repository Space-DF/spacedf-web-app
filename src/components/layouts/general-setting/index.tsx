import { PropsWithChildren, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog"
import { CircleUser, Globe } from "lucide-react"
import { Laptop, SettingIcon } from "../../icons"
import { cn } from "@/lib/utils"
import Profile from "./profile"
import Account from "./account"
import Appearance from "./appearance"
import Language from "./language"

const settings = () => [
  {
    key: "profile",
    icon: <CircleUser size={16} />,
    label: "Profile",
  },
  {
    key: "account",
    icon: <SettingIcon />,
    label: "Account",
  },
  {
    key: "appearance",
    icon: <Laptop />,
    label: "Appearance",
  },
  {
    key: "language",
    icon: <Globe size={16} />,
    label: "Language",
  },
]

const GeneralSetting = ({ children }: PropsWithChildren) => {
  const [currentSetting, setCurrentSetting] = useState("profile")

  const renderSetting = useMemo(() => {
    switch (currentSetting) {
      case "profile":
        return <Profile />
      case "account":
        return <Account />
      case "appearance":
        return <Appearance />
      case "language":
        return <Language />
      default:
        return <></>
    }
  }, [currentSetting])

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px] text-brand-text-dark">
        <DialogHeader>
          <DialogTitle>General Setting</DialogTitle>
        </DialogHeader>
        <div className="flex ">
          <div className="w-[200px] border-r border-brand-stroke-dark-soft py-4">
            <div className="flex flex-col gap-1">
              {settings().map((setting) => {
                const isActive = setting.key === currentSetting

                return (
                  <div
                    key={setting.key}
                    className={cn(
                      "py-[6px] px-4 flex items-center gap-2 cursor-pointer duration-300 hover:bg-brand-fill-dark-soft hover:text-brand-text-dark",
                      isActive
                        ? "border-r-2 border-black bg-brand-fill-dark-soft"
                        : "border-none bg-transparent text-brand-text-gray"
                    )}
                    onClick={() => setCurrentSetting(setting.key)}
                  >
                    {setting.icon}
                    {setting.label}
                  </div>
                )
              })}
            </div>
          </div>
          <div
            className={cn(
              "flex-1 p-4 min-h-[350px]",
              currentSetting === "appearance" && "bg-brand-fill-surface"
            )}
          >
            {renderSetting}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GeneralSetting
