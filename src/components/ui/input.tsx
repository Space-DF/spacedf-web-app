import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startAdornment?: JSX.Element
  endAdornment?: JSX.Element
  isError?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, startAdornment, endAdornment, isError, ...props },
    ref
  ) => {
    const hasAdornment = Boolean(startAdornment) || Boolean(endAdornment)
    return (
      // <input
      //   type={type}
      //   className={cn(
      //     "flex h-9 w-full rounded-lg border bg-brand-fill-dark-soft dark:bg-brand-heading border-brand-stroke-dark-soft px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring dark:ring-brand-stroke-outermost disabled:cursor-not-allowed disabled:opacity-50 dark:text-white",
      //     props["aria-invalid"] && "!ring-red-500 border",
      //     className
      //   )}
      //   ref={ref}
      //   {...props}
      // />
      <>
        {hasAdornment ? (
          <div
            className={cn(
              'flex h-9 items-center justify-center gap-2 rounded-input border-brand-stroke-dark-soft bg-brand-fill-dark-soft px-3 ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-2 focus-visible:ring-ring data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 dark:bg-brand-heading dark:ring-brand-stroke-outermost',
              className
            )}
            data-disabled={props.disabled}
          >
            {startAdornment && (
              <div className={cn('text-muted-foreground')}>
                {startAdornment}
              </div>
            )}
            <input
              type={type}
              className={cn(
                'flex h-full w-full text-input-foreground rounded-input border-none py-2 text-sm shadow-none outline-none file:bg-transparent file:text-sm file:font-medium focus-within:border-ring focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-0 bg-input placeholder:text-muted-foreground',
                isError &&
                  '!ring-red-600 ring-2 ring-offset-2 bg-brand-component-fill-negative-soft'
              )}
              ref={ref}
              {...props}
            />
            {endAdornment && (
              <div className={cn('text-muted-foreground')}>{endAdornment}</div>
            )}
          </div>
        ) : (
          <input
            type={type}
            className={cn(
              'flex h-9 w-full rounded-input text-input-foreground border border-border bg-input px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-brand-component-text-gray focus:outline-none focus:border-[hsl(var(--primary))] focus:ring-2 focus:!ring-offset-0 focus:ring-[color:color-mix(in_srgb,hsl(var(--primary))_40%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-heading dark:ring-brand-stroke-outermost',
              className,
              isError &&
                'ring-red-600 ring-1 ring-offset-1 focus:ring-red-600 focus:ring-1 focus:ring-offset-1 bg-brand-component-fill-negative-soft'
            )}
            ref={ref}
            {...props}
          />
        )}
      </>
    )
  }
)

const InputWithIcon = React.forwardRef<
  HTMLInputElement,
  InputProps & {
    prefixCpn?: React.ReactNode
    suffixCpn?: React.ReactNode
    wrapperClass?: string
    isError?: boolean
  }
>(
  (
    {
      className,
      type,
      prefixCpn,
      suffixCpn,
      wrapperClass = '',
      isError,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cn(
          'relative flex max-w-2xl items-center border-border border rounded-input bg-input transition-shadow focus-within:border-[hsl(var(--primary))] focus-within:ring-2 focus-within:!ring-offset-0 focus-within:ring-[color:color-mix(in_srgb,hsl(var(--primary))_40%,transparent)]',
          wrapperClass
        )}
      >
        <div className="absolute left-2 top-1/2 -translate-y-1/2 transform text-brand-text-gray">
          {prefixCpn}
        </div>
        <Input
          className={cn(
            'h-9 border-none bg-input pl-8 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-secondary-foreground',
            {
              'pr-8': !!suffixCpn,
            },
            className
          )}
          type={type}
          ref={ref}
          isError={isError}
          {...props}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 transform text-brand-text-gray">
          {suffixCpn}
        </div>
      </div>
    )
  }
)

Input.displayName = 'Input'
InputWithIcon.displayName = 'InputWithIcon'

export { Input, InputWithIcon }
