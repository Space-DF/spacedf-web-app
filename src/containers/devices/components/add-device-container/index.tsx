import { cn } from '@/lib/utils'

interface AddDeviceContainerProps {
  title: string
  description: string
  isSelected?: boolean
  isRecommended?: boolean
  icon: React.ReactNode
  handleNextStep: () => void
}

export const AddDeviceContainer = (
  props: React.PropsWithChildren<AddDeviceContainerProps>
) => {
  const {
    icon,
    isRecommended,
    isSelected,
    title,
    description,
    handleNextStep,
  } = props

  return (
    <div
      className={cn(
        'relative flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-transparent bg-brand-component-fill-gray-soft px-4 py-10 text-center',
        { 'border-brand-component-stroke-dark': isSelected }
      )}
      onClick={handleNextStep}
    >
      {isRecommended && (
        <div className="absolute right-2 top-2 rounded bg-brand-fill-outermost px-2 py-px text-xs font-semibold text-white">
          Recommend
        </div>
      )}
      {icon}
      <div className="font-semibold text-brand-component-text-dark">
        {title}
      </div>
      <div className="text-[13px] text-brand-component-text-gray">
        {description}
      </div>
    </div>
  )
}
