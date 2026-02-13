import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { WidgetContainer } from '.'

interface Props {
  widget: any
  data: { value: number; unit_of_measurement: string }
}

export const ValueWidget = ({ widget, data }: Props) => {
  const t = useTranslations('dashboard')
  const { source, widget_info } = widget
  const { decimal, unit } = source
  const { value, unit_of_measurement } = data || {}
  const currentValue = useMemo(() => {
    if (!decimal || decimal < 0) return value.toFixed(0)
    if (decimal > 10) return value.toFixed(10)
    return value.toFixed(decimal)
  }, [value, decimal])

  return (
    <WidgetContainer>
      <div className="rounded-lg size-full p-2">
        <div className="flex gap-2 flex-col size-full">
          <div className="w-full">
            <div className="h-5">
              <p className="truncate font-semibold text-brand-component-text-dark">
                {widget_info?.name}
              </p>
            </div>

            <p className="text-[12px] text-brand-text-gray">{t('no_data')}</p>
          </div>
          <div className="grid flex-1 grid-cols-1 space-y-4">
            <span
              className="text-brand-component-text-dark text-2xl font-semibold truncate"
              style={{ color: `#${widget_info?.color}` }}
            >
              {`${currentValue} ${unit || unit_of_measurement}`}
            </span>
          </div>
        </div>
      </div>
    </WidgetContainer>
  )
}
