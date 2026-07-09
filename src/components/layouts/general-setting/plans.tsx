import { FREE_PLAN, PRO_PLAN, type PlanFeature } from '@/constants'
import { useOrganizationValidationStore } from '@/stores'
import { Check, Info } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import Image from 'next/image'
import PlanGradient from '/public/images/plan-gradient.webp'

const FeatureItem = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2">
    <Check size={20} className="shrink-0 text-brand-component-text-dark" />
    <p className="flex-1 text-sm leading-5 text-brand-component-text-dark">
      {children}
    </p>
  </div>
)

const Plans = () => {
  const t = useTranslations('generalSettings')
  const format = useFormatter()

  const isPro = useOrganizationValidationStore((state) => state.isPro)
  const plan = isPro ? PRO_PLAN : FREE_PLAN

  const translateFeature = (feature: PlanFeature) =>
    t(feature.key as any, feature.values)

  return (
    <div className="animate-opacity-display-effect flex flex-col">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-1 rounded-md border border-brand-component-stroke-dark-soft bg-brand-component-fill-dark-soft px-2 py-1">
          <Info
            size={16}
            className="shrink-0 text-brand-component-text-gray"
            aria-hidden
          />
          <p className="flex-1 text-xs font-semibold leading-[18px] text-brand-component-text-gray">
            {t('plans_contact_admin')}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[20px] border border-brand-component-stroke-dark-soft bg-brand-component-fill-light p-3">
          <div className="pointer-events-none absolute -bottom-[442px] -right-[382px] flex size-[690px] items-center justify-center">
            <Image
              src={PlanGradient}
              alt=""
              aria-hidden
              className="size-[564px] max-w-none -rotate-[75deg] -scale-y-100 object-cover"
            />
          </div>

          <div className="relative flex items-center gap-3 rounded-xl border border-brand-component-stroke-dark-soft bg-brand-background-fill-surface p-3 shadow-sm">
            <p className="flex-1 text-2xl font-semibold leading-9 text-brand-component-text-dark">
              {t(plan.nameKey as any)}
            </p>

            {plan.price !== undefined && (
              <div className="flex flex-col items-end">
                <div className="flex items-center">
                  <span className="self-center text-base font-medium leading-6 text-brand-component-text-gray">
                    $
                  </span>
                  <span className="text-3xl font-medium leading-[44px] text-brand-component-text-dark">
                    {plan.price}
                  </span>
                  <span className="p-2 text-xs font-medium leading-[18px] text-brand-component-text-gray">
                    {t('per_month')}
                    <br />
                    {t('billed_yearly')}
                  </span>
                </div>

                {plan.renewsAt && (
                  <p className="text-xs font-medium leading-[18px] text-brand-component-text-gray">
                    {t('renew_at')}{' '}
                    <span className="text-brand-component-text-dark">
                      {format.dateTime(new Date(plan.renewsAt), {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-3 pb-3 pt-5">
        {plan.features.map((feature) => (
          <FeatureItem key={feature.key}>
            {translateFeature(feature)}
          </FeatureItem>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-brand-component-stroke-dark-soft px-3 pb-3 pt-3">
        <p className="text-base font-semibold leading-6 text-brand-component-text-dark">
          {t('support')}
        </p>
        {plan.support.map((feature) => (
          <FeatureItem key={feature.key}>
            {translateFeature(feature)}
          </FeatureItem>
        ))}
      </div>
    </div>
  )
}

export default Plans
