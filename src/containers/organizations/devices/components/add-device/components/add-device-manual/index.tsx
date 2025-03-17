import React, { Dispatch, memo, SetStateAction } from 'react'
import { InputWithIcon } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const BRANDS = [
  {
    id: Math.random(),
    name: 'RAK4631',
    protocol: 'Lorawan',
  },
  {
    id: Math.random(),
    name: 'RAK11200',
    protocol: 'Lorawan',
  },
  {
    id: Math.random(),
    name: 'RAK11310',
    protocol: 'Lorawan',
  },
  {
    id: Math.random(),
    name: 'WisMesh Pocket V2',
    protocol: 'Lorawan',
  },
  {
    id: Math.random(),
    name: 'WisMesh Pocket Mini',
    protocol: 'Lorawan',
  },
  {
    id: Math.random(),
    name: 'WisMesh Ethernet MQTT Gateway',
    protocol: 'Lorawan',
  },
  {
    id: Math.random(),
    name: 'RAK11200',
    protocol: 'Lorawan',
  },
  {
    id: Math.random(),
    name: 'RAK11200',
    protocol: 'Lorawan',
  },
]

interface Props {
  selectedBrand?: number
  setSelectedBrand: Dispatch<SetStateAction<number | undefined>>
}

const AddDeviceManual: React.FC<Props> = ({
  selectedBrand,
  setSelectedBrand,
}) => {
  const handleSelectedBrand = (id: number) => {
    setSelectedBrand(selectedBrand === id ? undefined : id)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <InputWithIcon
          placeholder="Search or add brand"
          prefixCpn={<Search size={16} />}
          className="w-full"
          wrapperClass="w-full"
        />
        <div className="grid grid-cols-4 gap-2 overflow-y-auto">
          {BRANDS.map((brand) => (
            <button
              className={cn(
                'border border-brand-component-stroke-dark-soft rounded-md hover:border-brand-component-stroke-dark duration-150 h-20',
                selectedBrand === brand.id &&
                  'border-brand-component-stroke-dark'
              )}
              onClick={() => handleSelectedBrand(brand.id)}
              key={brand.id}
            >
              <div className="flex flex-col justify-between h-full py-2 items-center">
                <span className="text-brand-component-text-dark text-xs font-medium w-40">
                  {brand.name}
                </span>
                <div className="text-brand-component-text-info text-xs font-semibold py-px px-2 bg-[#CCE9FF] rounded-sm">
                  {brand.protocol}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(AddDeviceManual)
