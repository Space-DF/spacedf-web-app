import { cn } from '@/lib/utils'

export interface TypographyProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  > {}

const TypographyPrimary = ({ className, ...resProps }: TypographyProps) => {
  return (
    <p
      {...resProps}
      className={cn('text-brand-text-dark dark:text-white', className)}
    />
  )
}

const TypographySecondary = ({ className, ...resProps }: TypographyProps) => {
  return (
    <p
      {...resProps}
      className={cn(
        'text-brand-text-gray dark:text-brand-dark-text-gray',
        className
      )}
    />
  )
}

export { TypographyPrimary, TypographySecondary }
