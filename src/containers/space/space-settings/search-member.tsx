import { Command as CommandPrimitive } from 'cmdk'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { cn } from '@/lib/utils'
import { type KeyboardEvent, useCallback, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { isEmail } from '@/utils/common'
import { useParams } from 'next/navigation'
export type Option = Record<'name' | 'email' | 'id', string> &
  Record<string, string>

type AutoCompleteProps = {
  options?: Option[]
  selectedItems: string[]
  value?: Option[]
  onValueChange?: (value: Option[]) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
  comma?: string[]
}

export const SearchMember = ({
  options = [],
  placeholder,
  onValueChange,
  disabled,
  selectedItems,
  comma = ['Enter'],
}: AutoCompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const [isOpen, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState<string>('')
  const { organization } = useParams()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current

      if (!input) return
      // This is not a default behaviour of the <input /> field
      if (
        comma?.includes(event.key) &&
        input.value !== '' &&
        isEmail(input.value)
      ) {
        const optionToSelect = options.filter(
          (option) => option.label === input.value
        )
        const users = input.value
          .split(',')
          .filter((item) => /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(item))
        if (users.length > 0) {
          users.forEach((item) => {
            optionToSelect.push({
              id: item,
              name: item,
              email: item,
            })
          })
        }
      }

      if (comma?.includes(event.key)) {
        input.focus()
      }
      if (event.key === 'Escape') {
        handleBlur()
      }
    },
    [isOpen, options, onValueChange]
  )

  const handleBlur = useCallback(() => {
    setOpen(false)
  }, [])

  const handleSelectOption = useCallback(
    (selectedOption: Option) => {
      setInputValue(selectedOption.label)
      onValueChange?.([selectedOption])
      setOpen(false)
      setInputValue('')
    },
    [onValueChange]
  )

  const handleChange = useCallback((value: string) => {
    setInputValue(value)
    setOpen(isEmail(value))
  }, [])

  const handleFocus = useCallback(() => {
    setOpen(isEmail(inputValue))
  }, [inputValue])

  return (
    <CommandPrimitive onKeyDown={handleKeyDown}>
      <div>
        <CommandInput
          ref={inputRef}
          value={inputValue}
          onValueChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="fill-dark-soft text-sm"
          classNameContainer="border rounded-lg focus-within:border-brand-dark-fill-secondary h-10 bg-brand-fill-dark-soft"
        />
      </div>
      <div className="relative">
        <div
          className={cn(
            'absolute top-1 z-10 hidden w-full rounded-lg bg-white outline-none animate-in fade-in-0 zoom-in-95',
            { block: isOpen }
          )}
        >
          <CommandList className="rounded-lg ring-1 ring-slate-200">
            <CommandGroup className="p-2">
              <CommandItem
                value={inputValue}
                onMouseDown={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
                onSelect={() => {
                  handleSelectOption({
                    id: uuidv4(),
                    name: '',
                    email: inputValue,
                  })
                }}
                className={cn(
                  'relative cursor-pointer flex w-full items-center gap-2 rounded-md data-[selected=true]:bg-brand-fill-dark-soft',
                  {
                    'bg-brand-fill-dark-soft':
                      selectedItems.includes(inputValue),
                  }
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
                    {inputValue}
                  </div>
                  <div className="text-sm font-medium text-brand-text-gray">
                    Invite to {organization || 'danang'}.spacedf.net
                  </div>
                </div>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </div>
      </div>
    </CommandPrimitive>
  )
}
