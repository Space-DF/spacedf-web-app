import React from 'react'
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import DefaultColor from '@/components/icons/default-color'
import { useTranslations } from 'next-intl'
import { SourceColor } from '@/constants'

interface Props {
  fieldValue: string
  color_codes?: string[]
}
const ColorSelect = ({ fieldValue, color_codes = SourceColor }: Props) => {
  const t = useTranslations('dashboard')
  return (
    <>
      <SelectTrigger
        icon={<ChevronDown className="w-3 text-brand-icon-gray" />}
        className="border-none bg-brand-component-fill-dark-soft outline-none ring-0 focus:ring-0 dark:dark:bg-brand-heading"
      >
        <SelectValue
          placeholder={
            <span className="text-brand-component-text-gray">
              {t('select_color')}
            </span>
          }
        >
          {fieldValue && fieldValue !== '171A28' ? (
            <div className="flex items-center space-x-2">
              <div
                className="h-4 w-4 rounded-full"
                style={{
                  backgroundColor: `#${fieldValue}`,
                }}
              />
              <p className="text-brand-component-text-dark">{fieldValue}</p>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="flex h-4 w-4 items-center justify-center overflow-hidden rounded-full">
                <DefaultColor width={100} height={100} />
              </div>
              <p className="text-brand-component-text-dark">Default</p>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)] bg-brand-component-fill-dark-soft dark:bg-brand-heading">
        <SelectGroup className="flex flex-wrap gap-2">
          <SelectItem
            showCheckIcon={false}
            value="171A28"
            className="m-0 h-6 w-6 rounded-md border-brand-component-stroke-dark p-0"
          >
            <DefaultColor
              className={cn(
                'stroke-brand-component-stroke-dark-soft hover:stroke-brand-component-stroke-dark',
                fieldValue === '171A28'
                  ? 'stroke-brand-component-stroke-dark dark:stroke-brand-stroke-gray'
                  : ''
              )}
            />
          </SelectItem>
          {color_codes.map((color: string) => (
            <SelectItem
              key={color}
              showCheckIcon={false}
              value={color}
              className="m-0 h-6 w-6 rounded-md border-brand-component-stroke-dark p-0"
            >
              <div
                className={cn(
                  'h-6 w-6 rounded-md border border-transparent hover:border-brand-component-stroke-dark',
                  fieldValue === color
                    ? 'border-brand-component-stroke-dark dark:border-brand-stroke-gray'
                    : ''
                )}
                style={{
                  backgroundColor: `#${color}`,
                }}
              />
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </>
  )
}

export default ColorSelect
