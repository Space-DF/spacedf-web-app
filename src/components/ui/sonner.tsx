'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        closeButton: true,
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg !font-medium',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
          closeButton: 'left-auto -right-4',
          success:
            '!bg-brand-component-fill-positive-soft !border-brand-component-stroke-positive !text-brand-component-text-positive',
          error:
            '!border-brand-component-stroke-negative !text-brand-component-text-negative !bg-brand-component-fill-negative-soft',
          info: '!border-brand-component-stroke-info !text-brand-component-text-info !bg-brand-component-fill-info-soft',
          warning:
            '!border-brand-component-stroke-warning !text-brand-component-text-warning !bg-brand-component-fill-warning-soft',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
