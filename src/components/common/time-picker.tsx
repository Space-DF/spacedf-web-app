'use client'

import { useEffect, useState, forwardRef, useRef } from 'react'
import { Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export interface TimePickerProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value'
  > {
  value?: string
  onChange?: (value: string) => void
  format?: '12h' | '24h'
  hourStep?: number
  minuteStep?: number
  disabled?: boolean
  placeholder?: string
}

export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(
  (
    {
      value = '',
      onChange,
      format = '24h',
      hourStep = 1,
      minuteStep = 1,
      disabled = false,
      placeholder = 'Select a time',
      className,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState(value)
    const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({})

    const parseTime = (timeStr: string) => {
      if (!timeStr) return { hours: '00', minutes: '00' }

      const parts = timeStr.split(':')
      let hours = parseInt(parts[0]) || 0
      const minutes = parseInt(parts[1]) || 0

      if (format === '12h') {
        if (hours > 12) hours -= 12
        if (hours === 0) hours = 12
      }

      return {
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
      }
    }

    const { hours, minutes } = parseTime(inputValue || value)

    const getHours = () => {
      const maxHours = format === '12h' ? 12 : 24
      const arr = []
      for (let i = 0; i < maxHours; i += hourStep) {
        arr.push(String(i).padStart(2, '0'))
      }
      return arr
    }

    const getMinutes = () => {
      const arr = []
      for (let i = 0; i < 60; i += minuteStep) {
        arr.push(String(i).padStart(2, '0'))
      }
      return arr
    }

    const handleTimeChange = (type: 'hours' | 'minutes', newValue: string) => {
      let newHours = parseInt(hours)
      let newMinutes = parseInt(minutes)

      if (type === 'hours') {
        newHours = parseInt(newValue)
      } else if (type === 'minutes') {
        newMinutes = parseInt(newValue)
      }

      const displayHours = newHours

      const timeStr = `${String(displayHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`

      setInputValue(timeStr)
      onChange?.(timeStr)
      scrollToSelected(type, newValue)
    }

    const scrollToSelected = (type: 'hours' | 'minutes', value: string) => {
      const element = scrollRefs.current[type]
      if (element) {
        const items = element.querySelectorAll('[data-time-item]')
        items.forEach((item) => {
          if (item.textContent === value) {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }
        })
      }
    }

    useEffect(() => {
      if (isOpen) {
        setTimeout(() => {
          scrollToSelected('hours', hours)
          scrollToSelected('minutes', minutes)
        }, 0)
      }
    }, [isOpen, hours, minutes])

    const handleClear = () => {
      setInputValue('')
      onChange?.('')
    }

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground cursor-pointer" />
            <Input
              ref={ref}
              value={inputValue || value}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              className={cn('pr-10 pl-8', className)}
              readOnly
              {...props}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 transform"
              onPointerDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleClear()
              }}
            >
              <X className=" h-4 w-4  text-muted-foreground cursor-pointer" />
            </button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0" align="start">
          <div className="flex gap-0 p-4 bg-white">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-muted-foreground mb-2">
                Hour
              </span>
              <ScrollArea className="h-56 w-12">
                <div
                  ref={(el) => {
                    if (el) scrollRefs.current['hours'] = el
                  }}
                  className="flex flex-col"
                >
                  {getHours().map((hour) => (
                    <button
                      key={hour}
                      data-time-item
                      onClick={() => handleTimeChange('hours', hour)}
                      className={cn(
                        'py-2 px-2 text-sm font-medium text-center hover:bg-accent rounded transition-colors',
                        hours === hour
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'text-foreground'
                      )}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex items-end pb-4 px-1" />
            <div className="flex flex-col items-center">
              <span className="text-xs font-semibold text-muted-foreground mb-2">
                Minute
              </span>
              <ScrollArea className="h-56 w-12">
                <div
                  ref={(el) => {
                    if (el) scrollRefs.current['minutes'] = el
                  }}
                  className="flex flex-col"
                >
                  {getMinutes().map((minute) => (
                    <button
                      key={minute}
                      data-time-item
                      onClick={() => handleTimeChange('minutes', minute)}
                      className={cn(
                        'py-2 px-2 text-sm font-medium text-center hover:bg-accent rounded transition-colors',
                        minutes === minute
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                          : 'text-foreground'
                      )}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <div className="border-t p-3 flex justify-end">
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Confirm
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }
)

TimePicker.displayName = 'TimePicker'
