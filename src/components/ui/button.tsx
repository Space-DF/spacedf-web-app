import * as React from 'react'
import { Slot, Slottable } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { LoaderCircle } from 'lucide-react'

const buttonVariants = cva(
  'text-[14px] inline-flex items-center justify-center whitespace-nowrap rounded-button font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90 border-[2px] border-primary',
        destructive: 'bg-brand-component-fill-accent shadow-sm text-white',
        outline:
          'border bg-secondary border-border shadow-sm hover:bg-accent hover:text-accent-foreground text-ring text-secondary-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        light:
          'bg-brand-component-fill-light-fixed text-brand-component-text-dark',
      },
      size: {
        default: 'h-9 px-4 py-2 rounded-button',
        sm: 'h-8 rounded-button px-3 text-xs',
        lg: 'h-10 rounded-button px-8',
        xl: 'h-14 rounded-button px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  size?: 'sm' | 'lg' | 'xl' | 'icon' | 'default'
  prefixCpn?: React.ReactNode
  suffixCpn?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading,
      children,
      prefixCpn,
      suffixCpn,
      disabled,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    const spinner = <LoaderCircle className="size-4 shrink-0 animate-spin" />

    const prefixNode = loading ? spinner : prefixCpn
    const hasAffix = !!prefixNode || !!suffixCpn

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          hasAffix && 'gap-2'
        )}
        ref={ref}
        disabled={loading || disabled}
        {...props}
      >
        {prefixNode}
        <Slottable>{children}</Slottable>
        {suffixCpn}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
