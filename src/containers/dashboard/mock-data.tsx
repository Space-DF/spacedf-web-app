'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronDown } from 'lucide-react'

export const MockData = () => {
  return (
    <div>
      {/*<Title title="Gas Usage (kwh)" />*/}
      {/*<Title title="Trip & Mileage" />*/}
      {/*<Title title="Activity Summary" />*/}
    </div>
  )
}

const Title = ({ title }: { title: string }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-semibold text-brand-component-text-dark">
      {title}
    </span>
    <Select>
      <SelectTrigger
        className="h-7 w-28 px-2 py-1 text-[13px]"
        icon={<ChevronDown size={16} />}
      >
        <SelectValue placeholder="Last 7 days" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="apple">Last 7 days</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
)
