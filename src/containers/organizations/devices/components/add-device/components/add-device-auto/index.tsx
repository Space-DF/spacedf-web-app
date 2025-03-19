import React, { memo } from 'react'
import RakLogo from '/public/images/rak.png'
import { InputWithIcon } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronDown, Search } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const BRANDS = [
  {
    id: '1',
    name: 'RAKWireless',
    logo: RakLogo,
  },
  {
    id: Math.random(),
    name: 'RAKWireless',
    logo: RakLogo,
  },
  {
    id: Math.random(),
    name: 'RAKWireless',
    logo: RakLogo,
  },
  {
    id: Math.random(),
    name: 'RAKWireless',
    logo: RakLogo,
  },
  {
    id: Math.random(),
    name: 'RAKWireless',
    logo: RakLogo,
  },
  {
    id: Math.random(),
    name: 'RAKWireless',
    logo: RakLogo,
  },
  {
    id: Math.random(),
    name: 'RAKWireless',
    logo: RakLogo,
  },
  {
    id: Math.random(),
    name: 'RAKWireless',
    logo: RakLogo,
  },
]

const AddDeviceAuto = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <InputWithIcon
          placeholder="Search or add brand"
          prefixCpn={<Search size={16} />}
        />
        <div className="grid grid-cols-4 gap-2">
          {BRANDS.map((brand) => (
            <button
              className={cn(
                'border border-brand-component-stroke-dark-soft rounded-md',
                brand.id === '1' && 'border-brand-component-stroke-dark'
              )}
              key={brand.id}
              disabled
            >
              <div className="flex flex-col space-y-2 justify-center items-center mb-2 mt-4">
                <Image
                  src={brand.logo}
                  width={40}
                  height={40}
                  alt="logo brand"
                />
                <span className="text-brand-component-text-dark text-xs font-medium">
                  {brand.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="w-full h-px bg-brand-component-stroke-dark-soft" />
      <Select disabled value="gps-tracker">
        <SelectTrigger
          className="w-full bg-brand-component-fill-dark-soft"
          icon={<ChevronDown className="size-4 opacity-50" />}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="gps-tracker">GPS Tracker</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

export default memo(AddDeviceAuto)
