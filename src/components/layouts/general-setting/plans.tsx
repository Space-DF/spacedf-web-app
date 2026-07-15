import { Skeleton } from '@/components/ui/skeleton'
import { useOrganizationValidationStore } from '@/stores'
import type { PlanFeature } from '@/types/plan'
import { Check, Info } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import Image from 'next/image'
import PlanGradient from '/public/images/plan-gradient.webp'
import { usePlan } from './hooks/usePlan'

const FeatureItem = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2">
    <Check size={20} className="shrink-0 text-brand-component-text-dark" />
    <p className="flex-1 text-sm leading-5 text-brand-component-text-dark">
      {children}
    </p>
  </div>
)

const ContactAdminBanner = ({ message }: { message: string }) => (
  <div className="mb-4 flex items-start gap-1 rounded-md border border-brand-component-stroke-dark-soft bg-brand-component-fill-dark-soft px-2 py-1">
    <Info
      size={16}
      className="shrink-0 text-brand-component-text-gray"
      aria-hidden
    />
    <p className="flex-1 text-xs font-semibold leading-[18px] text-brand-component-text-gray">
      {message}
    </p>
  </div>
)

const FeatureItemSkeleton = () => (
  <div className="flex items-start gap-2">
    <Skeleton className="size-5 shrink-0 rounded-full" />
    <Skeleton className="h-5 w-2/3" />
  </div>
)

const PlansSkeleton = () => (
  <div className="flex flex-col">
    <div className="relative overflow-hidden rounded-5 border border-brand-component-stroke-dark-soft bg-brand-component-fill-light p-3">
      <div className="relative flex items-center gap-3 rounded-xl border border-brand-component-stroke-dark-soft bg-brand-background-fill-surface p-3 shadow-sm">
        <Skeleton className="h-9 flex-1" />
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-11 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>

    <div className="flex flex-col gap-2 px-3 pb-3 pt-5">
      {Array.from({ length: 5 }).map((_, index) => (
        <FeatureItemSkeleton key={index} />
      ))}
    </div>

    <div className="flex flex-col gap-2 border-t border-brand-component-stroke-dark-soft px-3 pb-3 pt-3">
      <Skeleton className="h-6 w-20" />
      {Array.from({ length: 2 }).map((_, index) => (
        <FeatureItemSkeleton key={index} />
      ))}
    </div>
  </div>
)

const Plans = () => {
  const t = useTranslations('generalSettings')
  const format = useFormatter()

  const isPro = useOrganizationValidationStore((state) => state.isPro)
  const { data: plan, isLoading } = usePlan(isPro ? 'pro' : 'free')

  const formatFeatureLabel = (feature: PlanFeature) => {
    const { description, name } = feature.feature

    if (feature.limit_value == null) return description || name

    return `${format.number(feature.limit_value)} ${name}`
  }

  if (isLoading || !plan) {
    return (
      <div className="animate-opacity-display-effect flex flex-col">
        {!isPro && <ContactAdminBanner message={t('plans_contact_admin')} />}
        <PlansSkeleton />
      </div>
    )
  }

  const priceItem = plan.plan_items?.find((item) => item.is_active)
  const price = priceItem ? Number(priceItem.price) : undefined
  const features = plan.features.filter((feature) => feature.enabled)
  const supports = plan.support.filter((feature) => feature.enabled)

  return (
    <div className="animate-opacity-display-effect flex flex-col">
      {!isPro && <ContactAdminBanner message={t('plans_contact_admin')} />}

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
            {plan.name}
          </p>

          {price !== undefined && (
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <span className="self-center text-base font-medium leading-6 text-brand-component-text-gray">
                  $
                </span>
                <span className="text-3xl font-medium leading-[44px] text-brand-component-text-dark">
                  {format.number(price)}
                </span>
                <span className="p-2 text-xs font-medium leading-[18px] text-brand-component-text-gray">
                  {t('per_month')}
                  <br />
                  {t('billed_monthly')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 px-3 pb-3 pt-5">
        {features.map((feature) => (
          <FeatureItem key={feature.id}>
            {formatFeatureLabel(feature)}
          </FeatureItem>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-brand-component-stroke-dark-soft px-3 pb-3 pt-3">
        <p className="text-base font-semibold leading-6 text-brand-component-text-dark">
          {t('support')}
        </p>
        {supports.map((feature) => (
          <FeatureItem key={feature.id}>
            {formatFeatureLabel(feature)}
          </FeatureItem>
        ))}
      </div>
    </div>
  )
}

export default Plans
