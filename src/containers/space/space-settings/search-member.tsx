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
import { generateOrganizationDomain } from '@/utils'
import { useIdentityStore } from '@/stores/identity-store'
import { useShallow } from 'zustand/react/shallow'
import { Check } from 'lucide-react'

export type Option = Record<'value' | 'label' | 'email', string> &
  Record<string, string>

type AutoCompleteProps = {
  options: Option[]
  selectedItems: string[]
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
  value,
  onValueChange,
  disabled,
  selectedItems,
  isLoading = false,
  comma = ['Enter'],
}: AutoCompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState<string>(value?.label || '')
  const { organizationName } = useIdentityStore(
    useShallow((state) => ({
      organizationName: state.organizationName,
    })),
  )
  const organization = generateOrganizationDomain(organizationName || '')

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
        let optionToSelect = options.find(
          (option) => option.label === input.value,
        )
        const isEmail = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(input.value)
        if (!optionToSelect && isEmail) {
          optionToSelect = {
            email: input.value,
            value: input.value,
            label: input.value,
          }
        }
        if (optionToSelect) {
          onValueChange?.(optionToSelect)
          setInputValue('')
          handleBlur()
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
      setTimeout(() => {
        inputRef?.current?.blur()
      }, 0)
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
          classNameContainer="border rounded-lg focus-within:border-brand-dark-fill-secondary h-10"
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
                      value={option.email}
                      onMouseDown={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                      }}
                      onSelect={() => {
                        handleSelectOption(option)
                        setInputValue('')
                      }}
                      className={cn(
                        'relative flex w-full items-center gap-2 rounded-md data-[selected=true]:bg-brand-fill-dark-soft',
                        {
                          'bg-brand-fill-dark-soft': selectedItems.includes(
                            option.value,
                          ),
                        },
                      )}
                    >
                      <Avatar className="flex size-11 items-center justify-center rounded-lg">
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
                      <Check
                        className={cn('ml-auto h-4 w-4 opacity-0', {
                          'opacity-100': selectedItems.includes(option.value),
                        })}
                      />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            ) : null}
            {!isLoading ? (
              <CommandPrimitive.Empty className="p-2">
                <div className="flex w-full items-center gap-2 rounded-md bg-brand-fill-dark-soft p-2">
                  <Avatar className="flex size-11 items-center justify-center rounded-lg">
                    <AvatarImage
                      src="https://github.com/shadcn.png"
                      alt="@shadcn"
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-semibold text-brand-text-dark">
                      {inputValue}
                    </div>
                    <div className="text-sm font-medium text-brand-text-gray">
                      Invite to {organization || 'danang'}.spacedf
                    </div>
                  </div>
                </div>
              </CommandPrimitive.Empty>
            ) : null}
          </CommandList>
        </div>
      </div>
    </CommandPrimitive>
  )
}
