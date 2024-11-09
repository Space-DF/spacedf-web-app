import { Command as CommandPrimitive } from 'cmdk'

import React, { type KeyboardEvent, useCallback, useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export type Option = Record<'value' | 'label' | 'email', string> &
  Record<string, string>

type AutoCompleteProps = {
  options: Option[]
  emptyMessage: string
  value?: Option
  onValueChange?: (value: Option) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
  comma?: string[]
}

export const SearchMember = ({
  options,
  placeholder,
  emptyMessage,
  value,
  onValueChange,
  disabled,
  isLoading = false,
  comma = ['Enter'],
}: AutoCompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState<string>(value?.label || '')

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current
      if (!input) return

      // Keep the options displayed when the user is typing
      if (!isOpen) {
        setOpen(true)
      }

      // This is not a default behaviour of the <input /> field
      if (comma?.includes(event.key) && input.value !== '') {
        const optionToSelect = options.find(
          (option) => option.label === input.value,
        )
        if (optionToSelect) {
          onValueChange?.(optionToSelect)
        }
      }

      if (comma?.includes(event.key)) {
        input.focus()
      }
      if (event.key === 'Escape') {
        handleBlur()
      }
    },
    [isOpen, options, onValueChange],
  )

  const handleBlur = useCallback(() => {
    setOpen(false)
  }, [])

  const handleSelectOption = useCallback(
    (selectedOption: Option) => {
      setInputValue(selectedOption.label)
      onValueChange?.(selectedOption)
    },
    [onValueChange],
  )

  return (
    <CommandPrimitive onKeyDown={handleKeyDown}>
      <div>
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onValueChange={isLoading ? undefined : setInputValue}
          onBlur={handleBlur}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="fill-dark-soft text-sm"
          classNameContainer="border rounded-lg"
        />
      </div>
      <div className="relative">
        <div
          className={cn(
            'absolute top-1 z-10 hidden w-full rounded-lg bg-white outline-none animate-in fade-in-0 zoom-in-95',
            { block: isOpen },
          )}
        >
          <CommandList className="rounded-lg ring-1 ring-slate-200">
            {isLoading ? (
              <CommandPrimitive.Loading>
                <div className="p-1">
                  <Skeleton className="h-8 w-full" />
                </div>
              </CommandPrimitive.Loading>
            ) : null}
            {options.length > 0 && !isLoading ? (
              <CommandGroup className="p-2">
                {options.map((option) => {
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onMouseDown={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                      }}
                      onSelect={() => {
                        handleSelectOption(option)
                        setInputValue('')
                      }}
                      className="flex w-full items-center gap-2 rounded-md data-[selected=true]:bg-brand-fill-dark-soft"
                    >
                      <Avatar className="flex size-12 items-center justify-center rounded-lg">
                        <AvatarImage
                          src="https://github.com/shadcn.png"
                          alt="@shadcn"
                        />
                        <AvatarFallback>CN</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-semibold text-brand-text-dark">
                          {option.label}
                        </div>
                        <div className="text-sm font-medium text-brand-text-gray">
                          {option.email}
                        </div>
                      </div>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ) : null}
            {!isLoading ? (
              <CommandPrimitive.Empty className="select-none rounded-sm px-2 py-3 text-center text-sm">
                {emptyMessage}
              </CommandPrimitive.Empty>
            ) : null}
          </CommandList>
        </div>
      </div>
    </CommandPrimitive>
  )
}
