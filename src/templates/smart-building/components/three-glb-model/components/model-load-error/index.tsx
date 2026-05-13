import { Html } from '@react-three/drei'
import { useTranslations } from 'next-intl'

export function ModelLoadError({ onRetry }: { onRetry?: () => void }) {
  const t = useTranslations('smartBuilding')
  return (
    <Html center>
      <div className="w-72 overflow-hidden rounded-xl bg-gradient-to-b from-black/55 to-black/35 text-white shadow-lg ring-1 ring-white/10 backdrop-blur-md">
        <div className="px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 grid size-8 place-items-center rounded-lg bg-white/10 ring-1 ring-white/10">
              <span aria-hidden className="text-base leading-none">
                !
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-tight text-brand-component-text-gray">
                {t('model_load_error')}
              </div>
            </div>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white ring-1 ring-white/15 transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {t('model_load_retry')}
            </button>
          )}
        </div>
      </div>
    </Html>
  )
}
