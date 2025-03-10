import React, { Dispatch, memo, SetStateAction } from 'react'
import RakLogo from '/public/images/rak.png'
import { InputWithIcon } from '@/components/ui/input'
import { ChevronDown, Search } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTranslations } from 'next-intl'

const BRANDS = [
  {
    id: Math.random(),
    name: 'RAKWireless',
    logo: RakLogo,
  },
]

const DEVICE_TYPES = [
  {
    label: 'GPS Tracker',
    value: 'GPS Tracker',
  },
]

interface Props {
  selectedBrand?: number
  setSelectedBrand: Dispatch<SetStateAction<number | undefined>>
  deviceType?: string
  setDeviceType: Dispatch<SetStateAction<string | undefined>>
}

const AddDeviceManual: React.FC<Props> = ({
  selectedBrand,
  setSelectedBrand,
  deviceType,
  setDeviceType,
}) => {
  const t = useTranslations('organization')

  const handleSelectedBrand = (id: number) => {
    setSelectedBrand(selectedBrand === id ? undefined : id)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <InputWithIcon
          placeholder="Search or add brand"
          prefixCpn={<Search size={16} />}
        />
        <div className="grid grid-cols-4 gap-2 overflow-y-auto">
          {BRANDS.map((brand) => (
            <button
              className={cn(
                'border border-brand-component-stroke-dark-soft rounded-md hover:border-brand-component-stroke-dark duration-150',
                selectedBrand === brand.id &&
                  'border-brand-component-stroke-dark'
              )}
              onClick={() => handleSelectedBrand(brand.id)}
              key={brand.id}
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
      {selectedBrand && (
        <>
          <div className="w-full bg-brand-component-stroke-dark-soft h-px" />
          <Select
            value={deviceType}
            onValueChange={(value) => setDeviceType(value)}
          >
            <SelectTrigger
              className="w-full bg-brand-fill-dark-soft"
              icon={
                <ChevronDown size={18} className="text-brand-stroke-gray" />
              }
            >
              <SelectValue
                placeholder={
                  <span className="text-brand-component-text-gray font-medium">
                    {t('select_device_type')}
                  </span>
                }
              />
            </SelectTrigger>
            <SelectContent>
              {DEVICE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}
    </div>
  )
}

export default memo(AddDeviceManual)
