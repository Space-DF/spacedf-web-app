import { SelectProps } from '@radix-ui/react-select'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { ChevronDown } from 'lucide-react'

type Timezone = {
  code: string
  label: string
}

const timezones = [
  {
    label: '(UTC+07:00) Bangkok, Hanoi, Jakarta',
    code: '1',
  },
]

export const SelectTimezone = (props: SelectProps) => {
  const [selectedValue, setSelectedValue] = useState(timezones[0].code)
  const timezoneSelected = timezones[0]

  return (
    <Select
      onValueChange={(value) => {
        setSelectedValue(value)
      }}
      {...props}
      defaultValue={selectedValue}
    >
      <SelectTrigger
        className="h-10 rounded-lg border-none bg-brand-fill-dark-soft px-3 py-2 text-start shadow-none"
        icon={<ChevronDown size={16} className="text-brand-text-gray" />}
      >
        <SelectValue>
          <Timezone {...timezoneSelected} />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {timezones.map((tz) => {
            return (
              <SelectItem key={tz.code} value={tz.code}>
                <Timezone {...tz} />
              </SelectItem>
            )
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

const Timezone = (country: Timezone) => {
  return (
    <p className="text-sm font-medium text-brand-heading dark:text-white">
      {country.label}
    </p>
  )
}
