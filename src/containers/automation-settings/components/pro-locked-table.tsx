import { useTranslations } from 'next-intl'
import { Lock } from '@/components/icons'

export const ProLockedTable = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations('common')

  return (
    <div className="relative min-h-96 overflow-hidden rounded-xl border border-border">
      <div
        aria-hidden
        className="pointer-events-none select-none [mask-image:linear-gradient(to_bottom,#000_0px,#000_90px,transparent_235px)]"
      >
        {children}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-12 items-center gap-2 rounded-full bg-accent px-4 text-xl font-semibold text-brand-component-text-dark dark:text-white">
          <Lock className="size-6" />
          {t('available_in_pro')}
        </span>
      </div>
    </div>
  )
}
