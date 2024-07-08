import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border border-brand-stroke-dark-soft bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

const InputWithIcon = React.forwardRef<
  HTMLInputElement,
  InputProps & {
    prefixCpn?: React.ReactNode
  }
>(({ className, type, prefixCpn, ...props }, ref) => {
  return (
    <div className="relative flex items-center max-w-2xl">
      <div className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform">
        {prefixCpn}
      </div>
      <Input
        className={cn("pl-8", className)}
        type={type}
        ref={ref}
        {...props}
      />
    </div>
  )
})

Input.displayName = "Input"
InputWithIcon.displayName = "InputWithIcon"

export { Input, InputWithIcon }
