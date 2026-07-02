import { memo, useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { InputWithIcon } from '@/components/ui/input'
import { useDebounce } from '@/hooks'
import { cn } from '@/lib/utils'

interface DebouncedSearchInputProps {
  /** Called with the debounced value whenever it changes. Must be stable (useCallback). */
  onSearch: (value: string) => void
  placeholder?: string
  /** Debounce delay in ms. Defaults to useDebounce's default (300ms). */
  delay?: number
  iconSize?: number
  iconClassName?: string
  wrapperClass?: string
  className?: string
  type?: string
}

/**
 * Search input that owns its own text state and debounces internally, reporting
 * only the debounced value up via `onSearch`. Keeping the per-keystroke state
 * local means typing re-renders just this small input — not the parent list it
 * filters — so the list only re-renders when the debounced query actually changes.
 */
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
      />
    )
  }
)
DebouncedSearchInput.displayName = 'DebouncedSearchInput'
