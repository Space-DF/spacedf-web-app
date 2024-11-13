import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { SelectCountry } from '@/components/ui/select-country'
import { SelectTimezone } from '@/components/ui/select-timezone'

const Language = () => {
  return (
    <div className="animate-opacity-display-effect">
      <div className="space-y-4">
        <div className="grid w-full flex-1 items-center gap-1.5">
          <Label htmlFor="email" className="font-semibold">
            Language
          </Label>
          <SelectCountry />

          <p className="text-xs font-medium text-brand-text-gray">
            Choose the language you’d like to use.
          </p>
        </div>

        <div className="grid w-full flex-1 items-center gap-1.5">
          <Label htmlFor="email" className="font-semibold">
            Time zone
          </Label>
          <div className="flex items-center space-x-2">
            <Checkbox id="terms" defaultChecked />
            <label
              htmlFor="terms"
              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Set time zone automatically
            </label>
          </div>
          <SelectTimezone />
        </div>
      </div>
    </div>
  )
}

export default Language
