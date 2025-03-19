import { InputWithIcon } from '@/components/ui/input'
import { Search } from 'lucide-react'
import React, { Dispatch, memo, SetStateAction } from 'react'
import mqttLogo from '/public/images/mqtt.png'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const PROTOCOLS = [
  {
    logo: mqttLogo,
    name: 'MQTT',
    id: Math.random(),
  },
  {
    logo: mqttLogo,
    name: 'MQTT',
    id: Math.random(),
  },
  {
    logo: mqttLogo,
    name: 'MQTT',
    id: Math.random(),
  },
  {
    logo: mqttLogo,
    name: 'MQTT',
    id: Math.random(),
  },
  {
    logo: mqttLogo,
    name: 'MQTT',
    id: Math.random(),
  },
  {
    logo: mqttLogo,
    name: 'MQTT',
    id: Math.random(),
  },
  {
    logo: mqttLogo,
    name: 'MQTT',
    id: Math.random(),
  },
  {
    logo: mqttLogo,
    name: 'MQTT',
    id: Math.random(),
  },
]

interface Props {
  selectedProtocol?: number
  setSelectedProtocol: Dispatch<SetStateAction<number | undefined>>
}

const SelectProtocol: React.FC<Props> = ({
  selectedProtocol,
  setSelectedProtocol,
}) => {
  const handleSelectProtocol = (id: number) => {
    setSelectedProtocol((prev) => (prev === id ? undefined : id))
  }
  return (
    <div className="space-y-2">
      <InputWithIcon
        placeholder="Search or add brand"
        prefixCpn={<Search size={16} />}
      />
      <div className="grid grid-cols-4 gap-2 overflow-y-auto">
        {PROTOCOLS.map((protocol) => (
          <button
            className={cn(
              'border border-brand-component-stroke-dark-soft rounded-md',
              selectedProtocol === protocol.id &&
                'border-brand-component-text-dark'
            )}
            key={protocol.id}
            onClick={() => handleSelectProtocol(protocol.id)}
          >
            <div className="flex flex-col space-y-2 justify-center items-center mb-2 mt-4">
              <Image
                src={protocol.logo}
                width={40}
                height={40}
                alt="logo brand"
              />
              <span className="text-brand-component-text-dark text-xs font-medium">
                {protocol.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default memo(SelectProtocol)
