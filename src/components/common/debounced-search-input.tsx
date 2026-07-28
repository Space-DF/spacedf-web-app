import { memo, useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { InputProps, InputWithIcon } from '@/components/ui/input'
import { useDebounce } from '@/hooks'
import { cn } from '@/lib/utils'

interface DebouncedSearchInputProps extends InputProps {
  onSearch: (value: string) => void
  placeholder?: string
  delay?: number
  iconSize?: number
  iconClassName?: string
  wrapperClass?: string
  className?: string
  type?: string
  disabled?: boolean
}

export const DebouncedSearchInput = memo(
  ({
    onSearch,
    placeholder,
    delay,
    iconSize = 18,
    iconClassName = 'text-muted-foreground',
    wrapperClass = 'w-full',
    className,
    type = 'text',
    ...props
  }: DebouncedSearchInputProps) => {
    const [value, setValue] = useState('')
    const debouncedValue = useDebounce(value, delay)

    useEffect(() => {
      onSearch(debouncedValue)
    }, [debouncedValue, onSearch])

    return (
      <InputWithIcon
        type={type}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        prefixCpn={
          <Search
            size={iconSize}
            className={cn('text-secondary-foreground', iconClassName)}
          />
        }
        wrapperClass={cn(
          'border border-border transition-shadow focus-within:border-[hsl(var(--primary))] focus-within:ring-2 focus-within:!ring-offset-0 focus-within:ring-[color:color-mix(in_srgb,hsl(var(--primary))_40%,transparent)]',
          wrapperClass
        )}
        className={className}
        {...props}
      />
    )
  }
)
DebouncedSearchInput.displayName = 'DebouncedSearchInput'
