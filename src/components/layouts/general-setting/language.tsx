import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { SelectCountry } from "@/components/ui/select-country"
import React from "react"

const Language = () => {
  return (
    <div className="animate-opacity-display-effect">
      <div className="space-y-4">
        <div className="grid w-full items-center gap-1.5 flex-1">
          <Label htmlFor="email" className="gap-2 text-brand-text-gray">
            Language
          </Label>
          <SelectCountry />
          <p className="text-xs text-brand-text-gray font-normal">
            Choose the language you’d like to use.
          </p>
        </div>

        <div className="grid w-full items-center gap-1.5 flex-1">
          <Label htmlFor="email" className="gap-2 text-brand-text-gray">
            Time zone
          </Label>

          <div className="flex items-center space-x-2">
            <Checkbox id="terms" defaultChecked />
            <label
              htmlFor="terms"
              className="text-xs font-medium text-brand-text-dark leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Set time zone automatically
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Language
