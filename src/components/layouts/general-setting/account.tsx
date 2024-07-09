import { Button } from "@/components/ui/button"
import { InputWithIcon } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { LockKeyhole, Mail } from "lucide-react"
import React from "react"

const Account = () => {
  return (
    <div className="animate-opacity-display-effect">
      <div className="space-y-4">
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email">Email</Label>
          <InputWithIcon
            defaultValue={"spacedf.user@gmail.com"}
            className="border-none shadow-none rounded-lg h-10"
            prefixCpn={<Mail size={16} />}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="grid w-full items-center gap-1.5 flex-1">
            <Label htmlFor="email" className="gap-2">
              Authenticator App
            </Label>
            <p className="text-xs text-brand-text-gray font-normal">
              Once you login SpaceDF, we will send you a notification in email.
            </p>
          </div>

          <Switch defaultChecked />
        </div>
        <Separator className="!my-6" />

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email">Current password</Label>
          <InputWithIcon
            placeholder="Password"
            className="border-none shadow-none rounded-lg h-10"
            prefixCpn={<LockKeyhole size={16} />}
          />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email">New password</Label>
          <InputWithIcon
            placeholder="New password"
            className="border-none shadow-none rounded-lg h-10"
            prefixCpn={<LockKeyhole size={16} />}
          />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="email">Confirm new password</Label>
          <InputWithIcon
            placeholder="Confirm new password"
            className="border-none shadow-none rounded-lg h-10"
            prefixCpn={<LockKeyhole size={16} />}
          />
        </div>

        <div className="flex mt-4 gap-2">
          <Button size="lg" className="w-full">
            Update password
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Account
