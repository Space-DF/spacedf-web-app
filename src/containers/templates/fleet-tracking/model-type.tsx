'use client'

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useFleetTrackingStore } from '@/stores/template/fleet-tracking'
import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

const modelTypes = ['2d', '3d']

export const ModelType = () => {
  const [modelType, setModelType] = useState<'2d' | '3d'>(
    (localStorage.getItem('fleet-tracking:modelType') as '2d' | '3d') || '2d'
  )

  const { setModelTypeStore } = useFleetTrackingStore(
    useShallow((state) => ({
      setModelTypeStore: state.setModelType,
    }))
  )

  return (
    <div className="absolute top-3 right-20">
      <ToggleGroup
        onValueChange={(value) => {
          if (!value) return

          window.dispatchEvent(
            new CustomEvent('modelTypeUpdated', {
              detail: {
                modelType: value,
              },
            })
          )

          setModelType(value as '2d' | '3d')
          setModelTypeStore(value as '2d' | '3d')
        }}
        type="single"
        variant="default"
        defaultValue="2d"
        value={modelType}
        className="bg-muted shadow-lg rounded-lg gap-0"
      >
        {modelTypes.map((type) => (
          <ToggleGroupItem
            key={type}
            value={type}
            className="data-[state=on]:bg-brand-dark-fill-secondary data-[state=on]:text-white"
          >
            {type.toUpperCase()}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
